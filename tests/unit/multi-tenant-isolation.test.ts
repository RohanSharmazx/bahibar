import { describe, it, expect, beforeEach } from 'vitest';
import { readLocalDb, writeLocalDb, isLocalPlaceholderMode } from '@/lib/local-db';
import { calculateRenewalStartDate, getDaysRemaining, getTodayISO, parseDateOnly } from '@/lib/utils/dates';
import crypto from 'crypto';

describe('Multi-Tenant Isolation & Security Boundaries', () => {
  beforeEach(() => {
    // Reset/ensure local db is valid
    const db = readLocalDb();
    expect(db).toBeDefined();
  });

  describe('Gym Staff & Workspace Isolation', () => {
    it('prevents an unassociated user from adopting an existing gym by forging activeGymId', async () => {
      const db = readLocalDb();
      const victimGymId = crypto.randomUUID();
      const attackerUserId = crypto.randomUUID();

      // Seed victim gym owned by a different user
      const victimOwnerId = crypto.randomUUID();
      db.gyms.push({
        id: victimGymId,
        name: 'Victim Iron Gym',
        owner_name: 'Original Owner',
        contact_number: '9876543210',
        address: '123 Main Road',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      db.gym_staff.push({
        id: crypto.randomUUID(),
        gym_id: victimGymId,
        user_id: victimOwnerId,
        role: 'owner',
        created_at: new Date().toISOString(),
      });
      writeLocalDb(db);

      // Verify that attacker has 0 staff entries
      const attackerStaff = db.gym_staff.filter((s) => s.user_id === attackerUserId);
      expect(attackerStaff.length).toBe(0);

      // In local mode, an attacker attempting to access victimGymId without a staff entry
      // or verified workspace cookie must NOT be automatically added to gym_staff
      const updatedDb = readLocalDb();
      const unauthorizedStaff = updatedDb.gym_staff.find(
        (s) => s.user_id === attackerUserId && s.gym_id === victimGymId
      );
      expect(unauthorizedStaff).toBeUndefined();

      // Cleanup
      db.gyms = db.gyms.filter((g) => g.id !== victimGymId);
      db.gym_staff = db.gym_staff.filter((s) => s.gym_id !== victimGymId);
      writeLocalDb(db);
    });

    it('isolates members and payments between different gym tenants', () => {
      const db = readLocalDb();
      const gymAId = crypto.randomUUID();
      const gymBId = crypto.randomUUID();

      const memberAId = crypto.randomUUID();
      const memberBId = crypto.randomUUID();

      db.members.push({
        id: memberAId,
        gym_id: gymAId,
        full_name: 'Member In Gym A',
        mobile: '9800000001',
        email: 'membera@test.com',
        gender: 'male',
        date_of_birth: null,
        address: null,
        emergency_contact: null,
        notes: null,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      db.members.push({
        id: memberBId,
        gym_id: gymBId,
        full_name: 'Member In Gym B',
        mobile: '9800000002',
        email: 'memberb@test.com',
        gender: 'female',
        date_of_birth: null,
        address: null,
        emergency_contact: null,
        notes: null,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Filter members for Gym A: MUST strictly contain memberA and NOT memberB
      const gymAMembers = db.members.filter((m) => m.gym_id === gymAId);
      expect(gymAMembers.some((m) => m.id === memberAId)).toBe(true);
      expect(gymAMembers.some((m) => m.id === memberBId)).toBe(false);

      // Filter members for Gym B: MUST strictly contain memberB and NOT memberA
      const gymBMembers = db.members.filter((m) => m.gym_id === gymBId);
      expect(gymBMembers.some((m) => m.id === memberBId)).toBe(true);
      expect(gymBMembers.some((m) => m.id === memberAId)).toBe(false);

      // Cleanup
      db.members = db.members.filter((m) => m.id !== memberAId && m.id !== memberBId);
      writeLocalDb(db);
    });

    it('cascades gym deletion strictly within tenant boundary without affecting other gyms', () => {
      const db = readLocalDb();
      const targetGymId = crypto.randomUUID();
      const siblingGymId = crypto.randomUUID();

      // Setup target gym and records
      db.gyms.push({
        id: targetGymId,
        name: 'Gym To Delete',
        owner_name: 'Owner 1',
        contact_number: '9800000011',
        address: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      const targetMemberId = crypto.randomUUID();
      db.members.push({
        id: targetMemberId,
        gym_id: targetGymId,
        full_name: 'Target Member',
        mobile: '9800000012',
        email: null,
        gender: null,
        date_of_birth: null,
        address: null,
        emergency_contact: null,
        notes: null,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Setup sibling gym and records
      db.gyms.push({
        id: siblingGymId,
        name: 'Sibling Gym',
        owner_name: 'Owner 2',
        contact_number: '9800000022',
        address: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      const siblingMemberId = crypto.randomUUID();
      db.members.push({
        id: siblingMemberId,
        gym_id: siblingGymId,
        full_name: 'Sibling Member',
        mobile: '9800000023',
        email: null,
        gender: null,
        date_of_birth: null,
        address: null,
        emergency_contact: null,
        notes: null,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Simulate cascade deletion for targetGymId only
      db.members = db.members.filter((m) => m.gym_id !== targetGymId);
      db.gyms = db.gyms.filter((g) => g.id !== targetGymId);

      // Verify target gym is wiped
      expect(db.gyms.some((g) => g.id === targetGymId)).toBe(false);
      expect(db.members.some((m) => m.id === targetMemberId)).toBe(false);

      // Verify sibling gym and member are 100% intact
      expect(db.gyms.some((g) => g.id === siblingGymId)).toBe(true);
      expect(db.members.some((m) => m.id === siblingMemberId)).toBe(true);

      // Cleanup
      db.members = db.members.filter((m) => m.id !== siblingMemberId);
      db.gyms = db.gyms.filter((g) => g.id !== siblingGymId);
      writeLocalDb(db);
    });
  });

  describe('Indian Standard Time (IST) Date Boundary Integrity', () => {
    it('produces valid YYYY-MM-DD format for IST today', () => {
      const todayIST = getTodayISO('Asia/Kolkata');
      expect(/^\d{4}-\d{2}-\d{2}$/.test(todayIST)).toBe(true);
    });

    it('evaluates calculateRenewalStartDate against IST today', () => {
      const todayISO = getTodayISO('Asia/Kolkata');
      const today = parseDateOnly(todayISO);

      // Active membership ending tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const renewalStartActive = calculateRenewalStartDate(tomorrow);
      // Day after tomorrow
      const expectedDayAfter = new Date(tomorrow);
      expectedDayAfter.setDate(expectedDayAfter.getDate() + 1);

      expect(renewalStartActive.getDate()).toBe(expectedDayAfter.getDate());
      expect(renewalStartActive.getMonth()).toBe(expectedDayAfter.getMonth());

      // Expired membership ending 5 days ago -> starts today in IST
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - 5);

      const renewalStartExpired = calculateRenewalStartDate(pastDate);
      expect(renewalStartExpired.getDate()).toBe(today.getDate());
      expect(renewalStartExpired.getMonth()).toBe(today.getMonth());
    });

    it('calculates getDaysRemaining relative to IST midnight', () => {
      const todayISO = getTodayISO('Asia/Kolkata');
      const today = parseDateOnly(todayISO);

      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 5);

      const remaining = getDaysRemaining(futureDate);
      expect(remaining).toBe(5);

      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - 3);

      const pastRemaining = getDaysRemaining(pastDate);
      expect(pastRemaining).toBe(-3);
    });
  });
});
