'use server';

import { createClient } from '@/lib/supabase/server';
import { requireGymAccess, getUser } from '@/lib/supabase/auth-helpers';
import { gymSchema } from '@/lib/validations/gym';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { addDays, format } from 'date-fns';
import { DEFAULT_TRIAL_DAYS, DATE_FORMAT } from '@/lib/constants';
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
    redirect('/dashboard');
  }

  // Cloud Supabase Mode
  const supabase = await createClient();

  const { data: gymData, error: gymError } = await supabase
    .from('gyms')
    .insert({
      name: parsed.data.name,
      owner_name: parsed.data.owner_name,
      contact_number: parsed.data.contact_number,
      address: parsed.data.address || null,
    })
    .select('id')
    .single();

  if (gymError || !gymData) {
    return { error: gymError?.message || 'Failed to create gym profile.' };
  }

  const gymId = gymData.id;

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

  await supabase.from('software_subscriptions').insert({
    gym_id: gymId,
    plan_name: 'trial',
    status: 'trial',
    start_date: format(today, DATE_FORMAT.input),
    end_date: format(trialEnd, DATE_FORMAT.input),
  });

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
}> {
  const user = await getUser();
  if (!user) return { gym: null, subscription: null };

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const staff = db.gym_staff.find((s) => s.user_id === user.id);
    if (!staff) {
      return {
        gym: null,
        subscription: null,
        userName: user.user_metadata?.full_name || 'Gym Owner',
      };
    }

    const gym = db.gyms.find((g) => g.id === staff.gym_id) || null;
    const subscription = db.software_subscriptions.find((s) => s.gym_id === staff.gym_id) || null;

    return {
      gym,
      subscription,
      userName: user.user_metadata?.full_name || gym?.owner_name || 'Gym Owner',
    };
  }

  const supabase = await createClient();

  const { data: staff } = await supabase
    .from('gym_staff')
    .select('gym_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!staff) {
    return {
      gym: null,
      subscription: null,
      userName: user.user_metadata?.full_name || 'Gym Owner',
    };
  }

  const [{ data: gym }, { data: subscription }] = await Promise.all([
    supabase.from('gyms').select('*').eq('id', staff.gym_id).single(),
    supabase.from('software_subscriptions').select('*').eq('gym_id', staff.gym_id).single(),
  ]);

  return {
    gym: gym as Gym,
    subscription: subscription as SoftwareSubscription,
    userName: user.user_metadata?.full_name || gym?.owner_name || 'Gym Owner',
  };
}
