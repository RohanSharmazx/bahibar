import { createClient } from './server';
import type { GymStaff } from '@/types';

/**
 * Get the current authenticated user.
 * Returns null if not authenticated.
 */
export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Get the current user's gym staff record.
 * Returns the first gym the user belongs to.
 * In v1, each user has exactly one gym.
 */
export async function getUserGymStaff(): Promise<GymStaff | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('gym_staff')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as GymStaff;
}

/**
 * Get the current user's gym ID.
 * Returns null if user has no gym (needs onboarding).
 */
export async function getUserGymId(): Promise<string | null> {
  const staffRecord = await getUserGymStaff();
  return staffRecord?.gym_id ?? null;
}

/**
 * Require authentication and gym ownership.
 * Throws if user is not authenticated or doesn't belong to any gym.
 * Use in Server Actions to protect mutations.
 */
export async function requireGymAccess(): Promise<{ userId: string; gymId: string; role: string }> {
  const user = await getUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  const staffRecord = await getUserGymStaff();
  if (!staffRecord) {
    throw new Error('Gym access required');
  }

  return {
    userId: user.id,
    gymId: staffRecord.gym_id,
    role: staffRecord.role,
  };
}
