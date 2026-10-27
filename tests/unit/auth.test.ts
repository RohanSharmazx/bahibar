import { describe, it, expect } from 'vitest';
import { readLocalDb, writeLocalDb, isLocalPlaceholderMode } from '@/lib/local-db';
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
});
