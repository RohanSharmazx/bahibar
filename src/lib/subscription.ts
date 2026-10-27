import { differenceInDays, parseISO, startOfDay, isAfter, isBefore } from 'date-fns';
import { SAAS_CONFIG } from '@/lib/subscription-plans';
import type { SoftwareSubscription, SubscriptionStatus } from '@/types';

export interface EvaluatedSubscription {
  effectiveStatus: SubscriptionStatus;
  isReadOnly: boolean;
  canMutate: boolean;
  daysLeft: number;
  isExpiringSoon: boolean;
  inGracePeriod: boolean;
  graceDaysLeft: number;
  rawSubscription: SoftwareSubscription | null;
}

/**
 * Authoritatively evaluates subscription status against server-side current time.
 * Prevents client-side clock tampering or stale DB status fields from bypassing
 * trial expiration or payment renewal requirements.
 */
export function evaluateSubscription(
  sub: SoftwareSubscription | null | undefined,
  currentDate: Date = new Date()
): EvaluatedSubscription {
  if (!sub) {
    return {
      effectiveStatus: 'expired',
      isReadOnly: true,
      canMutate: false,
      daysLeft: 0,
      isExpiringSoon: false,
      inGracePeriod: false,
      graceDaysLeft: 0,
      rawSubscription: null,
    };
  }

  if (sub.status === 'pilot' || sub.plan_name === 'pilot' || sub.plan_name === 'Free Pilot') {
    return {
      effectiveStatus: 'active',
      isReadOnly: false,
      canMutate: true,
      daysLeft: 365,
      isExpiringSoon: false,
      inGracePeriod: false,
      graceDaysLeft: 0,
      rawSubscription: sub,
    };
  }

  if (sub.status === 'cancelled') {
    return {
      effectiveStatus: 'cancelled',
      isReadOnly: true,
      canMutate: false,
      daysLeft: 0,
      isExpiringSoon: false,
      inGracePeriod: false,
      graceDaysLeft: 0,
      rawSubscription: sub,
    };
  }

  const today = startOfDay(currentDate);
  const endDate = startOfDay(parseISO(sub.end_date));
  const diffDays = differenceInDays(endDate, today);

  // If still within valid period
  if (diffDays >= 0) {
    const isExpiringSoon = diffDays <= SAAS_CONFIG.trialReminderThresholdDays;
    return {
      effectiveStatus: sub.status === 'active' ? 'active' : 'trial',
      isReadOnly: false,
      canMutate: true,
      daysLeft: diffDays,
      isExpiringSoon,
      inGracePeriod: false,
      graceDaysLeft: 0,
      rawSubscription: sub,
    };
  }

  // End date has elapsed (diffDays < 0)
  const overdueDays = Math.abs(diffDays);

  // Check if eligible for paid active plan renewal grace period
  if (sub.status === 'active' && overdueDays <= SAAS_CONFIG.gracePeriodDays) {
    const graceDaysLeft = Math.max(0, SAAS_CONFIG.gracePeriodDays - overdueDays + 1);
    return {
      effectiveStatus: 'past_due',
      isReadOnly: false, // Write access granted during grace period
      canMutate: true,
      daysLeft: 0,
      isExpiringSoon: true,
      inGracePeriod: true,
      graceDaysLeft,
      rawSubscription: sub,
    };
  }

  // Trial expired or grace period elapsed -> strict Read-Only mode
  return {
    effectiveStatus: 'expired',
    isReadOnly: true,
    canMutate: false,
    daysLeft: 0,
    isExpiringSoon: false,
    inGracePeriod: false,
    graceDaysLeft: 0,
    rawSubscription: sub,
  };
}

/**
 * Server-side guard to assert active subscription before write operations.
 * Throws a user-friendly error if read-only mode is active.
 */
export function assertActiveSubscription(
  sub: SoftwareSubscription | null | undefined,
  currentDate: Date = new Date()
): void {
  const evaluated = evaluateSubscription(sub, currentDate);
  if (!evaluated.canMutate) {
    throw new Error(
      'Your BahiBar software subscription or 30-day trial has ended. ' +
      'Your gym workspace is currently in Read-Only mode. All records remain safe and exportable. ' +
      'Please renew or upgrade in Settings to resume adding members or recording payments.'
    );
  }
}
