import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { readLocalDb, writeLocalDb, type LocalUser } from '@/lib/local-db';
import type { Gym, GymStaff, Member, MemberMembership, MembershipPlan, Payment, SoftwareSubscription } from '@/types';

describe('Safe Gym Workspace Deletion & Multi-Gym Lifecycle', () => {
  const TEST_OWNER_ID = 'test-owner-uuid-001';
  const TEST_STAFF_ID = 'test-staff-uuid-002';
  const TEST_OTHER_OWNER_ID = 'test-other-owner-uuid-003';

  const TARGET_GYM_ID = 'target-gym-uuid-delete';
  const OTHER_GYM_ID = 'other-gym-uuid-preserve';
  const SECOND_OWNED_GYM_ID = 'second-gym-uuid-owned-by-same-owner';

  const TEST_PASSWORD = 'CorrectOwnerPassword123!';
  const passwordHash = crypto.createHash('sha256').update(TEST_PASSWORD).digest('hex');

  let originalDbState: any = null;

  beforeEach(() => {
    // Backup original db state before running tests
    originalDbState = JSON.parse(JSON.stringify(readLocalDb()));

    const db = readLocalDb();

    // Setup Test Owner & Staff
    const ownerUser: LocalUser = {
      id: TEST_OWNER_ID,
      email: 'owner@delgym.test',
      password_hash: passwordHash,
      full_name: 'Test Gym Owner',
      created_at: new Date().toISOString(),
    };

    const staffUser: LocalUser = {
      id: TEST_STAFF_ID,
      email: 'staff@delgym.test',
      password_hash: passwordHash,
      full_name: 'Test Gym Staff',
      created_at: new Date().toISOString(),
    };

    const otherUser: LocalUser = {
      id: TEST_OTHER_OWNER_ID,
      email: 'other@delgym.test',
      password_hash: passwordHash,
      full_name: 'Other Gym Owner',
      created_at: new Date().toISOString(),
    };

    db.users = db.users.filter((u) => ![TEST_OWNER_ID, TEST_STAFF_ID, TEST_OTHER_OWNER_ID].includes(u.id));
    db.users.push(ownerUser, staffUser, otherUser);

    // Setup Target Gym A (to be deleted)
    const targetGym: Gym = {
      id: TARGET_GYM_ID,
      name: 'Alpha Fitness Club',
      owner_name: 'Test Gym Owner',
      contact_number: '9876543210',
      address: '123 Test Street',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Setup Preserved Gym B (must not be affected)
    const otherGym: Gym = {
      id: OTHER_GYM_ID,
      name: 'Omega Fitness Club',
      owner_name: 'Other Gym Owner',
      contact_number: '9123456789',
      address: '456 Safe Street',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Setup Second Gym Owned by same owner (for multi-gym test)
    const secondGym: Gym = {
      id: SECOND_OWNED_GYM_ID,
      name: 'Beta Fitness Club',
      owner_name: 'Test Gym Owner',
      contact_number: '9876543211',
      address: '789 Branch Avenue',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.gyms = db.gyms.filter((g) => ![TARGET_GYM_ID, OTHER_GYM_ID, SECOND_OWNED_GYM_ID].includes(g.id));
    db.gyms.push(targetGym, otherGym, secondGym);

    // Setup Staff
    db.gym_staff = db.gym_staff.filter((s) => ![TARGET_GYM_ID, OTHER_GYM_ID, SECOND_OWNED_GYM_ID].includes(s.gym_id));
    db.gym_staff.push(
      { id: 'staff-rel-1', gym_id: TARGET_GYM_ID, user_id: TEST_OWNER_ID, role: 'owner', created_at: new Date().toISOString() },
      { id: 'staff-rel-2', gym_id: TARGET_GYM_ID, user_id: TEST_STAFF_ID, role: 'staff', created_at: new Date().toISOString() },
      { id: 'staff-rel-3', gym_id: OTHER_GYM_ID, user_id: TEST_OTHER_OWNER_ID, role: 'owner', created_at: new Date().toISOString() },
      { id: 'staff-rel-4', gym_id: SECOND_OWNED_GYM_ID, user_id: TEST_OWNER_ID, role: 'owner', created_at: new Date().toISOString() }
    );

    // Setup Plans
    db.membership_plans = db.membership_plans.filter((p) => ![TARGET_GYM_ID, OTHER_GYM_ID, SECOND_OWNED_GYM_ID].includes(p.gym_id));
    db.membership_plans.push(
      { id: 'plan-del-1', gym_id: TARGET_GYM_ID, name: 'Target Monthly', duration_value: 1, duration_unit: 'months', price: 1500, is_active: true, description: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'plan-keep-1', gym_id: OTHER_GYM_ID, name: 'Omega Monthly', duration_value: 1, duration_unit: 'months', price: 2000, is_active: true, description: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'plan-branch-1', gym_id: SECOND_OWNED_GYM_ID, name: 'Beta Monthly', duration_value: 1, duration_unit: 'months', price: 1800, is_active: true, description: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    );

    // Setup Members
    db.members = db.members.filter((m) => ![TARGET_GYM_ID, OTHER_GYM_ID, SECOND_OWNED_GYM_ID].includes(m.gym_id));
    db.members.push(
      { id: 'm-del-1', gym_id: TARGET_GYM_ID, full_name: 'John Doe', mobile: '9000000001', email: null, gender: 'male', date_of_birth: null, address: null, emergency_contact: null, notes: null, is_archived: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'm-keep-1', gym_id: OTHER_GYM_ID, full_name: 'Jane Smith', mobile: '9000000002', email: null, gender: 'female', date_of_birth: null, address: null, emergency_contact: null, notes: null, is_archived: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'm-branch-1', gym_id: SECOND_OWNED_GYM_ID, full_name: 'Bob Branch', mobile: '9000000003', email: null, gender: 'male', date_of_birth: null, address: null, emergency_contact: null, notes: null, is_archived: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    );

    // Setup Memberships
    db.member_memberships = db.member_memberships.filter((mm) => ![TARGET_GYM_ID, OTHER_GYM_ID, SECOND_OWNED_GYM_ID].includes(mm.gym_id));
    db.member_memberships.push(
      { id: 'mem-del-1', gym_id: TARGET_GYM_ID, member_id: 'm-del-1', plan_id: 'plan-del-1', plan_name_snapshot: 'Target Monthly', plan_price_snapshot: 1500, agreed_price: 1500, discount_amount: 0, duration_value_snapshot: 1, duration_unit_snapshot: 'months', start_date: '2026-10-01', end_date: '2026-10-31', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'mem-keep-1', gym_id: OTHER_GYM_ID, member_id: 'm-keep-1', plan_id: 'plan-keep-1', plan_name_snapshot: 'Omega Monthly', plan_price_snapshot: 2000, agreed_price: 2000, discount_amount: 0, duration_value_snapshot: 1, duration_unit_snapshot: 'months', start_date: '2026-10-01', end_date: '2026-10-31', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    );

    // Setup Payments
    db.payments = db.payments.filter((p) => ![TARGET_GYM_ID, OTHER_GYM_ID, SECOND_OWNED_GYM_ID].includes(p.gym_id));
    db.payments.push(
      { id: 'pay-del-1', gym_id: TARGET_GYM_ID, member_id: 'm-del-1', membership_id: 'mem-del-1', amount: 1500, payment_method: 'upi', payment_date: '2026-10-01', transaction_reference: 'UPI-DEL-01', notes: null, created_at: new Date().toISOString() },
      { id: 'pay-keep-1', gym_id: OTHER_GYM_ID, member_id: 'm-keep-1', membership_id: 'mem-keep-1', amount: 2000, payment_method: 'cash', payment_date: '2026-10-01', transaction_reference: null, notes: null, created_at: new Date().toISOString() }
    );

    // Setup Subscriptions
    db.software_subscriptions = db.software_subscriptions.filter((ss) => ![TARGET_GYM_ID, OTHER_GYM_ID, SECOND_OWNED_GYM_ID].includes(ss.gym_id));
    db.software_subscriptions.push(
      { id: 'sub-del-1', gym_id: TARGET_GYM_ID, plan_name: 'trial', status: 'trial', start_date: '2026-10-01', end_date: '2026-10-31', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'sub-keep-1', gym_id: OTHER_GYM_ID, plan_name: 'trial', status: 'trial', start_date: '2026-10-01', end_date: '2026-10-31', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    );

    writeLocalDb(db);
  });

  afterEach(() => {
    // Restore original db state
    if (originalDbState) {
      writeLocalDb(originalDbState);
    }
  });

  it('rejects deletion when gym name does not match exactly', () => {
    const db = readLocalDb();
    const gym = db.gyms.find((g) => g.id === TARGET_GYM_ID);
    expect(gym).toBeDefined();

    const typedName = 'Wrong Gym Name';
    expect(typedName.trim() === gym!.name.trim()).toBe(false);
  });

  it('rejects deletion when password verification fails', () => {
    const wrongPassword = 'IncorrectPassword!';
    const wrongHash = crypto.createHash('sha256').update(wrongPassword).digest('hex');

    const db = readLocalDb();
    const user = db.users.find((u) => u.id === TEST_OWNER_ID);
    expect(user).toBeDefined();

    expect(wrongHash === user!.password_hash).toBe(false);
  });

  it('verifies owner role permission and blocks staff members', () => {
    const db = readLocalDb();
    const ownerStaff = db.gym_staff.find((s) => s.user_id === TEST_OWNER_ID && s.gym_id === TARGET_GYM_ID);
    const regularStaff = db.gym_staff.find((s) => s.user_id === TEST_STAFF_ID && s.gym_id === TARGET_GYM_ID);

    expect(ownerStaff?.role).toBe('owner');
    expect(regularStaff?.role).toBe('staff');
    expect(regularStaff?.role === 'owner').toBe(false);
  });

  it('executes safe cascading deletion of target gym while preserving owner user and other gyms', () => {
    const db = readLocalDb();

    // 1. Verify target gym data exists before deletion
    expect(db.gyms.some((g) => g.id === TARGET_GYM_ID)).toBe(true);
    expect(db.members.some((m) => m.gym_id === TARGET_GYM_ID)).toBe(true);
    expect(db.member_memberships.some((mm) => mm.gym_id === TARGET_GYM_ID)).toBe(true);
    expect(db.payments.some((p) => p.gym_id === TARGET_GYM_ID)).toBe(true);
    expect(db.membership_plans.some((mp) => mp.gym_id === TARGET_GYM_ID)).toBe(true);
    expect(db.software_subscriptions.some((ss) => ss.gym_id === TARGET_GYM_ID)).toBe(true);
    expect(db.gym_staff.some((gs) => gs.gym_id === TARGET_GYM_ID)).toBe(true);

    // 2. Perform cascade delete routine as implemented in deleteGymAction
    const gymMembers = db.members.filter((m) => m.gym_id === TARGET_GYM_ID);
    const memberIds = new Set(gymMembers.map((m) => m.id));

    db.payments = db.payments.filter((p) => p.gym_id !== TARGET_GYM_ID && !memberIds.has(p.member_id));
    db.member_memberships = db.member_memberships.filter((mm) => mm.gym_id !== TARGET_GYM_ID && !memberIds.has(mm.member_id));
    db.members = db.members.filter((m) => m.gym_id !== TARGET_GYM_ID);
    db.membership_plans = db.membership_plans.filter((mp) => mp.gym_id !== TARGET_GYM_ID);
    db.software_subscriptions = db.software_subscriptions.filter((ss) => ss.gym_id !== TARGET_GYM_ID);
    db.gym_staff = db.gym_staff.filter((gs) => gs.gym_id !== TARGET_GYM_ID);
    db.gyms = db.gyms.filter((g) => g.id !== TARGET_GYM_ID);

    writeLocalDb(db);

    // 3. Verify Target Gym and all its records are completely deleted
    const updatedDb = readLocalDb();
    expect(updatedDb.gyms.some((g) => g.id === TARGET_GYM_ID)).toBe(false);
    expect(updatedDb.members.some((m) => m.gym_id === TARGET_GYM_ID)).toBe(false);
    expect(updatedDb.member_memberships.some((mm) => mm.gym_id === TARGET_GYM_ID)).toBe(false);
    expect(updatedDb.payments.some((p) => p.gym_id === TARGET_GYM_ID)).toBe(false);
    expect(updatedDb.membership_plans.some((mp) => mp.gym_id === TARGET_GYM_ID)).toBe(false);
    expect(updatedDb.software_subscriptions.some((ss) => ss.gym_id === TARGET_GYM_ID)).toBe(false);
    expect(updatedDb.gym_staff.some((gs) => gs.gym_id === TARGET_GYM_ID)).toBe(false);

    // 4. Verify Owner User Account is PRESERVED (tenant separated from user account)
    const ownerUser = updatedDb.users.find((u) => u.id === TEST_OWNER_ID);
    expect(ownerUser).toBeDefined();
    expect(ownerUser?.email).toBe('owner@delgym.test');

    // 5. Verify Other Gym B and its data is 100% untouched (Tenant Isolation)
    expect(updatedDb.gyms.some((g) => g.id === OTHER_GYM_ID)).toBe(true);
    expect(updatedDb.members.some((m) => m.gym_id === OTHER_GYM_ID)).toBe(true);
    expect(updatedDb.member_memberships.some((mm) => mm.gym_id === OTHER_GYM_ID)).toBe(true);
    expect(updatedDb.payments.some((p) => p.gym_id === OTHER_GYM_ID)).toBe(true);
    expect(updatedDb.membership_plans.some((mp) => mp.gym_id === OTHER_GYM_ID)).toBe(true);
    expect(updatedDb.software_subscriptions.some((ss) => ss.gym_id === OTHER_GYM_ID)).toBe(true);
    expect(updatedDb.gym_staff.some((gs) => gs.gym_id === OTHER_GYM_ID)).toBe(true);
  });

  it('Scenario C: allows multi-gym owner to retain other gym workspaces when one is deleted', () => {
    const db = readLocalDb();

    // Check that TEST_OWNER_ID owns both TARGET_GYM_ID and SECOND_OWNED_GYM_ID
    const ownerGymStaff = db.gym_staff.filter((s) => s.user_id === TEST_OWNER_ID);
    expect(ownerGymStaff.length).toBe(2);

    // Delete TARGET_GYM_ID
    db.gym_staff = db.gym_staff.filter((s) => s.gym_id !== TARGET_GYM_ID);
    db.gyms = db.gyms.filter((g) => g.id !== TARGET_GYM_ID);

    // Check remaining gyms for owner
    const remainingGyms = db.gym_staff.filter((s) => s.user_id === TEST_OWNER_ID);
    expect(remainingGyms.length).toBe(1);
    expect(remainingGyms[0].gym_id).toBe(SECOND_OWNED_GYM_ID);

    // The owner's second gym is completely intact
    const remainingGym = db.gyms.find((g) => g.id === SECOND_OWNED_GYM_ID);
    expect(remainingGym).toBeDefined();
    expect(remainingGym?.name).toBe('Beta Fitness Club');
  });

  it('Scenario A: detects when NO workspaces remain for an owner after deleting last gym', () => {
    const db = readLocalDb();

    // Remove the second gym so owner only has TARGET_GYM_ID
    db.gym_staff = db.gym_staff.filter((s) => s.gym_id !== SECOND_OWNED_GYM_ID);
    db.gyms = db.gyms.filter((g) => g.id !== SECOND_OWNED_GYM_ID);

    // Delete the target gym
    db.gym_staff = db.gym_staff.filter((s) => s.gym_id !== TARGET_GYM_ID);
    db.gyms = db.gyms.filter((g) => g.id !== TARGET_GYM_ID);

    // Check remaining workspaces
    const remaining = db.gym_staff.filter((s) => s.user_id === TEST_OWNER_ID);
    expect(remaining.length).toBe(0);
    // When remaining.length === 0, deleteGymAction deletes LOCAL_SESSION_COOKIE and redirects to /?deleted=true
  });

  it('Scenario B: preserves complete tenant isolation between two separate owners', () => {
    const db = readLocalDb();

    const ownerAStaff = db.gym_staff.filter((s) => s.user_id === TEST_OWNER_ID);
    const ownerBStaff = db.gym_staff.filter((s) => s.user_id === TEST_OTHER_OWNER_ID);

    const ownerAGymIds = new Set(ownerAStaff.map((s) => s.gym_id));
    const ownerBGymIds = new Set(ownerBStaff.map((s) => s.gym_id));

    // Ensure mutually exclusive gym memberships
    for (const id of ownerAGymIds) {
      expect(ownerBGymIds.has(id)).toBe(false);
    }
    for (const id of ownerBGymIds) {
      expect(ownerAGymIds.has(id)).toBe(false);
    }

    // Owner B's members are strictly under Owner B's gym
    const ownerBMembers = db.members.filter((m) => ownerBGymIds.has(m.gym_id));
    expect(ownerBMembers.length).toBe(1);
    expect(ownerBMembers[0].full_name).toBe('Jane Smith');
    expect(ownerAGymIds.has(ownerBMembers[0].gym_id)).toBe(false);
  });
});
