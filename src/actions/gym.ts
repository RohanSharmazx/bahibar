'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import {
  requireGymAccess,
  getUser,
  getUserGymStaff,
  getUserAccessibleGyms,
  ACTIVE_GYM_COOKIE,
  LOCAL_SESSION_COOKIE,
} from '@/lib/supabase/auth-helpers';
import { gymSchema } from '@/lib/validations/gym';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { addDays, format } from 'date-fns';
import { DEFAULT_TRIAL_DAYS, DATE_FORMAT } from '@/lib/constants';
import { evaluateSubscription } from '@/lib/subscription';
import { isLocalPlaceholderMode, readLocalDb, writeLocalDb } from '@/lib/local-db';
import type { Gym, SoftwareSubscription } from '@/types';
import crypto from 'crypto';

export type GymActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createGymAction(
  prevState: GymActionState | null,
  formData: FormData
): Promise<GymActionState> {
  const user = await getUser();
  if (!user) {
    return { error: 'Authentication required. Please sign in.' };
  }

  const rawData = Object.fromEntries(formData.entries());
  const parsed = gymSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: 'Please correct the gym details.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Local Development Fallback Mode
  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const gymId = crypto.randomUUID();
    const now = new Date().toISOString();
    const today = new Date();
    const trialEnd = addDays(today, DEFAULT_TRIAL_DAYS);

    const newGym: Gym = {
      id: gymId,
      name: parsed.data.name,
      owner_name: parsed.data.owner_name,
      contact_number: parsed.data.contact_number,
      address: parsed.data.address || null,
      created_at: now,
      updated_at: now,
    };

    db.gyms.push(newGym);
    db.gym_staff.push({
      id: crypto.randomUUID(),
      gym_id: gymId,
      user_id: user.id,
      role: 'owner',
      created_at: now,
    });

    db.software_subscriptions.push({
      id: crypto.randomUUID(),
      gym_id: gymId,
      plan_name: 'trial',
      status: 'trial',
      start_date: format(today, DATE_FORMAT.input),
      end_date: format(trialEnd, DATE_FORMAT.input),
      created_at: now,
      updated_at: now,
    });

    writeLocalDb(db);
    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_GYM_COOKIE, gymId, { path: '/', sameSite: 'lax' });
    redirect('/dashboard');
  }

  // Cloud Supabase Mode
  const supabase = await createClient();
  const gymId = crypto.randomUUID();

  const { error: gymError } = await supabase
    .from('gyms')
    .insert({
      id: gymId,
      name: parsed.data.name,
      owner_name: parsed.data.owner_name,
      contact_number: parsed.data.contact_number,
      address: parsed.data.address || null,
    });

  if (gymError) {
    return { error: gymError.message || 'Failed to create gym profile.' };
  }

  const { error: staffError } = await supabase.from('gym_staff').insert({
    gym_id: gymId,
    user_id: user.id,
    role: 'owner',
  });

  if (staffError) {
    return { error: 'Failed to assign owner role to gym.' };
  }

  const today = new Date();
  const trialEnd = addDays(today, DEFAULT_TRIAL_DAYS);

  const { error: subError } = await supabase.from('software_subscriptions').insert({
    gym_id: gymId,
    plan_name: 'trial',
    status: 'trial',
    start_date: format(today, DATE_FORMAT.input),
    end_date: format(trialEnd, DATE_FORMAT.input),
  });

  if (subError) {
    console.error('Failed to initialize trial software subscription:', subError.message);
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_GYM_COOKIE, gymId, { path: '/', sameSite: 'lax' });
  redirect('/dashboard');
}

export async function updateGymAction(
  prevState: GymActionState | null,
  formData: FormData
): Promise<GymActionState> {
  try {
    const { gymId, role } = await requireGymAccess();
    if (role !== 'owner') {
      return { error: 'Only gym owners can update gym profile settings.' };
    }

    const rawData = Object.fromEntries(formData.entries());
    const parsed = gymSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        error: 'Please correct the gym details.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      const gym = db.gyms.find((g) => g.id === gymId);
      if (gym) {
        gym.name = parsed.data.name;
        gym.owner_name = parsed.data.owner_name;
        gym.contact_number = parsed.data.contact_number;
        gym.address = parsed.data.address || null;
        gym.updated_at = new Date().toISOString();
        writeLocalDb(db);
      }
      revalidatePath('/settings');
      revalidatePath('/dashboard');
      return { success: true };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('gyms')
      .update({
        name: parsed.data.name,
        owner_name: parsed.data.owner_name,
        contact_number: parsed.data.contact_number,
        address: parsed.data.address || null,
      })
      .eq('id', gymId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update gym.' };
  }
}

export async function getCurrentGymData(): Promise<{
  gym: Gym | null;
  subscription: SoftwareSubscription | null;
  userName?: string;
  role?: string;
  accessibleGyms: { gym: Gym; role: string }[];
}> {
  const user = await getUser();
  if (!user) return { gym: null, subscription: null, accessibleGyms: [] };

  const [staff, accessibleGyms] = await Promise.all([
    getUserGymStaff(),
    getUserAccessibleGyms(),
  ]);

  if (!staff) {
    return {
      gym: null,
      subscription: null,
      userName: user.user_metadata?.full_name || 'Gym Owner',
      accessibleGyms: [],
    };
  }

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const gym = db.gyms.find((g) => g.id === staff.gym_id) || null;
    const rawSubscription = db.software_subscriptions.find((s) => s.gym_id === staff.gym_id) || null;
    const subscription = rawSubscription
      ? { ...rawSubscription, status: evaluateSubscription(rawSubscription).effectiveStatus }
      : null;

    return {
      gym,
      subscription,
      userName: user.user_metadata?.full_name || gym?.owner_name || 'Gym Owner',
      role: staff.role,
      accessibleGyms,
    };
  }

  const supabase = await createClient();

  const [{ data: gym }, { data: rawSubscription }] = await Promise.all([
    supabase.from('gyms').select('*').eq('id', staff.gym_id).single(),
    supabase.from('software_subscriptions').select('*').eq('gym_id', staff.gym_id).single(),
  ]);

  const subscription = rawSubscription
    ? { ...(rawSubscription as SoftwareSubscription), status: evaluateSubscription(rawSubscription as SoftwareSubscription).effectiveStatus }
    : null;

  return {
    gym: gym as Gym,
    subscription,
    userName: user.user_metadata?.full_name || gym?.owner_name || 'Gym Owner',
    role: staff.role,
    accessibleGyms,
  };
}

export async function switchWorkspaceAction(targetGymId: string): Promise<void> {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  const accessible = await getUserAccessibleGyms();
  const hasAccess = accessible.some((item) => item.gym.id === targetGymId);
  if (!hasAccess) {
    throw new Error('Unauthorized workspace access.');
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_GYM_COOKIE, targetGymId, {
    path: '/',
    sameSite: 'lax',
  });

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export type DeleteGymActionState = {
  success?: boolean;
  error?: string;
};

export async function deleteGymAction(
  prevState: DeleteGymActionState | null,
  formData: FormData
): Promise<DeleteGymActionState> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Authentication required. Please sign in.' };
    }

    const { gymId, role } = await requireGymAccess();
    if (role !== 'owner') {
      return { error: 'Only gym owners have permission to delete this gym workspace.' };
    }

    const confirmName = (formData.get('confirm_name') as string)?.trim() || '';
    const password = (formData.get('password') as string) || '';

    if (!confirmName) {
      return { error: 'Please enter the gym name to confirm deletion.' };
    }

    if (!password) {
      return { error: 'Please enter your password to confirm identity.' };
    }

    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      const gym = db.gyms.find((g) => g.id === gymId);
      if (!gym) {
        return { error: 'Gym workspace not found.' };
      }

      if (confirmName !== gym.name.trim()) {
        return { error: 'Gym name does not match. Deletion cancelled.' };
      }

      // Verify owner password
      const localUser = db.users.find((u) => u.id === user.id);
      if (!localUser) {
        return { error: 'Owner account not found.' };
      }

      const inputHash = crypto.createHash('sha256').update(password).digest('hex');
      if (inputHash !== localUser.password_hash) {
        return { error: 'Incorrect password. Deletion cancelled.' };
      }

      // Cascade delete all gym data
      const gymMembers = db.members.filter((m) => m.gym_id === gymId);
      const memberIds = new Set(gymMembers.map((m) => m.id));

      db.payments = db.payments.filter((p) => p.gym_id !== gymId && !memberIds.has(p.member_id));
      db.member_memberships = db.member_memberships.filter((mm) => mm.gym_id !== gymId && !memberIds.has(mm.member_id));
      db.members = db.members.filter((m) => m.gym_id !== gymId);
      db.membership_plans = db.membership_plans.filter((mp) => mp.gym_id !== gymId);
      db.software_subscriptions = db.software_subscriptions.filter((ss) => ss.gym_id !== gymId);
      db.gym_staff = db.gym_staff.filter((gs) => gs.gym_id !== gymId);
      db.gyms = db.gyms.filter((g) => g.id !== gymId);

      writeLocalDb(db);
    } else {
      const supabase = await createClient();

      // Verify owner's password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password,
      });

      if (authError) {
        return { error: 'Incorrect password. Deletion cancelled.' };
      }

      // Fetch gym to verify name
      const { data: gym, error: fetchError } = await supabase
        .from('gyms')
        .select('name')
        .eq('id', gymId)
        .single();

      if (fetchError || !gym) {
        return { error: 'Gym workspace not found.' };
      }

      if (confirmName !== gym.name.trim()) {
        return { error: 'Gym name does not match. Deletion cancelled.' };
      }

      // Execute deletion (RLS policy and FK ON DELETE CASCADE handles the rest)
      const { error: deleteError } = await supabase
        .from('gyms')
        .delete()
        .eq('id', gymId);

      if (deleteError) {
        return { error: deleteError.message || 'Failed to delete gym workspace.' };
      }
    }

    // Check remaining accessible gyms for this user
    let remainingGymIds: string[] = [];
    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      remainingGymIds = db.gym_staff
        .filter((s) => s.user_id === user.id)
        .map((s) => s.gym_id);
    } else {
      const supabase = await createClient();
      const { data: remainingStaff } = await supabase
        .from('gym_staff')
        .select('gym_id')
        .eq('user_id', user.id);
      remainingGymIds = (remainingStaff || []).map((s) => s.gym_id);
    }

    const cookieStore = await cookies();

    if (remainingGymIds.length > 0) {
      // User has other gym workspaces: switch to the next available workspace
      cookieStore.set(ACTIVE_GYM_COOKIE, remainingGymIds[0], {
        path: '/',
        sameSite: 'lax',
      });
      revalidatePath('/', 'layout');
      redirect('/dashboard?deleted=true&switched=true');
    } else {
      // No remaining workspaces: completely sign out of the session and redirect to homepage
      if (isLocalPlaceholderMode()) {
        cookieStore.delete(LOCAL_SESSION_COOKIE);
      } else {
        const supabase = await createClient();
        await supabase.auth.signOut();
      }
      cookieStore.delete(ACTIVE_GYM_COOKIE);
      revalidatePath('/', 'layout');
      redirect('/?deleted=true');
    }
  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT' || err?.digest?.includes('NEXT_REDIRECT')) {
      throw err;
    }
    return { error: err.message || 'An unexpected error occurred while deleting the gym.' };
  }
}
