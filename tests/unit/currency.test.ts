import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCurrencyCompact, parseCurrencyInput } from '@/lib/utils/currency';

describe('Currency Formatting & Parsing (INR / ₹)', () => {
  it('formats currency with symbol and 2 decimal places', () => {
    const formatted = formatCurrency(2000);
    // Should contain ₹ and 2,000.00
    expect(formatted).toContain('₹');
    expect(formatted).toContain('2,000.00');
  });

  it('formats large amounts with Indian number grouping', () => {
    const formatted = formatCurrency(150000);
    expect(formatted).toContain('1,50,000.00');
  });

  it('formats compact currency without decimals for whole numbers', () => {
    const formatted = formatCurrencyCompact(2000);
    expect(formatted).toContain('₹');
    expect(formatted).toContain('2,000');
    expect(formatted).not.toContain('.00');
  });

  it('formats compact currency with decimals when cents exist', () => {
    const formatted = formatCurrencyCompact(2000.5);
    expect(formatted).toContain('2,000.50');
  });

  it('parses currency input strings back to numbers', () => {
    expect(parseCurrencyInput('₹2,000.00')).toBe(2000);
    expect(parseCurrencyInput('2,000')).toBe(2000);
    expect(parseCurrencyInput('  ₹ 1,50,000  ')).toBe(150000);
    expect(parseCurrencyInput('invalid')).toBe(0);
  });
});
