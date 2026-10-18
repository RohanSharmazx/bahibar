import { describe, it, expect } from 'vitest';
import {
  calculateEndDate,
  calculateRenewalStartDate,
  formatDate,
  formatDateLong,
  isExpiringSoon,
  isExpired,
  getMembershipStatusFromDate,
} from '@/lib/utils/dates';
import { addDays } from 'date-fns';

describe('Date Calculations & Rules', () => {
  it('calculates 3 calendar months correctly (normal case)', () => {
    // 17 Oct 2026 + 3 months -> 16 Jan 2027
    const start = new Date(2026, 9, 17); // Month is 0-indexed: 9 = October
    const end = calculateEndDate(start, 3, 'months');
    expect(end.getFullYear()).toBe(2027);
    expect(end.getMonth()).toBe(0); // January
    expect(end.getDate()).toBe(16);
  });

  it('handles month-end clamping for Jan 31 + 1 month in non-leap year', () => {
    // 31 Jan 2027 + 1 month -> clamped to 27 Feb 2027 (since last day of 1-month period ending before 28 Feb)
    const start = new Date(2027, 0, 31);
    const end = calculateEndDate(start, 1, 'months');
    expect(end.getFullYear()).toBe(2027);
    expect(end.getMonth()).toBe(1); // February
    expect(end.getDate()).toBe(27);
  });

  it('handles leap year correctly for Jan 31 + 1 month in leap year (2028)', () => {
    // 31 Jan 2028 + 1 month -> Feb 29 - 1 day = 28 Feb 2028
    const start = new Date(2028, 0, 31);
    const end = calculateEndDate(start, 1, 'months');
    expect(end.getFullYear()).toBe(2028);
    expect(end.getMonth()).toBe(1); // February
    expect(end.getDate()).toBe(28);
  });

  it('calculates duration in days correctly', () => {
    // 10 days starting 1 Oct -> ends 10 Oct (inclusive)
    const start = new Date(2026, 9, 1);
    const end = calculateEndDate(start, 10, 'days');
    expect(end.getDate()).toBe(10);
    expect(end.getMonth()).toBe(9);
  });

  it('calculates renewal start date for active membership (starts day after expiry)', () => {
    const futureExpiry = addDays(new Date(), 10);
    const renewalStart = calculateRenewalStartDate(futureExpiry);
    const expected = addDays(futureExpiry, 1);
    expect(renewalStart.getDate()).toBe(expected.getDate());
    expect(renewalStart.getMonth()).toBe(expected.getMonth());
  });

  it('calculates renewal start date for expired membership (starts today)', () => {
    const pastExpiry = addDays(new Date(), -10);
    const renewalStart = calculateRenewalStartDate(pastExpiry);
    const today = new Date();
    expect(renewalStart.getDate()).toBe(today.getDate());
    expect(renewalStart.getMonth()).toBe(today.getMonth());
  });

  it('formats dates in DD/MM/YYYY format', () => {
    const date = new Date(2026, 9, 17);
    expect(formatDate(date)).toBe('17/10/2026');
  });

  it('formats dates in long format', () => {
    const date = new Date(2026, 9, 17);
    expect(formatDateLong(date)).toBe('17 October 2026');
  });

  it('correctly identifies expiring soon status', () => {
    const in3Days = addDays(new Date(), 3);
    expect(isExpiringSoon(in3Days, 7)).toBe(true);
    expect(getMembershipStatusFromDate(in3Days)).toBe('expiring');

    const in20Days = addDays(new Date(), 20);
    expect(isExpiringSoon(in20Days, 7)).toBe(false);
    expect(getMembershipStatusFromDate(in20Days)).toBe('active');
  });

  it('correctly identifies expired status', () => {
    const yesterday = addDays(new Date(), -1);
    expect(isExpired(yesterday)).toBe(true);
    expect(getMembershipStatusFromDate(yesterday)).toBe('expired');
  });
});
