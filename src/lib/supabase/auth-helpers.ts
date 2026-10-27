import { cookies } from 'next/headers';
import { createClient } from './server';
import { isLocalPlaceholderMode, readLocalDb, writeLocalDb } from '@/lib/local-db';
import { assertActiveSubscription } from '@/lib/subscription';
import type { Gym, GymStaff, SoftwareSubscription } from '@/types';

export const LOCAL_SESSION_COOKIE = 'gym_local_session';
export const ACTIVE_GYM_COOKIE = 'bahibar_active_gym';
export const LOCAL_WORKSPACES_COOKIE = 'gym_local_workspaces';

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
      let user = db.users.find((u) => u.id === session.userId);
      if (!user && session.userId && session.email) {
        user = {
          id: session.userId,
          email: session.email,
          password_hash: '',
          full_name: session.fullName || 'Gym Owner',
          created_at: new Date().toISOString(),
        };
        db.users.push(user);
        try {
          writeLocalDb(db);
        } catch {}
      }
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

    // 1. Rehydrate workspaces from LOCAL_WORKSPACES_COOKIE if missing on ephemeral serverless containers
    const workspacesCookie = cookieStore.get(LOCAL_WORKSPACES_COOKIE)?.value;
    let cookieGyms: Gym[] = [];
    if (workspacesCookie) {
      try {
        cookieGyms = JSON.parse(workspacesCookie) as Gym[];
        let dbChanged = false;
        for (const cGym of cookieGyms) {
          if (!db.gyms.some((g) => g.id === cGym.id)) {
            db.gyms.push(cGym);
            dbChanged = true;
          }
          if (!db.gym_staff.some((s) => s.gym_id === cGym.id && s.user_id === user.id)) {
            db.gym_staff.push({
              id: crypto.randomUUID(),
              gym_id: cGym.id,
              user_id: user.id,
              role: 'owner',
              created_at: cGym.created_at || new Date().toISOString(),
            });
            dbChanged = true;
          }
          if (!db.software_subscriptions.some((sub) => sub.gym_id === cGym.id)) {
            const now = new Date();
            db.software_subscriptions.push({
              id: crypto.randomUUID(),
              gym_id: cGym.id,
              plan_name: 'Free Pilot',
              status: 'pilot',
              start_date: now.toISOString().split('T')[0],
              end_date: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
            });
            dbChanged = true;
          }
        }
        if (dbChanged) {
          try {
            writeLocalDb(db);
          } catch {}
        }
      } catch {}
    }

    let staffEntries = db.gym_staff.filter((s) => s.user_id === user.id);
    if (staffEntries.length === 0 && activeGymId) {
      const gym = db.gyms.find((g) => g.id === activeGymId);
      if (gym) {
        const entry: GymStaff = {
          id: crypto.randomUUID(),
          gym_id: activeGymId,
          user_id: user.id,
          role: 'owner',
          created_at: new Date().toISOString(),
        };
        db.gym_staff.push(entry);
        try {
          writeLocalDb(db);
        } catch {}
        staffEntries = [entry];
      }
    }

    // Fallback: If still no staff entry in db but cookieGyms exists, construct virtual owner staff entry
    if (staffEntries.length === 0 && cookieGyms.length > 0) {
      const targetGym = activeGymId ? (cookieGyms.find((g) => g.id === activeGymId) || cookieGyms[0]) : cookieGyms[0];
      return {
        id: crypto.randomUUID(),
        gym_id: targetGym.id,
        user_id: user.id,
        role: 'owner',
        created_at: targetGym.created_at || new Date().toISOString(),
      };
    }

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

  const cookieStore = await cookies();

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    const workspacesCookie = cookieStore.get(LOCAL_WORKSPACES_COOKIE)?.value;
    let cookieGyms: Gym[] = [];
    if (workspacesCookie) {
      try {
        cookieGyms = JSON.parse(workspacesCookie) as Gym[];
      } catch {}
    }

    const staffEntries = db.gym_staff.filter((s) => s.user_id === user.id);
    const gymMap = new Map(db.gyms.map((g) => [g.id, g]));
    for (const cg of cookieGyms) {
      if (!gymMap.has(cg.id)) {
        gymMap.set(cg.id, cg);
      }
    }

    const accessible = staffEntries
      .map((s) => ({ gym: gymMap.get(s.gym_id)!, role: s.role }))
      .filter((item) => Boolean(item.gym));

    if (accessible.length === 0 && cookieGyms.length > 0) {
      return cookieGyms.map((g) => ({ gym: g, role: 'owner' }));
    }

    return accessible;
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
    const existing = db.software_subscriptions.find((s) => s.gym_id === gymId);
    if (existing) return existing;

    const todayStr = new Date().toISOString().split('T')[0];
    const nextYearStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      id: 'sub-' + gymId,
      gym_id: gymId,
      plan_name: 'Free Pilot',
      status: 'pilot',
      start_date: todayStr,
      end_date: nextYearStr,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from('software_subscriptions')
    .select('*')
    .eq('gym_id', gymId)
    .single();

  if (!sub) {
    const todayStr = new Date().toISOString().split('T')[0];
    const nextYearStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      id: 'sub-' + gymId,
      gym_id: gymId,
      plan_name: 'Free Pilot',
      status: 'pilot',
      start_date: todayStr,
      end_date: nextYearStr,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return (sub as SoftwareSubscription);
}

/**
 * Require an active software license or valid trial for write mutations.
 * Throws if the gym's subscription has expired or grace period has passed.
 * Read-only navigation and CSV/JSON exports remain fully accessible.
 */
export async function requireActiveSubscription(gymId: string): Promise<void> {
  const sub = await getGymSoftwareSubscription(gymId);
  // Free pilot strategy: gyms in the free pilot or with pilot status are never locked out
  if (!sub || sub.status === 'pilot' || sub.plan_name === 'pilot' || sub.plan_name === 'Free Pilot' || process.env.NEXT_PUBLIC_FREE_PILOT !== 'false') {
    return;
  }
  assertActiveSubscription(sub);
}
