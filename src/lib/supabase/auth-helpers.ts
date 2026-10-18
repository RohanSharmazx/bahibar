import { cookies } from 'next/headers';
import { createClient } from './server';
import { isLocalPlaceholderMode, readLocalDb } from '@/lib/local-db';
import type { GymStaff } from '@/types';

export const LOCAL_SESSION_COOKIE = 'gym_local_session';

export interface LocalSession {
  userId: string;
  email: string;
  fullName: string;
}

/**
 * Get the current authenticated user.
 * Supports both real Supabase Auth and local development mode when in placeholder mode.
 */
export async function getUser() {
  if (isLocalPlaceholderMode()) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(LOCAL_SESSION_COOKIE);
    if (!sessionCookie?.value) return null;

    try {
      const session = JSON.parse(sessionCookie.value) as LocalSession;
      const db = readLocalDb();
      const user = db.users.find((u) => u.id === session.userId);
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.full_name,
        },
      };
    } catch {
      return null;
    }
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Get the current user's gym staff record.
 * Returns the first gym the user belongs to.
 */
export async function getUserGymStaff(): Promise<GymStaff | null> {
  const user = await getUser();
  if (!user) return null;

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const staff = db.gym_staff.find((s) => s.user_id === user.id);
    return staff || null;
  }

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
