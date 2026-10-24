/**
 * Pure TypeScript Zero-Dependency PDF-1.4 Generator for Fee Receipts.
 * Generates standards-compliant, standalone PDF files for printable receipt vouchers.
 */

export interface ReceiptPdfData {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_reference?: string | null;
  notes?: string | null;
  memberName: string;
  memberMobile?: string | null;
  memberEmail?: string | null;
  planName?: string;
  gymName?: string;
  gymPhone?: string;
  gymAddress?: string | null;
  agreedPrice?: number;
  startDate?: string;
  endDate?: string;
  outstandingBalance?: number;
}

/**
 * Sanitize text for standard PDF Type 1 Helvetica font (ASCII/WinAnsi).
 * Replaces currency symbol ₹ with Rs., bullet • with -, and escapes PDF characters.
 */
function sanitizePdfText(text: string): string {
  if (!text) return '';
  return text
    .replace(/₹/g, 'Rs. ')
    .replace(/[•]/g, '-')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Format currency for PDF output.
 * e.g., 2000 -> "Rs. 2,000.00"
 */
function formatPdfCurrency(amount: number): string {
  const parts = Math.abs(amount).toFixed(2).split('.');
  const whole = parts[0];
  const decimal = parts[1];

  // Indian number grouping (e.g. 1,00,000 or 10,000)
  let lastThree = whole.substring(whole.length - 3);
  const otherNumbers = whole.substring(0, whole.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedWhole = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return `Rs. ${amount < 0 ? '-' : ''}${formattedWhole}.${decimal}`;
}

/**
 * Format a date string (YYYY-MM-DD) to DD/MM/YYYY for PDF display.
 */
function formatPdfDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Build PDF-1.4 binary content for a receipt voucher.
 */
export function buildReceiptPdfBytes(data: ReceiptPdfData): Uint8Array {
  const receiptNo = `REC-${data.id.slice(0, 8).toUpperCase()}`;
  const gymName = data.gymName || 'BahiBar Fitness Partner';
  const gymAddress = data.gymAddress || '';
  const gymPhone = data.gymPhone ? `Ph: ${data.gymPhone}` : '';

  // Stream drawing commands (PDF coordinate system: 595.28 x 841.89 A4)
  const ops: string[] = [];

  // Top header card background
  ops.push('0.96 0.97 0.98 rg'); // Light slate fill
  ops.push('40 700 515 100 re f');
  ops.push('0.85 0.88 0.92 RG 1 w');
  ops.push('40 700 515 100 re S');

  // Gym Name
  ops.push('BT /F2 18 Tf 0.1 0.15 0.25 rg 55 765 Td (' + sanitizePdfText(gymName) + ') Tj ET');

  // Gym Address & Phone
  if (gymAddress) {
    ops.push('BT /F1 9 Tf 0.4 0.45 0.5 rg 55 745 Td (' + sanitizePdfText(gymAddress) + ') Tj ET');
  }
  if (gymPhone) {
    ops.push('BT /F1 9 Tf 0.4 0.45 0.5 rg 55 730 Td (' + sanitizePdfText(gymPhone) + ') Tj ET');
  }

  // PAID Badge (top right of header card)
  ops.push('0.85 0.96 0.90 rg'); // Emerald light fill
  ops.push('475 755 65 24 re f');
  ops.push('0.2 0.7 0.4 RG 1 w');
  ops.push('475 755 65 24 re S');
  ops.push('BT /F2 11 Tf 0.05 0.5 0.25 rg 493 762 Td (PAID) Tj ET');

  // Receipt Number
  ops.push('BT /F2 10 Tf 0.35 0.4 0.45 rg 460 735 Td (' + sanitizePdfText(receiptNo) + ') Tj ET');

  // Voucher details box
  ops.push('0.98 0.98 0.99 rg');
  ops.push('40 550 515 130 re f');
  ops.push('0.88 0.9 0.93 RG 1 w');
  ops.push('40 550 515 130 re S');

  // Section Header: Member & Payment Meta
  ops.push('BT /F2 10 Tf 0.5 0.55 0.6 rg 55 655 Td (MEMBER DETAILS) Tj ET');
  ops.push('BT /F2 10 Tf 0.5 0.55 0.6 rg 310 655 Td (RECEIPT DETAILS) Tj ET');

  // Left col: Member Name, Mobile, Email
  ops.push('BT /F2 12 Tf 0.1 0.15 0.2 rg 55 635 Td (' + sanitizePdfText(data.memberName) + ') Tj ET');
  if (data.memberMobile) {
    ops.push('BT /F1 10 Tf 0.3 0.35 0.4 rg 55 618 Td (Mobile: ' + sanitizePdfText(data.memberMobile) + ') Tj ET');
  }
  if (data.memberEmail) {
    ops.push('BT /F1 10 Tf 0.3 0.35 0.4 rg 55 601 Td (Email: ' + sanitizePdfText(data.memberEmail) + ') Tj ET');
  }

  // Right col: Date, Mode, Reference
  ops.push('BT /F1 10 Tf 0.3 0.35 0.4 rg 310 635 Td (Date: ' + sanitizePdfText(formatPdfDate(data.payment_date)) + ') Tj ET');
  ops.push('BT /F1 10 Tf 0.3 0.35 0.4 rg 310 618 Td (Payment Mode: ' + sanitizePdfText(data.payment_method.toUpperCase()) + ') Tj ET');
  if (data.transaction_reference) {
    ops.push('BT /F1 10 Tf 0.3 0.35 0.4 rg 310 601 Td (Ref / Txn ID: ' + sanitizePdfText(data.transaction_reference) + ') Tj ET');
  }

  // Membership & Period Row
  ops.push('0.92 0.94 0.97 RG 1 w');
  ops.push('55 585 485 0 re S'); // divider
  const planDetails = data.planName || 'Gym Membership';
  let periodText = 'Plan: ' + planDetails;
  if (data.startDate && data.endDate) {
    periodText += ' (' + formatPdfDate(data.startDate) + ' to ' + formatPdfDate(data.endDate) + ')';
  }
  ops.push('BT /F2 10 Tf 0.2 0.25 0.35 rg 55 565 Td (' + sanitizePdfText(periodText) + ') Tj ET');

  // Breakdown Card
  ops.push('0.98 0.99 1.0 rg');
  ops.push('40 400 515 130 re f');
  ops.push('0.85 0.9 0.95 RG 1 w');
  ops.push('40 400 515 130 re S');

  // Table Header
  ops.push('0.93 0.95 0.98 rg');
  ops.push('40 495 515 35 re f');
  ops.push('BT /F2 10 Tf 0.3 0.35 0.4 rg 55 510 Td (ITEM DESCRIPTION) Tj ET');
  ops.push('BT /F2 10 Tf 0.3 0.35 0.4 rg 440 510 Td (AMOUNT) Tj ET');

  // Line item 1: Membership fee
  ops.push('BT /F1 11 Tf 0.15 0.2 0.25 rg 55 470 Td (' + sanitizePdfText(planDetails + ' - Fee Collection') + ') Tj ET');
  ops.push('BT /F2 11 Tf 0.15 0.2 0.25 rg 430 470 Td (' + sanitizePdfText(formatPdfCurrency(data.amount)) + ') Tj ET');

  // If agreed price and outstanding balance are known
  if (data.agreedPrice !== undefined) {
    const agreedText = 'Agreed Total: ' + formatPdfCurrency(data.agreedPrice);
    ops.push('BT /F1 9 Tf 0.45 0.5 0.55 rg 55 450 Td (' + sanitizePdfText(agreedText) + ') Tj ET');
  }

  if (data.outstandingBalance !== undefined && data.outstandingBalance > 0) {
    const duesText = 'Remaining Dues: ' + formatPdfCurrency(data.outstandingBalance);
    ops.push('BT /F2 9 Tf 0.8 0.2 0.2 rg 55 435 Td (' + sanitizePdfText(duesText) + ') Tj ET');
  } else if (data.outstandingBalance === 0) {
    ops.push('BT /F2 9 Tf 0.1 0.6 0.3 rg 55 435 Td (Full Membership Fee Cleared - Nil Balance) Tj ET');
  }

  // Big Highlight Box for Amount Received
  ops.push('0.92 0.98 0.94 rg');
  ops.push('40 310 515 70 re f');
  ops.push('0.3 0.75 0.45 RG 1.5 w');
  ops.push('40 310 515 70 re S');

  ops.push('BT /F2 11 Tf 0.1 0.5 0.25 rg 55 350 Td (TOTAL AMOUNT RECEIVED) Tj ET');
  ops.push('BT /F1 9 Tf 0.2 0.55 0.3 rg 55 330 Td (Authorized Official Payment Voucher) Tj ET');
  ops.push('BT /F2 20 Tf 0.05 0.45 0.2 rg 360 338 Td (' + sanitizePdfText(formatPdfCurrency(data.amount)) + ') Tj ET');

  // Notes row if any
  if (data.notes) {
    ops.push('BT /F1 9 Tf 0.4 0.45 0.5 rg 55 280 Td (Note: ' + sanitizePdfText(data.notes) + ') Tj ET');
  }

  // Footer notes & Computer Generated acknowledgment
  ops.push('0.85 0.88 0.92 RG 0.5 w');
  ops.push('40 180 515 0 re S');
  ops.push('BT /F1 9 Tf 0.5 0.55 0.6 rg 140 160 Td (This is a computer-generated voucher issued via BahiBar.) Tj ET');
  ops.push('BT /F2 9 Tf 0.3 0.35 0.4 rg 195 145 Td (Thank you for working out with us!) Tj ET');

  const streamContent = ops.join('\n');
  const streamLength = new TextEncoder().encode(streamContent).length;

  // Construct PDF Objects
  const objects: string[] = [
    // 1: Catalog
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    // 2: Pages
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    // 3: Page
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj',
    // 4: Content Stream
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`,
    // 5: F1 Helvetica Regular
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    // 6: F2 Helvetica Bold
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj',
  ];

  // Compute byte offsets for xref table using standard TextEncoder (works in browser and Node)
  const header = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const encoder = new TextEncoder();
  let currentOffset = encoder.encode(header).length;
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(currentOffset);
    currentOffset += encoder.encode(obj + '\n').length;
  }

  // Build xref
  let xref = 'xref\n0 7\n0000000000 65535 f \n';
  for (let i = 1; i <= 6; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }

  const startXrefOffset = currentOffset;
  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startXrefOffset}\n%%EOF\n`;

  const fullPdf = header + objects.map((o) => o + '\n').join('') + xref + trailer;
  return encoder.encode(fullPdf);
}

/**
 * Generate a Blob from receipt data.
 */
export function generateReceiptPdfBlob(data: ReceiptPdfData): Blob {
  const bytes = buildReceiptPdfBytes(data);
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Trigger immediate browser download of the receipt PDF.
 */
export function downloadReceiptPdf(data: ReceiptPdfData, filename?: string): void {
  const receiptNo = `REC-${data.id.slice(0, 8).toUpperCase()}`;
  const name = filename || `Receipt-${receiptNo}.pdf`;
  const blob = generateReceiptPdfBlob(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  // Defer cleanup so mobile browsers (iOS Safari, Android Chrome) can initiate download before URL is revoked
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 2000);
}

/**
 * Normalize Indian phone number for WhatsApp wa.me links.
 * 9876543210 -> 919876543210
 * 09876543210 -> 919876543210
 * +91 98765 43210 -> 919876543210
 */
export function normalizeIndianPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

/**
 * Generate WhatsApp click-to-chat URL with pre-filled message.
 */
export function generateReceiptWhatsAppUrl(data: ReceiptPdfData): string {
  const receiptNo = `REC-${data.id.slice(0, 8).toUpperCase()}`;
  const gym = data.gymName || 'BahiBar Partner';
  const phone = data.memberMobile ? normalizeIndianPhoneNumber(data.memberMobile) : '';

  const messageLines = [
    `*Fee Payment Receipt - ${gym}*`,
    `Receipt No: ${receiptNo}`,
    `Member: ${data.memberName}`,
    `Date: ${formatPdfDate(data.payment_date)}`,
    `Plan: ${data.planName || 'General Membership'}`,
    `Amount Paid: Rs. ${data.amount.toLocaleString('en-IN')}`,
    `Payment Mode: ${data.payment_method.toUpperCase()}`,
  ];

  if (data.transaction_reference) {
    messageLines.push(`Txn Ref: ${data.transaction_reference}`);
  }

  if (data.outstandingBalance !== undefined && data.outstandingBalance > 0) {
    messageLines.push(`Balance Due: Rs. ${data.outstandingBalance.toLocaleString('en-IN')}`);
  } else if (data.outstandingBalance === 0) {
    messageLines.push('Status: Fully Paid (Nil Balance)');
  }

  messageLines.push('\nThank you for working out with us!');

  const text = encodeURIComponent(messageLines.join('\n'));
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}

/**
 * Generate Email mailto link with pre-filled subject and receipt details.
 */
export function generateReceiptEmailUrl(data: ReceiptPdfData): string {
  const receiptNo = `REC-${data.id.slice(0, 8).toUpperCase()}`;
  const gym = data.gymName || 'BahiBar Partner';
  const email = data.memberEmail || '';

  const subject = encodeURIComponent(`Payment Receipt #${receiptNo} - ${gym}`);
  const body = encodeURIComponent(
    `Dear ${data.memberName},\n\n` +
      `Thank you for your fee payment to ${gym}.\n\n` +
      `Receipt Details:\n` +
      `------------------------\n` +
      `Receipt No: ${receiptNo}\n` +
      `Date: ${formatPdfDate(data.payment_date)}\n` +
      `Plan: ${data.planName || 'General Membership'}\n` +
      `Amount Paid: Rs. ${data.amount.toLocaleString('en-IN')}\n` +
      `Payment Mode: ${data.payment_method.toUpperCase()}\n` +
      (data.transaction_reference ? `Txn Ref: ${data.transaction_reference}\n` : '') +
      (data.outstandingBalance !== undefined
        ? `Remaining Dues: Rs. ${data.outstandingBalance.toLocaleString('en-IN')}\n`
        : '') +
      `------------------------\n\n` +
      `Warm regards,\n` +
      `${gym}`
  );

  return `mailto:${email}?subject=${subject}&body=${body}`;
}
