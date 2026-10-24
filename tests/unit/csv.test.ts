import { describe, it, expect } from 'vitest';
import { generateCsv } from '@/lib/utils/csv';

describe('CSV Generation & Injection Protection', () => {
  it('protects against formula injection characters (=, +, -, @, tab, CR)', () => {
    const maliciousData = [
      { name: '=cmd|’ /C calc’!A0', phone: '9876543210' },
      { name: '+12345', phone: '9876543211' },
      { name: '-SUM(A1:A10)', phone: '9876543212' },
      { name: '@SUM(A1:A10)', phone: '9876543213' },
      { name: '\tmalicious', phone: '9876543214' },
      { name: '\rmalicious', phone: '9876543215' },
    ];

    const columns = [
      { key: 'name' as const, header: 'Name' },
      { key: 'phone' as const, header: 'Phone' },
    ];

    const csv = generateCsv(maliciousData, columns);

    // Verify UTF-8 BOM is present
    expect(csv.startsWith('\uFEFF')).toBe(true);

    // Verify formula triggers are prefixed with a single quote
    expect(csv).toContain("'=cmd");
    expect(csv).toContain("'+12345");
    expect(csv).toContain("'-SUM");
    expect(csv).toContain("'@SUM");
  });

  it('escapes fields with commas and double quotes correctly', () => {
    const data = [
      { name: 'Sharma, Rahul', notes: 'Says "hello world"' },
    ];

    const columns = [
      { key: 'name' as const, header: 'Full Name' },
      { key: 'notes' as const, header: 'Notes' },
    ];

    const csv = generateCsv(data, columns);
    expect(csv).toContain('"Sharma, Rahul"');
    expect(csv).toContain('"Says ""hello world"""');
  });

  it('handles empty and null values gracefully', () => {
    const data = [
      { name: 'Amit Kumar', email: null, phone: undefined },
    ];

    const columns = [
      { key: 'name' as const, header: 'Name' },
      { key: 'email' as const, header: 'Email' },
      { key: 'phone' as const, header: 'Phone' },
    ];

    const csv = generateCsv(data as any, columns);
    expect(csv).toContain('Amit Kumar,,');
  });
});
