import { cookies } from 'next/headers';
import { createClient } from './server';
import { isLocalPlaceholderMode, readLocalDb } from '@/lib/local-db';
import { assertActiveSubscription } from '@/lib/subscription';
import type { Gym, GymStaff, SoftwareSubscription } from '@/types';

export const LOCAL_SESSION_COOKIE = 'gym_local_session';
export const ACTIVE_GYM_COOKIE = 'bahibar_active_gym';

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
 * Supports workspace selection via ACTIVE_GYM_COOKIE or preferredGymId parameter.
 * Falls back to the user's primary/first gym.
 */
export async function getUserGymStaff(preferredGymId?: string): Promise<GymStaff | null> {
  const user = await getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const activeGymId = preferredGymId || cookieStore.get(ACTIVE_GYM_COOKIE)?.value;

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const staffEntries = db.gym_staff.filter((s) => s.user_id === user.id);
    if (staffEntries.length === 0) return null;

    if (activeGymId) {
      const match = staffEntries.find((s) => s.gym_id === activeGymId);
      if (match) return match;
    }

    return staffEntries[0];
  }

  const supabase = await createClient();
  const { data: staffList, error } = await supabase
    .from('gym_staff')
    .select('*')
    .eq('user_id', user.id);

  if (error || !staffList || staffList.length === 0) return null;

  if (activeGymId) {
    const match = staffList.find((s) => s.gym_id === activeGymId);
    if (match) return match as GymStaff;
  }

  return staffList[0] as GymStaff;
}

/**
 * Get all gyms the current user has access to (owned or staffed).
 */
export async function getUserAccessibleGyms(): Promise<{ gym: Gym; role: string }[]> {
  const user = await getUser();
  if (!user) return [];

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const staffEntries = db.gym_staff.filter((s) => s.user_id === user.id);
    const gymMap = new Map(db.gyms.map((g) => [g.id, g]));
    return staffEntries
      .map((s) => ({ gym: gymMap.get(s.gym_id)!, role: s.role }))
      .filter((item) => Boolean(item.gym));
  }

  const supabase = await createClient();
  const { data: staffList } = await supabase
    .from('gym_staff')
    .select('gym_id, role')
    .eq('user_id', user.id);

  if (!staffList || staffList.length === 0) return [];

  const gymIds = staffList.map((s) => s.gym_id);
  const { data: gyms } = await supabase
    .from('gyms')
    .select('*')
    .in('id', gymIds);

  if (!gyms) return [];
  const roleMap = new Map(staffList.map((s) => [s.gym_id, s.role]));
  return gyms.map((g) => ({ gym: g as Gym, role: roleMap.get(g.id) || 'staff' }));
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

/**
 * Fetch the gym's raw software subscription record from the active database.
 */
export async function getGymSoftwareSubscription(gymId: string): Promise<SoftwareSubscription | null> {
  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    return db.software_subscriptions.find((s) => s.gym_id === gymId) || null;
  }

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from('software_subscriptions')
    .select('*')
    .eq('gym_id', gymId)
    .single();

  return (sub as SoftwareSubscription) || null;
}

/**
 * Require an active software license or valid trial for write mutations.
 * Throws if the gym's subscription has expired or grace period has passed.
 * Read-only navigation and CSV/JSON exports remain fully accessible.
 */
export async function requireActiveSubscription(gymId: string): Promise<void> {
  const sub = await getGymSoftwareSubscription(gymId);
  assertActiveSubscription(sub);
}
