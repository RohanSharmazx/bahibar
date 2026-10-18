import { CURRENCY } from '@/lib/constants';

/**
 * Format a number as Indian Rupees (₹)
 * Example: 2000 → "₹2,000.00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format currency without decimal places for whole amounts
 * Example: 2000 → "₹2,000", 2000.50 → "₹2,000.50"
 */
export function formatCurrencyCompact(amount: number): string {
  const hasDecimals = amount % 1 !== 0;
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse a currency string back to number
 * Handles formats like "₹2,000.00" or "2000"
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
