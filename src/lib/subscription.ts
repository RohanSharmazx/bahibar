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

export interface SubscriptionEvaluationOptions {
  enforcePaywall?: boolean;
}

/**
 * Authoritatively evaluates subscription status against server-side current time.
 * Calculates lifecycle dates while respecting open source / free pilot configuration.
 */
export function evaluateSubscription(
  sub: SoftwareSubscription | null | undefined,
  currentDate: Date = new Date(),
  options: SubscriptionEvaluationOptions = {}
): EvaluatedSubscription {
  const shouldEnforce = options.enforcePaywall ?? SAAS_CONFIG.enforcePaywall;

  if (!sub) {
    return {
      effectiveStatus: shouldEnforce ? 'expired' : 'active',
      isReadOnly: shouldEnforce,
      canMutate: !shouldEnforce,
      daysLeft: shouldEnforce ? 0 : 365,
      isExpiringSoon: false,
      inGracePeriod: false,
      graceDaysLeft: 0,
      rawSubscription: null,
    };
  }

  if (sub.status === 'cancelled') {
    return {
      effectiveStatus: 'cancelled',
      isReadOnly: shouldEnforce,
      canMutate: !shouldEnforce,
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

  // Trial expired or grace period elapsed
  return {
    effectiveStatus: 'expired',
    isReadOnly: shouldEnforce ? true : false,
    canMutate: shouldEnforce ? false : true,
    daysLeft: 0,
    isExpiringSoon: false,
    inGracePeriod: false,
    graceDaysLeft: 0,
    rawSubscription: sub,
  };
}

/**
 * Server-side guard to assert active subscription before write operations.
 * In Open Source / Free Community Pilot mode, this is a non-blocking no-op.
 * Throws a user-friendly error if read-only mode is active and paywall enforcement is enabled.
 */
export function assertActiveSubscription(
  sub: SoftwareSubscription | null | undefined,
  currentDate: Date = new Date(),
  options: SubscriptionEvaluationOptions = {}
): void {
  const shouldEnforce = options.enforcePaywall ?? SAAS_CONFIG.enforcePaywall;
  if (!shouldEnforce) {
    return;
  }

  const evaluated = evaluateSubscription(sub, currentDate, { enforcePaywall: true });
  if (!evaluated.canMutate) {
    throw new Error(
      'Your BahiBar software subscription or 30-day trial has ended. ' +
      'Your gym workspace is currently in Read-Only mode. All records remain safe and exportable. ' +
      'Please renew or upgrade in Settings to resume adding members or recording payments.'
    );
  }
}
