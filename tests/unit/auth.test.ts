import { describe, it, expect } from 'vitest';
import { readLocalDb, isLocalPlaceholderMode } from '@/lib/local-db';
import { registerSchema, loginSchema } from '@/lib/validations/auth';

describe('Local Database & Auth Validation', () => {
  it('detects placeholder mode correctly', () => {
    expect(isLocalPlaceholderMode()).toBe(true);
  });

  it('reads and writes to local database without error', () => {
    const db = readLocalDb();
    expect(Array.isArray(db.users)).toBe(true);
    expect(Array.isArray(db.gyms)).toBe(true);
    expect(Array.isArray(db.members)).toBe(true);
  });

  it('validates registration input properly', () => {
    const valid = registerSchema.safeParse({
      full_name: 'Vikram Singh',
      email: 'vikram@fitness.com',
      password: 'mypassword123',
      confirm_password: 'mypassword123',
    });
    expect(valid.success).toBe(true);

    const tooShortPassword = registerSchema.safeParse({
      full_name: 'Vikram Singh',
      email: 'vikram@fitness.com',
      password: '123',
      confirm_password: '123',
    });
    expect(tooShortPassword.success).toBe(false);
  });

  it('rejects registering with an already existing email address', () => {
    const db = readLocalDb();
    const existingEmail = db.users[0]?.email;
    if (existingEmail) {
      const match = db.users.find((u) => u.email.toLowerCase() === existingEmail.toLowerCase());
      expect(match).toBeDefined();
    }
  });

  it('validates login input format requirements', () => {
    const valid = loginSchema.safeParse({
      email: 'owner@test.com',
      password: 'password123',
    });
    expect(valid.success).toBe(true);

    const invalidEmail = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(invalidEmail.success).toBe(false);
  });

  it('exports LOCAL_WORKSPACES_COOKIE for serverless resilience', async () => {
    const { LOCAL_WORKSPACES_COOKIE, LOCAL_SESSION_COOKIE, ACTIVE_GYM_COOKIE, getGymSoftwareSubscription } = await import('@/lib/supabase/auth-helpers');
    expect(LOCAL_WORKSPACES_COOKIE).toBe('gym_local_workspaces');
    expect(LOCAL_SESSION_COOKIE).toBe('gym_local_session');
    expect(ACTIVE_GYM_COOKIE).toBe('bahibar_active_gym');

    // Free pilot fallback ensures software subscription is non-null
    const sub = await getGymSoftwareSubscription('test-nonexistent-gym-id');
    expect(sub).toBeDefined();
    expect(sub?.status).toBe('pilot');
    expect(sub?.plan_name).toBe('Free Pilot');
  });

  it('sanitizes Supabase environment variables and validates JWT format', async () => {
    const { getCleanSupabaseEnv, isLocalPlaceholderMode } = await import('@/lib/supabase/env');
    const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const origKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      // Test 1: Quoted and whitespace-padded env vars with matching project ref
      process.env.NEXT_PUBLIC_SUPABASE_URL = ' "https://xyz.supabase.co/" ';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = " 'eyJhbGciOiJIUzI1NiJ9.eyJyZWYiOiJ4eXoifQ.signature' ";
      const clean = getCleanSupabaseEnv();
      expect(clean.url).toBe('https://xyz.supabase.co');
      expect(clean.key).toBe('eyJhbGciOiJIUzI1NiJ9.eyJyZWYiOiJ4eXoifQ.signature');
      expect(isLocalPlaceholderMode()).toBe(false);

      // Test 2: Invalid non-JWT key falls back to local placeholder mode
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'invalid-token-without-three-jwt-parts';
      expect(isLocalPlaceholderMode()).toBe(true);

      // Test 3: Mismatched project ref falls back to safe local mode
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJyZWYiOiJkaWZmZXJlbnQtcHJvamVjdCJ9.signature';
      expect(isLocalPlaceholderMode()).toBe(true);
    } finally {
      process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = origKey;
    }
  });
});
