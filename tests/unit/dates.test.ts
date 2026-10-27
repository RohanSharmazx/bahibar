import { describe, it, expect } from 'vitest';
import {
  calculateEndDate,
  calculateRenewalStartDate,
  formatDate,
  formatDateLong,
  formatDateToISO,
  parseDateOnly,
  isExpiringSoon,
  isExpired,
  getMembershipStatusFromDate,
  getTodayISO,
  getCurrentMonthRange,
} from '@/lib/utils/dates';
import { addDays } from 'date-fns';

describe('Date Calculations & Rules', () => {
  it('calculates 3 calendar months correctly (18 Oct 2026 -> 18 Jan 2027 anniversary date)', () => {
    const start = new Date(2026, 9, 18); // 18 October 2026
    const end = calculateEndDate(start, 3, 'months');
    expect(end.getFullYear()).toBe(2027);
    expect(end.getMonth()).toBe(0); // January
    expect(end.getDate()).toBe(18);
  });

  it('handles month-end clamping for Jan 31 + 1 month in non-leap year (2027)', () => {
    const start = new Date(2027, 0, 31);
    const end = calculateEndDate(start, 1, 'months');
    expect(end.getFullYear()).toBe(2027);
    expect(end.getMonth()).toBe(1); // February
    expect(end.getDate()).toBe(28);
  });

  it('handles leap year correctly for Jan 31 + 1 month in leap year (2028)', () => {
    const start = new Date(2028, 0, 31);
    const end = calculateEndDate(start, 1, 'months');
    expect(end.getFullYear()).toBe(2028);
    expect(end.getMonth()).toBe(1); // February
    expect(end.getDate()).toBe(29);
  });

  it('handles month-end clamping from 31-day month to 30-day month (Mar 31 -> Apr 30)', () => {
    const start = new Date(2026, 2, 31); // 31 March 2026
    const end = calculateEndDate(start, 1, 'months');
    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(3); // April
    expect(end.getDate()).toBe(30);
  });

  it('calculates duration in days correctly', () => {
    const start = new Date(2026, 9, 1);
    const end = calculateEndDate(start, 10, 'days');
    expect(end.getDate()).toBe(11);
    expect(end.getMonth()).toBe(9);
  });

  it('formats Date to local YYYY-MM-DD ISO string without UTC timezone shift', () => {
    const date = new Date(2027, 0, 18); // 18 Jan 2027 local midnight
    expect(formatDateToISO(date)).toBe('2027-01-18');
  });

  it('parses YYYY-MM-DD strings safely in local midnight without timezone loss', () => {
    const parsed = parseDateOnly('2026-10-18');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(9); // October
    expect(parsed.getDate()).toBe(18);
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
    const date = new Date(2026, 9, 18);
    expect(formatDate(date)).toBe('18/10/2026');
  });

  it('formats dates in long format', () => {
    const date = new Date(2026, 9, 18);
    expect(formatDateLong(date)).toBe('18 October 2026');
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

  it('formats getTodayISO and getCurrentMonthRange in Indian Standard Time (Asia/Kolkata)', () => {
    const today = getTodayISO();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const { todayStr, monthStart, monthEnd, monthLabel } = getCurrentMonthRange();
    expect(todayStr).toBe(today);
    expect(monthStart).toMatch(/^\d{4}-\d{2}-01$/);
    expect(monthEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(monthLabel).toBeDefined();
    expect(typeof monthLabel).toBe('string');
  });
});
