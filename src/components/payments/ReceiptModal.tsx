'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Download,
  MessageCircle,
  Mail,
  Copy,
  Check,
  Printer,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import {
  downloadReceiptPdf,
  generateReceiptWhatsAppUrl,
  generateReceiptEmailUrl,
} from '@/lib/utils/pdf';
import { useI18n } from '@/lib/i18n/context';

export interface ReceiptData {
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

interface ReceiptModalProps {
  receipt: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ receipt, isOpen, onClose }: ReceiptModalProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState<boolean>(false);

  if (!receipt) return null;

  const receiptNo = `REC-${receipt.id.slice(0, 8).toUpperCase()}`;

  const handleDownloadPdf = () => {
    try {
      downloadReceiptPdf(receipt, `Receipt-${receiptNo}.pdf`);
    } catch (err) {
      console.error('Failed to generate receipt PDF:', err);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      try {
        window.print();
      } catch (err) {
        console.warn('Window print failed, downloading PDF fallback:', err);
        handleDownloadPdf();
      }
    }
  };

  const handleCopyText = () => {
    const lines = [
      `${t.receiptModal.title} - ${receipt.gymName || 'BahiBar'}`,
      `${t.receiptModal.receiptNo}: ${receiptNo}`,
      `${t.receiptModal.memberName}: ${receipt.memberName}`,
      `${t.receiptModal.date}: ${formatDate(receipt.payment_date)}`,
      `${t.receiptModal.plan}: ${receipt.planName || 'General Membership'}`,
      `${t.receiptModal.amountPaid}: ${formatCurrency(receipt.amount)}`,
      `${t.receiptModal.paymentMode}: ${receipt.payment_method.toUpperCase()}`,
    ];

    if (receipt.outstandingBalance !== undefined && receipt.outstandingBalance > 0) {
      lines.push(`${t.receiptModal.balanceRemaining}: ${formatCurrency(receipt.outstandingBalance)}`);
    }

    const textToCopy = lines.join('\n');
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        fallbackCopy(textToCopy);
      });
    } else {
      fallbackCopy(textToCopy);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.top = '-9999px';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  const whatsAppUrl = generateReceiptWhatsAppUrl(receipt);
  const emailUrl = generateReceiptEmailUrl(receipt);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.receiptModal.title}
      description={`${t.receiptModal.receiptNo} #${receiptNo}`}
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Printable Area */}
        <div
          id="printable-receipt"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-slate-800 space-y-5 print:border-none print:shadow-none print:p-0"
        >
          {/* Gym Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {receipt.gymName || 'BahiBar Partner'}
              </h3>
              {receipt.gymAddress && (
                <p className="text-xs text-slate-500 mt-0.5">{receipt.gymAddress}</p>
              )}
              {receipt.gymPhone && (
                <p className="text-xs text-slate-500 font-medium">Ph: {receipt.gymPhone}</p>
              )}
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                <CheckCircle className="h-3 w-3" />
                {t.common.paid}
              </span>
              <p className="text-[11px] font-mono font-medium text-slate-400 mt-1">
                {receiptNo}
              </p>
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 font-medium">{t.receiptModal.date}</span>
              <p className="font-semibold text-slate-900 mt-0.5">
                {formatDate(receipt.payment_date)}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">{t.receiptModal.paymentMode}</span>
              <p className="font-bold uppercase text-slate-900 mt-0.5">
                {receipt.payment_method}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">{t.receiptModal.memberName}</span>
              <p className="font-bold text-slate-900 mt-0.5">{receipt.memberName}</p>
              {receipt.memberMobile && (
                <p className="text-[11px] text-slate-500 font-mono">{receipt.memberMobile}</p>
              )}
              {receipt.memberEmail && (
                <p className="text-[11px] text-slate-500 truncate">{receipt.memberEmail}</p>
              )}
            </div>
            <div>
              <span className="text-slate-400 font-medium">{t.receiptModal.plan}</span>
              <p className="font-semibold text-slate-900 mt-0.5">
                {receipt.planName || 'General Membership'}
              </p>
              {receipt.startDate && receipt.endDate && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {formatDate(receipt.startDate)} – {formatDate(receipt.endDate)}
                </p>
              )}
            </div>
          </div>

          {receipt.transaction_reference && (
            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="text-slate-400">Transaction Reference</span>
              <span className="font-mono font-medium text-slate-700">
                {receipt.transaction_reference}
              </span>
            </div>
          )}

          {/* Pricing & Balance Overview */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs space-y-1.5">
            {receipt.agreedPrice !== undefined && (
              <div className="flex justify-between text-slate-600">
                <span>Agreed Plan Price</span>
                <span className="font-semibold">{formatCurrency(receipt.agreedPrice)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>{t.receiptModal.amountPaid}</span>
              <span className="font-bold text-emerald-700">{formatCurrency(receipt.amount)}</span>
            </div>
            {receipt.outstandingBalance !== undefined && (
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="font-medium text-slate-700">{t.receiptModal.balanceRemaining}</span>
                <span
                  className={`font-bold ${
                    receipt.outstandingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {receipt.outstandingBalance > 0
                    ? formatCurrency(receipt.outstandingBalance)
                    : '₹0.00 (Cleared)'}
                </span>
              </div>
            )}
          </div>

          {/* Total Amount Box */}
          <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                {t.receiptModal.amountPaid}
              </span>
              <p className="text-xs text-emerald-600 mt-0.5">Authorized fee collection</p>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700">
              {formatCurrency(receipt.amount)}
            </div>
          </div>

          {receipt.notes && (
            <div className="text-xs text-slate-500 italic">
              Note: {receipt.notes}
            </div>
          )}

          {/* Footer note */}
          <div className="border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400">
            {t.receiptModal.thankYou}
          </div>
        </div>

        {/* Multi-Channel Sharing Toolbar */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 print:hidden">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Instant Member Sharing
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-xs min-h-[36px]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {t.receiptModal.whatsAppSlip}
            </a>

            <a
              href={emailUrl}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors min-h-[36px]"
            >
              <Mail className="h-3.5 w-3.5 text-slate-500" />
              Email Receipt
            </a>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[36px]"
              title="Print receipt voucher"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              {t.receiptModal.printVoucher}
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[36px]"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  {t.common.copied}
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  {t.common.copy}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Action Controls: Close (Secondary) and Download PDF (Primary) */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 print:hidden">
          <Button variant="outline" type="button" onClick={onClose} className="min-h-[44px]">
            {t.receiptModal.close}
          </Button>

          <Button
            type="button"
            className="gap-1.5 bg-sky-600 hover:bg-sky-700 text-white cursor-pointer shadow-xs min-h-[44px]"
            onClick={handleDownloadPdf}
          >
            <Download className="h-4 w-4" />
            {t.receiptModal.downloadPdf}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
