import { addMonths, addDays, format, parseISO, isAfter, isBefore, isEqual, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { DATE_FORMAT } from '@/lib/constants';

/**
 * Calculate membership end date based on start date and plan duration.
 * 
 * Month-end clamping rule (handled by date-fns addMonths):
 * - Jan 31 + 1 month = Feb 28 (or Feb 29 in leap year)
 * - Jan 30 + 1 month = Feb 28 (or Feb 29 in leap year)  
 * - Mar 31 + 1 month = Apr 30
 * 
 * The end date is the last day of the membership period.
 * Example: Start Oct 17, Duration 3 months → End Jan 16 (day before the 3-month mark)
 * This gives exactly 3 calendar months of membership.
 */
export function calculateEndDate(
  startDate: Date | string,
  durationValue: number,
  durationUnit: 'days' | 'months'
): Date {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  
  if (durationUnit === 'months') {
    // Add months then subtract 1 day to get the last day of the period
    // Start: Oct 17 + 3 months = Jan 17, minus 1 day = Jan 16
    // This means the membership covers Oct 17 to Jan 16 inclusive (3 full months)
    const endPlusOne = addMonths(start, durationValue);
    return addDays(endPlusOne, -1);
  } else {
    // For days, subtract 1 because start day counts as day 1
    return addDays(start, durationValue - 1);
  }
}

/**
 * Calculate the start date for a renewal.
 * - If current membership is still active (endDate >= today): start day after endDate
 * - If current membership is expired (endDate < today): start today
 */
export function calculateRenewalStartDate(currentEndDate: Date | string): Date {
  const end = typeof currentEndDate === 'string' ? parseISO(currentEndDate) : currentEndDate;
  const today = startOfDay(new Date());
  
  if (isAfter(end, today) || isEqual(end, today)) {
    // Membership still active — continue from day after expiry
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
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, DATE_FORMAT.display);
}

/**
 * Format a date for long display (dd MMMM yyyy)
 * Example: "17 October 2026"
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, DATE_FORMAT.displayLong);
}

/**
 * Format a date for HTML date input (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, DATE_FORMAT.input);
}

/**
 * Check if a membership is expiring within the next N days
 */
export function isExpiringSoon(endDate: Date | string, withinDays: number = 7): boolean {
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const today = startOfDay(new Date());
  const daysLeft = differenceInDays(end, today);
  return daysLeft >= 0 && daysLeft <= withinDays;
}

/**
 * Check if a membership has expired
 */
export function isExpired(endDate: Date | string): boolean {
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const today = startOfDay(new Date());
  return isBefore(end, today);
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
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  return format(new Date(), DATE_FORMAT.input);
}
