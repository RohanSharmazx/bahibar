import { describe, it, expect } from 'vitest';
import { validateBackupJson } from '@/lib/utils/backup';

describe('Backup Validation Utility', () => {
  const validBackup = {
    app: 'BahiBar',
    version: '1.0.0',
    exported_at: '2026-10-18T10:00:00.000Z',
    gym: {
      name: 'Iron Fitness',
      owner_name: 'Vikram',
      contact_number: '9876543210',
    },
    plans: [
      { id: 'p1', name: 'Gold 3 Month', duration_value: 3, duration_unit: 'months', price: 4500 },
    ],
    members: [
      { id: 'm1', full_name: 'Rahul Sharma', mobile: '9876543210' },
    ],
    memberships: [
      { id: 'mem1', member_id: 'm1', plan_id: 'p1', agreed_price: 4500, start_date: '2026-10-18', end_date: '2027-01-18' },
    ],
    payments: [
      { id: 'pay1', member_id: 'm1', membership_id: 'mem1', amount: 4500, payment_method: 'upi', payment_date: '2026-10-18' },
    ],
  };

  it('validates a correct BahiBar backup and extracts preview metrics', () => {
    const jsonString = JSON.stringify(validBackup);
    const result = validateBackupJson(jsonString);

    expect(result.valid).toBe(true);
    expect(result.preview).toBeDefined();
    expect(result.preview?.gymName).toBe('Iron Fitness');
    expect(result.preview?.plansCount).toBe(1);
    expect(result.preview?.membersCount).toBe(1);
    expect(result.preview?.membershipsCount).toBe(1);
    expect(result.preview?.paymentsCount).toBe(1);
    expect(result.preview?.totalAmountCollected).toBe(4500);
  });

  it('validates legacy GymManager backups for backward compatibility', () => {
    const legacyBackup = { ...validBackup, app: 'GymManager' };
    const result = validateBackupJson(JSON.stringify(legacyBackup));

    expect(result.valid).toBe(true);
    expect(result.preview?.gymName).toBe('Iron Fitness');
  });

  it('rejects invalid JSON syntax', () => {
    const result = validateBackupJson('{ not valid json');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not a valid JSON');
  });

  it('rejects empty or non-string inputs', () => {
    expect(validateBackupJson('').valid).toBe(false);
    expect(validateBackupJson(null as any).valid).toBe(false);
  });

  it('rejects backups from foreign applications', () => {
    const foreign = { ...validBackup, app: 'OtherGymSoftware' };
    const result = validateBackupJson(JSON.stringify(foreign));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Incompatible backup source');
  });

  it('rejects unsupported backup versions', () => {
    const incompatible = { ...validBackup, version: '2.5.0' };
    const result = validateBackupJson(JSON.stringify(incompatible));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Incompatible backup version');
  });

  it('rejects backups with missing required entity tables', () => {
    const missingPayments = { ...validBackup, payments: undefined };
    const result = validateBackupJson(JSON.stringify(missingPayments));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('missing one or more required collections');
  });
});
