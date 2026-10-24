import type { MemberMembership, Payment } from '@/types';
import { getDaysRemaining, isExpired, isExpiringSoon, parseDateOnly } from './dates';

/**
 * Resolves the single source of truth for a member's current membership.
 *
 * Priority:
 * 1. Active memberships (`status === 'active'`).
 *    If multiple active memberships exist, pick the most recent by start_date desc,
 *    then created_at desc.
 * 2. If no active membership, pick the most recent membership by end_date desc,
 *    then start_date desc.
 * 3. Returns null if member has no memberships.
 */
export function resolveCurrentMembership(
  memberships: MemberMembership[] | null | undefined
): MemberMembership | null {
  if (!memberships || memberships.length === 0) return null;

  const activeMemberships = memberships.filter((m) => m.status === 'active');
  if (activeMemberships.length > 0) {
    return [...activeMemberships].sort((a, b) => {
      const startDiff = new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      if (startDiff !== 0) return startDiff;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    })[0];
  }

  return [...memberships].sort((a, b) => {
    const endDiff = new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
    if (endDiff !== 0) return endDiff;
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
  })[0];
}

/**
 * Calculates dues for a given membership period and payment list.
 * Dues = Math.max(0, agreed_price - totalPaymentsForPeriod).
 */
export function calculateMembershipDues(
  membership: MemberMembership | null,
  payments: Payment[] | null | undefined
): { totalPaid: number; outstandingBalance: number } {
  if (!membership) {
    return { totalPaid: 0, outstandingBalance: 0 };
  }

  const membershipPayments = (payments || []).filter((p) => p.membership_id === membership.id);
  const totalPaid = membershipPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const agreedPrice = Number(membership.agreed_price || 0);
  const outstandingBalance = Math.max(0, agreedPrice - totalPaid);

  return { totalPaid, outstandingBalance };
}

/**
 * Checks if a membership is considered active (status === 'active' and not expired by date).
 */
export function isMembershipActive(membership: MemberMembership | null): boolean {
  if (!membership || membership.status !== 'active') return false;
  return !isExpired(membership.end_date);
}

/**
 * Checks if a membership is expiring within N days (inclusive, default 7 days).
 */
export function isMembershipExpiringSoon(
  membership: MemberMembership | null,
  withinDays: number = 7
): boolean {
  if (!membership || membership.status !== 'active') return false;
  return isExpiringSoon(membership.end_date, withinDays);
}

/**
 * Checks if a membership is expired (either explicitly marked expired or end_date in past).
 */
export function isMembershipExpired(membership: MemberMembership | null): boolean {
  if (!membership) return false;
  if (membership.status === 'expired') return true;
  if (membership.status === 'cancelled') return false;
  return isExpired(membership.end_date);
}

/**
 * Deterministically compares two payments for chronological descending sort (newest first).
 * 1. Primary sort: payment_date descending (parsed safely to timestamps, avoiding lexicographical string issues)
 * 2. Secondary sort: created_at timestamp descending (handles same-day payments)
 * 3. Tertiary sort: transaction ID descending (deterministic tie-breaker)
 */
export function comparePaymentsDesc<T extends { payment_date: string; created_at?: string; id?: string }>(
  a: T,
  b: T
): number {
  const timeA = parseDateOnly(a.payment_date).getTime();
  const timeB = parseDateOnly(b.payment_date).getTime();
  if (timeB !== timeA) {
    return timeB - timeA;
  }

  const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;
  const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;
  if (createdB !== createdA) {
    return createdB - createdA;
  }

  return (b.id || '').localeCompare(a.id || '');
}
