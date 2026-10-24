import { describe, it, expect } from 'vitest';
import {
  buildReceiptPdfBytes,
  normalizeIndianPhoneNumber,
  generateReceiptWhatsAppUrl,
  generateReceiptEmailUrl,
  type ReceiptPdfData,
} from '@/lib/utils/pdf';

describe('Zero-Dependency PDF Generator & Sharing Utilities', () => {
  const sampleReceipt: ReceiptPdfData = {
    id: 'f93c8d10-8b1e-4509-8d76-bc30e38a2e10',
    amount: 1500,
    payment_date: '2026-10-18',
    payment_method: 'upi',
    transaction_reference: 'UPI-987654321',
    notes: 'Partial payment',
    memberName: 'Rahul Sharma',
    memberMobile: '9876543210',
    memberEmail: 'rahul@example.com',
    planName: 'Quarterly Fitness',
    gymName: 'Iron Fitness Gym',
    gymPhone: '+91 98765 12345',
    gymAddress: '123 MG Road, Bengaluru',
    agreedPrice: 3000,
    startDate: '2026-10-18',
    endDate: '2027-01-17',
    outstandingBalance: 1500,
  };

  it('generates a compliant PDF-1.4 byte stream', () => {
    const bytes = buildReceiptPdfBytes(sampleReceipt);
    expect(bytes.byteLength).toBeGreaterThan(500);

    const pdfString = new TextDecoder('utf-8').decode(bytes);
    expect(pdfString.startsWith('%PDF-1.4')).toBe(true);
    expect(pdfString.includes('%%EOF')).toBe(true);
    expect(pdfString.includes('xref')).toBe(true);
    expect(pdfString.includes('trailer')).toBe(true);
    expect(pdfString.includes('/Type /Catalog')).toBe(true);
  });

  it('normalizes Indian phone numbers accurately', () => {
    expect(normalizeIndianPhoneNumber('9876543210')).toBe('919876543210');
    expect(normalizeIndianPhoneNumber('09876543210')).toBe('919876543210');
    expect(normalizeIndianPhoneNumber('+91 98765 43210')).toBe('919876543210');
    expect(normalizeIndianPhoneNumber('+91-98765-43210')).toBe('919876543210');
    expect(normalizeIndianPhoneNumber('919876543210')).toBe('919876543210');
  });

  it('generates valid WhatsApp click-to-chat links', () => {
    const waUrl = generateReceiptWhatsAppUrl(sampleReceipt);
    expect(waUrl.startsWith('https://wa.me/919876543210?text=')).toBe(true);
    expect(waUrl).toContain('Rahul%20Sharma');
    expect(waUrl).toContain('Iron%20Fitness%20Gym');
  });

  it('generates valid mailto links', () => {
    const mailUrl = generateReceiptEmailUrl(sampleReceipt);
    expect(mailUrl.startsWith('mailto:rahul@example.com?subject=')).toBe(true);
    expect(mailUrl).toContain('Iron%20Fitness%20Gym');
  });
});
