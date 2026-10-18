import fs from 'fs';
import path from 'path';
import type {
  Gym,
  GymStaff,
  Member,
  MemberMembership,
  MembershipPlan,
  Payment,
  Profile,
  SoftwareSubscription,
} from '@/types';

export interface LocalUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: string;
}

interface LocalDatabase {
  users: LocalUser[];
  profiles: Profile[];
  gyms: Gym[];
  gym_staff: GymStaff[];
  membership_plans: MembershipPlan[];
  members: Member[];
  member_memberships: MemberMembership[];
  payments: Payment[];
  software_subscriptions: SoftwareSubscription[];
}

const DB_FILE = path.join(process.cwd(), '.local-db.json');

function getDefaultDb(): LocalDatabase {
  return {
    users: [],
    profiles: [],
    gyms: [],
    gym_staff: [],
    membership_plans: [],
    members: [],
    member_memberships: [],
    payments: [],
    software_subscriptions: [],
  };
}

export function readLocalDb(): LocalDatabase {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const defaultData = getDefaultDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return getDefaultDb();
  }
}

export function writeLocalDb(data: LocalDatabase): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save to local-db.json:', err);
  }
}

export function isLocalPlaceholderMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return (
    url.includes('placeholder') ||
    key.includes('placeholder') ||
    !url.startsWith('https://')
  );
}
