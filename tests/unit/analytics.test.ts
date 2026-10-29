import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sanitizeAnalyticsProps,
  trackEvent,
  trackSignupCtaClicked,
  trackPaymentRecorded,
  trackMembershipRenewed,
  resetAnalytics,
} from '@/lib/analytics';

describe('PostHog Cloud Analytics & PII Stripping', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('sanitizeAnalyticsProps', () => {
    it('returns empty object when given empty or undefined input', () => {
      expect(sanitizeAnalyticsProps()).toEqual({});
      expect(sanitizeAnalyticsProps(undefined)).toEqual({});
    });

    it('strips sensitive member identity keys', () => {
      const raw = {
        name: 'Rohan Sharma',
        full_name: 'Amit Kumar',
        member_name: 'Pooja Verma',
        email: 'owner@gym.in',
        phone: '+91 9876543210',
        mobile: '9876543210',
        emergency_contact: '9988776655',
        address: 'Sector 14, Gurugram',
        plan_duration: '3 months',
      };

      const sanitized = sanitizeAnalyticsProps(raw);

      expect(sanitized).toEqual({
        plan_duration: '3 months',
      });
      expect(sanitized.name).toBeUndefined();
      expect(sanitized.full_name).toBeUndefined();
      expect(sanitized.email).toBeUndefined();
      expect(sanitized.phone).toBeUndefined();
      expect(sanitized.mobile).toBeUndefined();
    });

    it('strips monetary values and sensitive payment details', () => {
      const raw = {
        payment_method: 'cash',
        amount: 2500,
        price: 3000,
        paid_amount: 1500,
        due_amount: 1000,
        balance: 500,
        is_first_payment: true,
      };

      const sanitized = sanitizeAnalyticsProps(raw);

      expect(sanitized).toEqual({
        payment_method: 'cash',
        is_first_payment: true,
      });
      expect(sanitized.amount).toBeUndefined();
      expect(sanitized.price).toBeUndefined();
      expect(sanitized.paid_amount).toBeUndefined();
    });

    it('strips values containing email addresses or phone number strings even if key is generic', () => {
      const raw = {
        metadata: 'contact me at test@example.com',
        alt_contact: '+91 9876543210',
        status: 'active',
        tier: 'gold',
      };

      const sanitized = sanitizeAnalyticsProps(raw);

      expect(sanitized).toEqual({
        status: 'active',
        tier: 'gold',
      });
    });
  });

  describe('safe fallback behavior', () => {
    it('no-ops safely when NEXT_PUBLIC_POSTHOG_KEY is not defined', () => {
      expect(() => {
        trackEvent('test_event', { foo: 'bar' });
        trackSignupCtaClicked('test');
        trackPaymentRecorded({ payment_method: 'cash' });
        trackMembershipRenewed({ duration_value: 3, duration_unit: 'months' });
        resetAnalytics();
      }).not.toThrow();
    });
  });
});
