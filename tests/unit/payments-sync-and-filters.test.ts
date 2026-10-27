import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  resolveCurrentMembership,
  calculateMembershipDues,
  isMembershipActive,
  isMembershipExpiringSoon,
  isMembershipExpired,
  comparePaymentsDesc,
} from '@/lib/utils/memberships';
import { isExpiringSoon, isExpired, formatDateToISO } from '@/lib/utils/dates';
import type { Member, MemberMembership, Payment, PaymentWithMember } from '@/types';

describe('Payment History Synchronization, Latest-First Sorting & Filters', () => {
  describe('BUG 2: Expiring Soon Filter (Fixed Test Date: 20 October 2026)', () => {
    beforeEach(() => {
      // Freeze date to 2026-10-20T12:00:00.000Z
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 9, 20, 12, 0, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('includes membership expiring on 24 October 2026 (4 days left)', () => {
      expect(isExpiringSoon('2026-10-24', 7)).toBe(true);
      expect(isExpired('2026-10-24')).toBe(false);

      const mem: MemberMembership = {
        id: 'mem-24',
        gym_id: 'gym-1',
        member_id: 'm1',
        plan_id: 'p1',
        plan_name_snapshot: 'Monthly',
        plan_price_snapshot: 2000,
        agreed_price: 2000,
        discount_amount: 0,
        duration_value_snapshot: 1,
        duration_unit_snapshot: 'months',
        start_date: '2026-09-24',
        end_date: '2026-10-24',
        status: 'active',
        created_at: '2026-09-24T00:00:00.000Z',
        updated_at: '2026-09-24T00:00:00.000Z',
      };
      expect(isMembershipExpiringSoon(mem, 7)).toBe(true);
    });

    it('includes membership expiring on 27 October 2026 (7-day boundary inclusive)', () => {
      expect(isExpiringSoon('2026-10-27', 7)).toBe(true);
      expect(isExpired('2026-10-27')).toBe(false);

      const mem: MemberMembership = {
        id: 'mem-27',
        gym_id: 'gym-1',
        member_id: 'm2',
        plan_id: 'p1',
        plan_name_snapshot: 'Monthly',
        plan_price_snapshot: 2000,
        agreed_price: 2000,
        discount_amount: 0,
        duration_value_snapshot: 1,
        duration_unit_snapshot: 'months',
        start_date: '2026-09-27',
        end_date: '2026-10-27',
        status: 'active',
        created_at: '2026-09-27T00:00:00.000Z',
        updated_at: '2026-09-27T00:00:00.000Z',
      };
      expect(isMembershipExpiringSoon(mem, 7)).toBe(true);
    });

    it('excludes membership expiring on 18 November 2026 (29 days away)', () => {
      expect(isExpiringSoon('2026-11-18', 7)).toBe(false);
      expect(isExpired('2026-11-18')).toBe(false);

      const mem: MemberMembership = {
        id: 'mem-nov',
        gym_id: 'gym-1',
        member_id: 'm3',
        plan_id: 'p1',
        plan_name_snapshot: 'Monthly',
        plan_price_snapshot: 2000,
        agreed_price: 2000,
        discount_amount: 0,
        duration_value_snapshot: 1,
        duration_unit_snapshot: 'months',
        start_date: '2026-10-18',
        end_date: '2026-11-18',
        status: 'active',
        created_at: '2026-10-18T00:00:00.000Z',
        updated_at: '2026-10-18T00:00:00.000Z',
      };
      expect(isMembershipExpiringSoon(mem, 7)).toBe(false);
      expect(isMembershipActive(mem)).toBe(true);
    });

    it('excludes membership expiring on 18 January 2027 (90 days away)', () => {
      expect(isExpiringSoon('2027-01-18', 7)).toBe(false);
      expect(isExpired('2027-01-18')).toBe(false);

      const mem: MemberMembership = {
        id: 'mem-jan',
        gym_id: 'gym-1',
        member_id: 'm4',
        plan_id: 'p3m',
        plan_name_snapshot: '3 months',
        plan_price_snapshot: 5000,
        agreed_price: 5000,
        discount_amount: 0,
        duration_value_snapshot: 3,
        duration_unit_snapshot: 'months',
        start_date: '2026-10-18',
        end_date: '2027-01-18',
        status: 'active',
        created_at: '2026-10-18T00:00:00.000Z',
        updated_at: '2026-10-18T00:00:00.000Z',
      };
      expect(isMembershipExpiringSoon(mem, 7)).toBe(false);
      expect(isMembershipActive(mem)).toBe(true);
    });

    it('excludes already-expired memberships (e.g. 19 October 2026)', () => {
      expect(isExpiringSoon('2026-10-19', 7)).toBe(false);
      expect(isExpired('2026-10-19')).toBe(true);

      const mem: MemberMembership = {
        id: 'mem-exp',
        gym_id: 'gym-1',
        member_id: 'm5',
        plan_id: 'p1',
        plan_name_snapshot: 'Monthly',
        plan_price_snapshot: 2000,
        agreed_price: 2000,
        discount_amount: 0,
        duration_value_snapshot: 1,
        duration_unit_snapshot: 'months',
        start_date: '2026-09-19',
        end_date: '2026-10-19',
        status: 'active', // even if status was active, end_date has passed
        created_at: '2026-09-19T00:00:00.000Z',
        updated_at: '2026-09-19T00:00:00.000Z',
      };
      expect(isMembershipExpiringSoon(mem, 7)).toBe(false);
      expect(isMembershipExpired(mem)).toBe(true);
      expect(isMembershipActive(mem)).toBe(false);
    });
  });

  describe('BUG 3: Latest-First Payment Sorting', () => {
    it('sorts transactions by payment_date descending (newest first)', () => {
      const p1: Payment = {
        id: 'p1',
        gym_id: 'g1',
        member_id: 'm1',
        membership_id: 'mem1',
        amount: 1000,
        payment_method: 'cash',
        payment_date: '2026-10-01',
        transaction_reference: null,
        notes: null,
        created_at: '2026-10-01T10:00:00.000Z',
      };

      const p2: Payment = {
        id: 'p2',
        gym_id: 'g1',
        member_id: 'm1',
        membership_id: 'mem1',
        amount: 1500,
        payment_method: 'upi',
        payment_date: '2026-10-15',
        transaction_reference: null,
        notes: null,
        created_at: '2026-10-15T10:00:00.000Z',
      };

      const p3: Payment = {
        id: 'p3',
        gym_id: 'g1',
        member_id: 'm1',
        membership_id: 'mem1',
        amount: 2000,
        payment_method: 'card',
        payment_date: '2026-10-20',
        transaction_reference: null,
        notes: null,
        created_at: '2026-10-20T10:00:00.000Z',
      };

      const sorted = [p1, p3, p2].sort(comparePaymentsDesc);
      expect(sorted[0].id).toBe('p3'); // 20 Oct
      expect(sorted[1].id).toBe('p2'); // 15 Oct
      expect(sorted[2].id).toBe('p1'); // 1 Oct
    });

    it('breaks ties deterministically on same payment_date using created_at timestamp descending', () => {
      const morningPayment: Payment = {
        id: 'pay-morning',
        gym_id: 'g1',
        member_id: 'm1',
        membership_id: 'mem1',
        amount: 500,
        payment_method: 'cash',
        payment_date: '2026-10-20',
        transaction_reference: null,
        notes: null,
        created_at: '2026-10-20T08:30:00.000Z',
      };

      const eveningPayment: Payment = {
        id: 'pay-evening',
        gym_id: 'g1',
        member_id: 'm1',
        membership_id: 'mem1',
        amount: 1500,
        payment_method: 'upi',
        payment_date: '2026-10-20',
        transaction_reference: null,
        notes: null,
        created_at: '2026-10-20T17:45:00.000Z',
      };

      const sorted = [morningPayment, eveningPayment].sort(comparePaymentsDesc);
      expect(sorted[0].id).toBe('pay-evening');
      expect(sorted[1].id).toBe('pay-morning');
    });

    it('breaks ties deterministically on identical payment_date and created_at using ID descending', () => {
      const pA: Payment = {
        id: 'payment-aaa',
        gym_id: 'g1',
        member_id: 'm1',
        membership_id: 'mem1',
        amount: 500,
        payment_method: 'cash',
        payment_date: '2026-10-20',
        transaction_reference: null,
        notes: null,
        created_at: '2026-10-20T10:00:00.000Z',
      };

      const pZ: Payment = {
        id: 'payment-zzz',
        gym_id: 'g1',
        member_id: 'm1',
        membership_id: 'mem1',
        amount: 500,
        payment_method: 'cash',
        payment_date: '2026-10-20',
        transaction_reference: null,
        notes: null,
        created_at: '2026-10-20T10:00:00.000Z',
      };

      const sorted1 = [pA, pZ].sort(comparePaymentsDesc);
      const sorted2 = [pZ, pA].sort(comparePaymentsDesc);
      expect(sorted1[0].id).toBe('payment-zzz');
      expect(sorted2[0].id).toBe('payment-zzz');
    });

    it('correctly sorts transactions spanning multiple years and months without string sorting bugs', () => {
      const dec2026: Payment = {
        id: 'p-dec-2026',
        gym_id: 'g1',
        member_id: 'm1',
        membership_id: 'mem1',
        amount: 1000,
        payment_method: 'cash',
        payment_date: '2026-12-31',
        transaction_reference: null,
        notes: null,
        created_at: '2026-12-31T23:59:00.000Z',
      };

      const jan2027: Payment = {
        id: 'p-jan-2027',
        gym_id: 'g1',
        member_id: 'm1',
        membership_id: 'mem2',
        amount: 1000,
        payment_method: 'upi',
        payment_date: '2027-01-01',
        transaction_reference: null,
        notes: null,
        created_at: '2027-01-01T08:00:00.000Z',
      };

      const sorted = [dec2026, jan2027].sort(comparePaymentsDesc);
      expect(sorted[0].id).toBe('p-jan-2027');
      expect(sorted[1].id).toBe('p-dec-2026');
    });
  });

  describe('BUG 1: Payment History Synchronization & Isolation', () => {
    it('isolates payments by member and does not show payments from other members', () => {
      const paymentsDatabase: Payment[] = [
        {
          id: 'pay-m1-1',
          gym_id: 'gym-1',
          member_id: 'member-1',
          membership_id: 'mem-1',
          amount: 2000,
          payment_method: 'cash',
          payment_date: '2026-10-18',
          transaction_reference: null,
          notes: null,
          created_at: '2026-10-18T10:00:00.000Z',
        },
        {
          id: 'pay-m2-1',
          gym_id: 'gym-1',
          member_id: 'member-2',
          membership_id: 'mem-2',
          amount: 5000,
          payment_method: 'upi',
          payment_date: '2026-10-19',
          transaction_reference: null,
          notes: null,
          created_at: '2026-10-19T10:00:00.000Z',
        },
        {
          id: 'pay-m1-2',
          gym_id: 'gym-1',
          member_id: 'member-1',
          membership_id: 'mem-1',
          amount: 500,
          payment_method: 'cash',
          payment_date: '2026-10-20',
          transaction_reference: null,
          notes: null,
          created_at: '2026-10-20T10:00:00.000Z',
        },
      ];

      // Filtering for member-1
      const member1Payments = paymentsDatabase
        .filter((p) => p.member_id === 'member-1')
        .sort(comparePaymentsDesc);

      expect(member1Payments.length).toBe(2);
      expect(member1Payments.every((p) => p.member_id === 'member-1')).toBe(true);
      expect(member1Payments[0].id).toBe('pay-m1-2'); // 20 Oct newest
      expect(member1Payments[1].id).toBe('pay-m1-1'); // 18 Oct older
    });

    it('deduplicates payments defensively when rendering payment history', () => {
      const duplicatePayments: Payment[] = [
        {
          id: 'pay-dup-1',
          gym_id: 'gym-1',
          member_id: 'member-1',
          membership_id: 'mem-1',
          amount: 1000,
          payment_method: 'cash',
          payment_date: '2026-10-20',
          transaction_reference: null,
          notes: null,
          created_at: '2026-10-20T10:00:00.000Z',
        },
        {
          id: 'pay-dup-1', // duplicate ID
          gym_id: 'gym-1',
          member_id: 'member-1',
          membership_id: 'mem-1',
          amount: 1000,
          payment_method: 'cash',
          payment_date: '2026-10-20',
          transaction_reference: null,
          notes: null,
          created_at: '2026-10-20T10:00:00.000Z',
        },
      ];

      const deduplicated = Array.from(
        new Map(duplicatePayments.map((p) => [p.id, p])).values()
      ).sort(comparePaymentsDesc);

      expect(deduplicated.length).toBe(1);
      expect(deduplicated[0].id).toBe('pay-dup-1');
    });

    it('updates dues dynamically after adding a renewal payment', () => {
      const renewedMembership: MemberMembership = {
        id: 'renew-mem-1',
        gym_id: 'gym-1',
        member_id: 'member-1',
        plan_id: 'plan-1',
        plan_name_snapshot: 'Monthly',
        plan_price_snapshot: 3000,
        agreed_price: 3000,
        discount_amount: 0,
        duration_value_snapshot: 1,
        duration_unit_snapshot: 'months',
        start_date: '2026-10-20',
        end_date: '2026-11-20',
        status: 'active',
        created_at: '2026-10-20T12:00:00.000Z',
        updated_at: '2026-10-20T12:00:00.000Z',
      };

      // Before payment
      const initialDues = calculateMembershipDues(renewedMembership, []);
      expect(initialDues.totalPaid).toBe(0);
      expect(initialDues.outstandingBalance).toBe(3000);

      // After partial payment
      const renewalPayment: Payment = {
        id: 'pay-renew-1',
        gym_id: 'gym-1',
        member_id: 'member-1',
        membership_id: 'renew-mem-1',
        amount: 2000,
        payment_method: 'upi',
        payment_date: '2026-10-20',
        transaction_reference: 'UPI999',
        notes: 'Renewal payment',
        created_at: '2026-10-20T12:01:00.000Z',
      };

      const updatedDues = calculateMembershipDues(renewedMembership, [renewalPayment]);
      expect(updatedDues.totalPaid).toBe(2000);
      expect(updatedDues.outstandingBalance).toBe(1000);
    });
  });

  describe('Directory Status Filtering Logic (All, Active, Expiring, Expired, Dues, Archived)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 9, 20, 12, 0, 0)); // 20 Oct 2026
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const sampleMembers = [
      {
        id: 'mem-active-normal',
        full_name: 'Active Member Long',
        is_archived: false,
        current_membership: {
          id: 'cm-1',
          status: 'active' as const,
          end_date: '2027-01-20',
        } as MemberMembership,
        outstanding_balance: 0,
      },
      {
        id: 'mem-expiring-soon',
        full_name: 'Expiring Soon Member',
        is_archived: false,
        current_membership: {
          id: 'cm-2',
          status: 'active' as const,
          end_date: '2026-10-24', // 4 days left
        } as MemberMembership,
        outstanding_balance: 2500,
      },
      {
        id: 'mem-expired',
        full_name: 'Expired Member',
        is_archived: false,
        current_membership: {
          id: 'cm-3',
          status: 'expired' as const,
          end_date: '2026-10-10',
        } as MemberMembership,
        outstanding_balance: 0,
      },
      {
        id: 'mem-with-dues',
        full_name: 'Member With Dues',
        is_archived: false,
        current_membership: {
          id: 'cm-4',
          status: 'active' as const,
          end_date: '2026-11-20',
        } as MemberMembership,
        outstanding_balance: 1500,
      },
    ];

    it('filters "expiring" returning only members expiring within 7 days', () => {
      const filtered = sampleMembers.filter((m) => isMembershipExpiringSoon(m.current_membership, 7));
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('mem-expiring-soon');
    });

    it('filters "active" returning all active unexpired members', () => {
      const filtered = sampleMembers.filter((m) => isMembershipActive(m.current_membership));
      expect(filtered.length).toBe(3); // active-normal, expiring-soon, and with-dues
      expect(filtered.map((m) => m.id)).toEqual([
        'mem-active-normal',
        'mem-expiring-soon',
        'mem-with-dues',
      ]);
    });

    it('filters "expired" returning only expired members', () => {
      const filtered = sampleMembers.filter((m) => isMembershipExpired(m.current_membership));
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('mem-expired');
    });

    it('filters "dues" returning members with outstanding balance > 0', () => {
      const filtered = sampleMembers.filter((m) => m.outstanding_balance > 0);
      expect(filtered.length).toBe(2);
      expect(filtered.map((m) => m.id)).toEqual(['mem-expiring-soon', 'mem-with-dues']);
    });
  });
});
