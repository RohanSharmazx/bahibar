import { addMonths, addDays, format, parseISO, isAfter, isBefore, isEqual, differenceInDays, startOfDay } from 'date-fns';
import { DATE_FORMAT } from '@/lib/constants';

/**
 * Safely parse a date-only string (YYYY-MM-DD) or Date into a Date object at local midnight.
 * Avoids UTC timezone shift errors when parsing date-only strings.
 */
export function parseDateOnly(date: Date | string): Date {
  if (date instanceof Date) return startOfDay(date);
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    const [year, month, day] = date.trim().split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return startOfDay(parseISO(date));
}

/**
 * Format Date object to YYYY-MM-DD string in local timezone (avoids UTC offset shifts).
 */
export function formatDateToISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Calculate membership expiry/anniversary date based on start date and plan duration.
 *
 * Calendar Month Arithmetic:
 * - 18 Oct 2026 + 3 months = 18 Jan 2027 (Anniversary date)
 *
 * Month-End Clamping (handled automatically by addMonths):
 * - 31 Jan 2027 + 1 month = 28 Feb 2027 (non-leap year)
 * - 31 Jan 2028 + 1 month = 29 Feb 2028 (leap year)
 * - 31 Mar 2026 + 1 month = 30 Apr 2026
 *
 * Duration in Days:
 * - Start 18 Oct + 30 days = 17 Nov
 */
export function calculateEndDate(
  startDate: Date | string,
  durationValue: number,
  durationUnit: 'days' | 'months'
): Date {
  const start = parseDateOnly(startDate);

  if (durationUnit === 'months') {
    return addMonths(start, durationValue);
  } else {
    return addDays(start, durationValue);
  }
}

/**
 * Calculate the start date for a renewal.
 * - If current membership is still active (endDate >= today): continues from the day after expiry
 * - If current membership is expired (endDate < today): starts today
 */
export function calculateRenewalStartDate(currentEndDate: Date | string): Date {
  const end = parseDateOnly(currentEndDate);
  const today = startOfDay(new Date());

  if (isAfter(end, today) || isEqual(end, today)) {
    // Membership still active — continue uninterrupted from day after expiry
    return addDays(end, 1);
  } else {
    // Membership expired — start from today
    return today;
  }
}

/**
 * Format a date for display (DD/MM/YYYY)
 */
export function formatDate(date: Date | string): string {
  const d = parseDateOnly(date);
  return format(d, DATE_FORMAT.display);
}

/**
 * Format a date for long display (dd MMMM yyyy)
 * Example: "18 October 2026"
 */
export function formatDateLong(date: Date | string): string {
  const d = parseDateOnly(date);
  return format(d, DATE_FORMAT.displayLong);
}

/**
 * Format a date for HTML date input (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  const d = parseDateOnly(date);
  return format(d, DATE_FORMAT.input);
}

/**
 * Get days remaining until expiry (negative if expired)
 */
export function getDaysRemaining(endDate: Date | string): number {
  const end = parseDateOnly(endDate);
  const today = startOfDay(new Date());
  return differenceInDays(end, today);
}

/**
 * Check if a membership is expiring within the next N days
 */
export function isExpiringSoon(endDate: Date | string, withinDays: number = 7): boolean {
  const daysLeft = getDaysRemaining(endDate);
  return daysLeft >= 0 && daysLeft <= withinDays;
}

/**
 * Check if a membership has expired
 */
export function isExpired(endDate: Date | string): boolean {
  const daysLeft = getDaysRemaining(endDate);
  return daysLeft < 0;
}

/**
 * Get the membership status label based on end date
 */
export function getMembershipStatusFromDate(endDate: Date | string): 'active' | 'expiring' | 'expired' {
  if (isExpired(endDate)) return 'expired';
  if (isExpiringSoon(endDate)) return 'expiring';
  return 'active';
}

/**
 * Get today's date as ISO string (YYYY-MM-DD) in Indian Standard Time (Asia/Kolkata).
 * Aligns serverless environments (which run in UTC) with local Indian gym operating hours.
 */
export function getTodayISO(timeZone: string = 'Asia/Kolkata'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    return format(new Date(), DATE_FORMAT.input);
  }
}

/**
 * Get calendar month date range and human-readable label in Indian Standard Time (Asia/Kolkata).
 */
export function getCurrentMonthRange(timeZone: string = 'Asia/Kolkata'): {
  todayStr: string;
  monthStart: string;
  monthEnd: string;
  monthLabel: string;
} {
  const todayStr = getTodayISO(timeZone);
  const [yearStr, monthStr] = todayStr.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const monthStart = `${yearStr}-${monthStr}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const monthEnd = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

  const d = new Date(year, month - 1, 1);
  const monthLabel = new Intl.DateTimeFormat('en-IN', {
    timeZone,
    month: 'long',
    year: 'numeric',
  }).format(d);

  return { todayStr, monthStart, monthEnd, monthLabel };
}
