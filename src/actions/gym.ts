'use server';

import { createClient } from '@/lib/supabase/server';
import { requireGymAccess, getUser } from '@/lib/supabase/auth-helpers';
import { gymSchema } from '@/lib/validations/gym';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { addDays, format } from 'date-fns';
import { DEFAULT_TRIAL_DAYS, DATE_FORMAT } from '@/lib/constants';
import type { Gym, SoftwareSubscription } from '@/types';

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

  const supabase = await createClient();

  // 1. Insert gym
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

  // 2. Link user as owner in gym_staff
  const { error: staffError } = await supabase.from('gym_staff').insert({
    gym_id: gymId,
    user_id: user.id,
    role: 'owner',
  });

  if (staffError) {
    return { error: 'Failed to assign owner role to gym.' };
  }

  // 3. Provision trial software subscription
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

  const supabase = await createClient();

  // Find staff record
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
