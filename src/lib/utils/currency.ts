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

/**
 * Sanitize currency input string to prevent leading zeroes while allowing decimals and empty input.
 * Examples:
 * - "01000" → "1000"
 * - "0050" → "50"
 * - "0" → "0"
 * - "0.50" → "0.50"
 * - "" → ""
 * - "1000" → "1000"
 */
export function sanitizeCurrencyInput(value: string): string {
  if (!value) return '';

  // Remove any non-digit, non-period characters
  let cleaned = value.replace(/[^\d.]/g, '');

  // Keep only the first decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  // If starts with multiple zeroes or zero followed by a digit (not dot), strip leading zeroes
  if (cleaned.length > 1 && cleaned.startsWith('0') && cleaned[1] !== '.') {
    cleaned = cleaned.replace(/^0+/, '');
    if (cleaned === '' || cleaned.startsWith('.')) {
      cleaned = '0' + cleaned;
    }
  }

  return cleaned;
}
