import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCurrencyCompact, parseCurrencyInput, sanitizeCurrencyInput } from '@/lib/utils/currency';

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

  describe('sanitizeCurrencyInput (Extra Zero Prevention)', () => {
    it('strips accidental leading zero when typing whole numbers (e.g. 01000 -> 1000)', () => {
      expect(sanitizeCurrencyInput('01000')).toBe('1000');
      expect(sanitizeCurrencyInput('01500')).toBe('1500');
      expect(sanitizeCurrencyInput('014000')).toBe('14000');
      expect(sanitizeCurrencyInput('0050')).toBe('50');
    });

    it('preserves valid zero and decimal amounts (e.g. 0, 0.50)', () => {
      expect(sanitizeCurrencyInput('0')).toBe('0');
      expect(sanitizeCurrencyInput('0.5')).toBe('0.5');
      expect(sanitizeCurrencyInput('0.00')).toBe('0.00');
    });

    it('allows empty string so users can backspace and clear the field without sticky zero', () => {
      expect(sanitizeCurrencyInput('')).toBe('');
    });

    it('strips non-numeric characters and extra decimal points', () => {
      expect(sanitizeCurrencyInput('₹1,000.50')).toBe('1000.50');
      expect(sanitizeCurrencyInput('10.5.2')).toBe('10.52');
      expect(sanitizeCurrencyInput('-500')).toBe('500');
    });
  });
});

