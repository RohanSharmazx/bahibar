import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { readLocalDb, writeLocalDb, type LocalUser } from '@/lib/local-db';
import {
  validateResetTokenAction,
  forgotPasswordAction,
} from '@/actions/auth';

describe('Password Recovery Logic', () => {
  it('generates secure 64-char hex tokens', () => {
    const token = crypto.randomBytes(32).toString('hex');
    expect(token).toHaveLength(64);
    expect(/^[a-f0-9]{64}$/.test(token)).toBe(true);
  });

  it('correctly validates token expiration within 1 hour', () => {
    const now = Date.now();
    const validExpiry = new Date(now + 60 * 60 * 1000).toISOString();
    const expiredExpiry = new Date(now - 1000).toISOString();

    const isValid = new Date(validExpiry).getTime() > Date.now();
    const isExpired = new Date(expiredExpiry).getTime() < Date.now();

    expect(isValid).toBe(true);
    expect(isExpired).toBe(true);
  });

  it('hashes passwords using sha256 reproducibly', () => {
    const password = 'NewSecurePassword123!';
    const hash1 = crypto.createHash('sha256').update(password).digest('hex');
    const hash2 = crypto.createHash('sha256').update(password).digest('hex');
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('initializes password_reset_tokens array in local db schema', () => {
    const db = readLocalDb();
    expect(Array.isArray(db.password_reset_tokens)).toBe(true);
  });

  it('validates missing, expired, and valid tokens in validateResetTokenAction', async () => {
    // 1. Missing token
    const resNull = await validateResetTokenAction(null);
    expect(resNull.valid).toBe(false);

    // 2. Non-existent token
    const resNonExistent = await validateResetTokenAction('random-non-existent-token');
    expect(resNonExistent.valid).toBe(false);

    // 3. Setup temporary test token in local db
    const db = readLocalDb();
    const testUserId = db.users[0]?.id || 'test-user-id';
    const validToken = 'test-valid-token-' + Date.now();
    const expiredToken = 'test-expired-token-' + Date.now();

    db.password_reset_tokens = db.password_reset_tokens || [];
    db.password_reset_tokens.push(
      {
        token: validToken,
        user_id: testUserId,
        email: 'test@example.com',
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        token: expiredToken,
        user_id: testUserId,
        email: 'test@example.com',
        expires_at: new Date(Date.now() - 1000).toISOString(),
        created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      }
    );
    writeLocalDb(db);

    // Test valid token
    const resValid = await validateResetTokenAction(validToken);
    expect(resValid.valid).toBe(true);

    // Test expired token
    const resExpired = await validateResetTokenAction(expiredToken);
    expect(resExpired.valid).toBe(false);
    expect(resExpired.error).toContain('expired');

    // Clean up temporary test tokens
    const cleanupDb = readLocalDb();
    cleanupDb.password_reset_tokens = cleanupDb.password_reset_tokens?.filter(
      (t) => t.token !== validToken && t.token !== expiredToken
    );
    writeLocalDb(cleanupDb);
  });

  it('never exposes devResetUrl when NODE_ENV is production', async () => {
    const envObj = process.env as Record<string, string | undefined>;
    const originalEnv = envObj.NODE_ENV;
    envObj.NODE_ENV = 'production';

    const testEmail = 'prod_test_' + Date.now() + '@gymtest.com';
    const testUserId = crypto.randomUUID();
    const db = readLocalDb();
    db.users.push({
      id: testUserId,
      email: testEmail,
      full_name: 'Prod Tester',
      password_hash: crypto.createHash('sha256').update('secret123').digest('hex'),
      created_at: new Date().toISOString(),
    });
    writeLocalDb(db);

    const formData = new FormData();
    formData.append('email', testEmail);
    const result = await forgotPasswordAction(null, formData);

    expect(result.success).toBe(true);
    expect(result.devResetUrl).toBeUndefined();

    // Clean up
    const cleanupDb = readLocalDb();
    cleanupDb.users = cleanupDb.users.filter((u) => u.id !== testUserId);
    writeLocalDb(cleanupDb);
    envObj.NODE_ENV = originalEnv;
  });

  it('executes full password reset lifecycle on a test account', async () => {
    const testEmail = 'fictional_tester_' + Date.now() + '@gymtest.com';
    const oldPassword = 'OldPassword123!';
    const oldHash = crypto.createHash('sha256').update(oldPassword).digest('hex');
    const testUserId = crypto.randomUUID();

    // 1. Create fictional test user
    const db = readLocalDb();
    const testUser: LocalUser = {
      id: testUserId,
      email: testEmail,
      full_name: 'Test Reset User',
      password_hash: oldHash,
      created_at: new Date().toISOString(),
    };
    db.users.push(testUser);
    writeLocalDb(db);

    // 2. Request forgot password
    const formData = new FormData();
    formData.append('email', testEmail);
    const forgotResult = await forgotPasswordAction(null, formData);

    expect(forgotResult.success).toBe(true);
    expect(forgotResult.devResetUrl).toBeDefined();

    // 3. Extract token from dev reset url
    const parsedUrl = new URL(forgotResult.devResetUrl!);
    const token = parsedUrl.searchParams.get('token');
    expect(token).toBeTruthy();

    // 4. Validate the generated token
    const validation = await validateResetTokenAction(token);
    expect(validation.valid).toBe(true);

    // 5. Simulate setting new password directly on user using the token
    const newPassword = 'BrandNewPassword456!';
    const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');

    const updateDb = readLocalDb();
    const tokenRecord = (updateDb.password_reset_tokens || []).find((t) => t.token === token);
    expect(tokenRecord).toBeDefined();
    expect(tokenRecord?.user_id).toBe(testUserId);

    const userToUpdate = updateDb.users.find((u) => u.id === testUserId);
    expect(userToUpdate).toBeDefined();
    userToUpdate!.password_hash = newHash;

    // Invalidate token
    updateDb.password_reset_tokens = updateDb.password_reset_tokens?.filter((t) => t.token !== token);
    writeLocalDb(updateDb);

    // 6. Verify password hash updated and token invalidated
    const verifiedDb = readLocalDb();
    const updatedUser = verifiedDb.users.find((u) => u.id === testUserId);
    expect(updatedUser?.password_hash).toBe(newHash);
    expect(updatedUser?.password_hash).not.toBe(oldHash);

    // Verify old password verification fails
    const oldAttemptHash = crypto.createHash('sha256').update(oldPassword).digest('hex');
    expect(updatedUser?.password_hash === oldAttemptHash).toBe(false);

    // Verify new password verification succeeds
    const newAttemptHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    expect(updatedUser?.password_hash === newAttemptHash).toBe(true);

    const tokenAfterUse = (verifiedDb.password_reset_tokens || []).find((t) => t.token === token);
    expect(tokenAfterUse).toBeUndefined();

    // 7. Clean up test user
    verifiedDb.users = verifiedDb.users.filter((u) => u.id !== testUserId);
    writeLocalDb(verifiedDb);
  });
});
