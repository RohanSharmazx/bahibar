import { describe, it, expect } from 'vitest';
import {
  resolveCurrentMembership,
  calculateMembershipDues,
  isMembershipActive,
  isMembershipExpiringSoon,
  isMembershipExpired,
} from '@/lib/utils/memberships';
import {
  calculateEndDate,
  calculateRenewalStartDate,
  getDaysRemaining,
  isExpiringSoon,
  isExpired,
  formatDateToISO,
} from '@/lib/utils/dates';
import { addDays, startOfDay } from 'date-fns';
import type { MemberMembership, Payment } from '@/types';

describe('Membership Renewal & Status Calculations', () => {
  describe('Single Source of Truth - Current Membership Resolution', () => {
    it('prioritizes active membership over expired membership even if expired has later end_date (observed bug fix)', () => {
      const expiredMembershipWithLaterEndDate: MemberMembership = {
        id: 'old-long-plan',
        gym_id: 'gym-1',
        member_id: 'mem-1',
        plan_id: 'plan-3m',
        plan_name_snapshot: '3 months exclusive',
        plan_price_snapshot: 1500,
        agreed_price: 1500,
        discount_amount: 0,
        duration_value_snapshot: 3,
        duration_unit_snapshot: 'months',
        start_date: '2026-10-20',
        end_date: '2027-01-20',
        status: 'expired',
        created_at: '2026-10-20T11:28:20.437Z',
        updated_at: '2026-10-20T11:31:29.002Z',
      };

      const activeMonthlyMembership: MemberMembership = {
        id: 'new-active-plan',
        gym_id: 'gym-1',
        member_id: 'mem-1',
        plan_id: 'plan-1m',
        plan_name_snapshot: 'Monthly',
        plan_price_snapshot: 2500,
        agreed_price: 2500,
        discount_amount: 0,
        duration_value_snapshot: 1,
        duration_unit_snapshot: 'months',
        start_date: '2026-09-24',
        end_date: '2026-10-24',
        status: 'active',
        created_at: '2026-10-20T11:31:29.002Z',
        updated_at: '2026-10-20T11:31:29.002Z',
      };

      const resolved = resolveCurrentMembership([
        expiredMembershipWithLaterEndDate,
        activeMonthlyMembership,
      ]);

      expect(resolved).not.toBeNull();
      expect(resolved?.id).toBe('new-active-plan');
      expect(resolved?.plan_name_snapshot).toBe('Monthly');
      expect(resolved?.end_date).toBe('2026-10-24');
    });

    it('resolves newest active membership if multiple active memberships exist', () => {
      const activeEarlier: MemberMembership = {
        id: 'active-1',
        gym_id: 'gym-1',
        member_id: 'mem-1',
        plan_id: 'plan-1',
        plan_name_snapshot: 'Monthly Earlier',
        plan_price_snapshot: 2000,
        agreed_price: 2000,
        discount_amount: 0,
        duration_value_snapshot: 1,
        duration_unit_snapshot: 'months',
        start_date: '2026-09-01',
        end_date: '2026-10-01',
        status: 'active',
        created_at: '2026-09-01T10:00:00.000Z',
        updated_at: '2026-09-01T10:00:00.000Z',
      };

      const activeLater: MemberMembership = {
        id: 'active-2',
        gym_id: 'gym-1',
        member_id: 'mem-1',
        plan_id: 'plan-2',
        plan_name_snapshot: 'Monthly Later',
        plan_price_snapshot: 2500,
        agreed_price: 2500,
        discount_amount: 0,
        duration_value_snapshot: 1,
        duration_unit_snapshot: 'months',
        start_date: '2026-10-02',
        end_date: '2026-11-02',
        status: 'active',
        created_at: '2026-10-02T10:00:00.000Z',
        updated_at: '2026-10-02T10:00:00.000Z',
      };

      const resolved = resolveCurrentMembership([activeEarlier, activeLater]);
      expect(resolved?.id).toBe('active-2');
      expect(resolved?.plan_name_snapshot).toBe('Monthly Later');
    });

    it('resolves most recently ended membership when no active membership exists', () => {
      const expiredOlder: MemberMembership = {
        id: 'exp-1',
        gym_id: 'gym-1',
        member_id: 'mem-1',
        plan_id: 'plan-1',
        plan_name_snapshot: 'Plan 1',
        plan_price_snapshot: 1000,
        agreed_price: 1000,
        discount_amount: 0,
        duration_value_snapshot: 1,
        duration_unit_snapshot: 'months',
        start_date: '2026-07-01',
        end_date: '2026-08-01',
        status: 'expired',
        created_at: '2026-07-01T00:00:00.000Z',
        updated_at: '2026-08-01T00:00:00.000Z',
      };

      const expiredNewer: MemberMembership = {
        id: 'exp-2',
        gym_id: 'gym-1',
        member_id: 'mem-1',
        plan_id: 'plan-2',
        plan_name_snapshot: 'Plan 2',
        plan_price_snapshot: 1200,
        agreed_price: 1200,
        discount_amount: 0,
        duration_value_snapshot: 1,
        duration_unit_snapshot: 'months',
        start_date: '2026-08-02',
        end_date: '2026-09-02',
        status: 'expired',
        created_at: '2026-08-02T00:00:00.000Z',
        updated_at: '2026-09-02T00:00:00.000Z',
      };

      const resolved = resolveCurrentMembership([expiredOlder, expiredNewer]);
      expect(resolved?.id).toBe('exp-2');
    });

    it('returns null for empty or null memberships', () => {
      expect(resolveCurrentMembership([])).toBeNull();
      expect(resolveCurrentMembership(null)).toBeNull();
      expect(resolveCurrentMembership(undefined)).toBeNull();
    });
  });

  describe('Outstanding Dues & Fee Calculations', () => {
    const membership: MemberMembership = {
      id: 'mem-period-1',
      gym_id: 'gym-1',
      member_id: 'mem-1',
      plan_id: 'plan-1',
      plan_name_snapshot: 'Monthly',
      plan_price_snapshot: 2500,
      agreed_price: 2500,
      discount_amount: 0,
      duration_value_snapshot: 1,
      duration_unit_snapshot: 'months',
      start_date: '2026-10-01',
      end_date: '2026-11-01',
      status: 'active',
      created_at: '2026-10-01T00:00:00.000Z',
      updated_at: '2026-10-01T00:00:00.000Z',
    };

    it('calculates full dues when zero payments are recorded', () => {
      const { totalPaid, outstandingBalance } = calculateMembershipDues(membership, []);
      expect(totalPaid).toBe(0);
      expect(outstandingBalance).toBe(2500);
    });

    it('calculates partial dues accurately when partial payment is recorded', () => {
      const payment: Payment = {
        id: 'pay-1',
        gym_id: 'gym-1',
        member_id: 'mem-1',
        membership_id: 'mem-period-1',
        amount: 1000,
        payment_method: 'upi',
        payment_date: '2026-10-01',
        transaction_reference: 'UPI123',
        notes: null,
        created_at: '2026-10-01T00:00:00.000Z',
      };

      const { totalPaid, outstandingBalance } = calculateMembershipDues(membership, [payment]);
      expect(totalPaid).toBe(1000);
      expect(outstandingBalance).toBe(1500);
    });

    it('calculates zero dues when fully paid across multiple payments', () => {
      const payment1: Payment = {
        id: 'pay-1',
        gym_id: 'gym-1',
        member_id: 'mem-1',
        membership_id: 'mem-period-1',
        amount: 1500,
        payment_method: 'cash',
        payment_date: '2026-10-01',
        transaction_reference: null,
        notes: null,
        created_at: '2026-10-01T00:00:00.000Z',
      };

      const payment2: Payment = {
        id: 'pay-2',
        gym_id: 'gym-1',
        member_id: 'mem-1',
        membership_id: 'mem-period-1',
        amount: 1000,
        payment_method: 'upi',
        payment_date: '2026-10-05',
        transaction_reference: 'UPI456',
        notes: null,
        created_at: '2026-10-05T00:00:00.000Z',
      };

      const { totalPaid, outstandingBalance } = calculateMembershipDues(membership, [
        payment1,
        payment2,
      ]);
      expect(totalPaid).toBe(2500);
      expect(outstandingBalance).toBe(0);
    });

    it('does not allocate payments from another membership period', () => {
      const otherPayment: Payment = {
        id: 'pay-other',
        gym_id: 'gym-1',
        member_id: 'mem-1',
        membership_id: 'different-period-id',
        amount: 2500,
        payment_method: 'cash',
        payment_date: '2026-09-01',
        transaction_reference: null,
        notes: null,
        created_at: '2026-09-01T00:00:00.000Z',
      };

      const { totalPaid, outstandingBalance } = calculateMembershipDues(membership, [
        otherPayment,
      ]);
      expect(totalPaid).toBe(0);
      expect(outstandingBalance).toBe(2500);
    });

    it('clamps outstanding dues to zero if overpaid', () => {
      const overpayment: Payment = {
        id: 'pay-over',
        gym_id: 'gym-1',
        member_id: 'mem-1',
        membership_id: 'mem-period-1',
        amount: 3000,
        payment_method: 'cash',
        payment_date: '2026-10-01',
        transaction_reference: null,
        notes: null,
        created_at: '2026-10-01T00:00:00.000Z',
      };

      const { totalPaid, outstandingBalance } = calculateMembershipDues(membership, [
        overpayment,
      ]);
      expect(totalPaid).toBe(3000);
      expect(outstandingBalance).toBe(0);
    });
  });

  describe('Expiry Status and 7-Day Window Boundaries', () => {
    it('boundary condition: expiring today (0 days left) is included in expiring soon', () => {
      const todayISO = formatDateToISO(new Date());
      expect(isExpiringSoon(todayISO, 7)).toBe(true);
      expect(isExpired(todayISO)).toBe(false);
    });

    it('boundary condition: expiring in exactly 7 days is included in expiring soon', () => {
      const in7Days = addDays(new Date(), 7);
      const in7DaysISO = formatDateToISO(in7Days);
      expect(isExpiringSoon(in7DaysISO, 7)).toBe(true);
      expect(isExpired(in7DaysISO)).toBe(false);
    });

    it('boundary condition: expiring in 8 days is excluded from expiring soon', () => {
      const in8Days = addDays(new Date(), 8);
      const in8DaysISO = formatDateToISO(in8Days);
      expect(isExpiringSoon(in8DaysISO, 7)).toBe(false);
      expect(isExpired(in8DaysISO)).toBe(false);
    });

    it('boundary condition: yesterday (-1 days) is expired and excluded from expiring soon', () => {
      const yesterday = addDays(new Date(), -1);
      const yesterdayISO = formatDateToISO(yesterday);
      expect(isExpiringSoon(yesterdayISO, 7)).toBe(false);
      expect(isExpired(yesterdayISO)).toBe(true);
    });

    it('isMembershipExpiringSoon respects status === active', () => {
      const in4Days = formatDateToISO(addDays(new Date(), 4));

      const activeMem: MemberMembership = {
        id: 'm-act',
        gym_id: 'gym-1',
        member_id: 'mem-1',
        plan_id: 'p-1',
        plan_name_snapshot: 'Plan',
        plan_price_snapshot: 1000,
        agreed_price: 1000,
        discount_amount: 0,
        duration_value_snapshot: 1,
        duration_unit_snapshot: 'months',
        start_date: '2026-10-01',
        end_date: in4Days,
        status: 'active',
        created_at: '2026-10-01T00:00:00.000Z',
        updated_at: '2026-10-01T00:00:00.000Z',
      };

      const expiredMem: MemberMembership = {
        ...activeMem,
        id: 'm-exp',
        status: 'expired',
      };

      expect(isMembershipExpiringSoon(activeMem, 7)).toBe(true);
      expect(isMembershipExpiringSoon(expiredMem, 7)).toBe(false);
    });
  });

  describe('Consecutive Renewal & Period Math', () => {
    it('active membership renewal continues uninterrupted from the day after current expiry', () => {
      const futureDate = addDays(startOfDay(new Date()), 10);
      const futureExpiry = formatDateToISO(futureDate);
      const expectedStart = formatDateToISO(addDays(futureDate, 1));
      const renewalStart = calculateRenewalStartDate(futureExpiry);
      expect(formatDateToISO(renewalStart)).toBe(expectedStart);
    });

    it('expired membership renewal restarts from today', () => {
      const pastExpiry = '2026-09-01';
      const renewalStart = calculateRenewalStartDate(pastExpiry);
      const today = startOfDay(new Date());
      expect(formatDateToISO(renewalStart)).toBe(formatDateToISO(today));
    });

    it('calculates plan duration switch correctly (from 1 month to 3 months)', () => {
      const start = '2026-10-25';
      const end3m = calculateEndDate(start, 3, 'months');
      expect(formatDateToISO(end3m)).toBe('2027-01-25');
    });
  });
});
