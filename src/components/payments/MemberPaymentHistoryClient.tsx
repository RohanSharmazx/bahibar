'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { comparePaymentsDesc } from '@/lib/utils/memberships';
import { Badge } from '@/components/ui/badge';
import { ReceiptModal, type ReceiptData } from './ReceiptModal';
import { Receipt } from 'lucide-react';
import type { Payment } from '@/types';

interface MemberPaymentHistoryClientProps {
  payments: Payment[];
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

export function MemberPaymentHistoryClient({
  payments,
  memberName,
  memberMobile,
  memberEmail,
  planName,
  gymName,
  gymPhone,
  gymAddress,
  agreedPrice,
  startDate,
  endDate,
  outstandingBalance,
}: MemberPaymentHistoryClientProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);

  // Deduplicate and deterministically sort payments latest-first
  const sortedPayments = Array.from(
    new Map(payments.map((p) => [p.id, p])).values()
  ).sort(comparePaymentsDesc);

  if (sortedPayments.length === 0) {
    return <p className="text-sm text-slate-500 py-6 text-center">No payment transactions recorded.</p>;
  }

  return (
    <>
      <div className="divide-y divide-slate-100">
        {sortedPayments.map((p) => (
          <div key={p.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 gap-3">
            <div>
              <p className="font-bold text-slate-900">{formatCurrency(p.amount)}</p>
              <p className="text-xs text-slate-500">
                {formatDate(p.payment_date)} • <span className="uppercase font-medium">{p.payment_method}</span>
                {p.transaction_reference ? ` • Ref: ${p.transaction_reference}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setSelectedReceipt({
                    id: p.id,
                    amount: p.amount,
                    payment_date: p.payment_date,
                    payment_method: p.payment_method,
                    transaction_reference: p.transaction_reference,
                    notes: p.notes,
                    memberName,
                    memberMobile,
                    memberEmail,
                    planName,
                    gymName,
                    gymPhone,
                    gymAddress,
                    agreedPrice,
                    startDate,
                    endDate,
                    outstandingBalance,
                  })
                }
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[84px] tap-feedback"
                title="View & Print Payment Receipt"
              >
                <Receipt className="h-4 w-4" />
                Receipt
              </button>
              <Badge variant="success">Paid</Badge>
            </div>
          </div>
        ))}
      </div>

      <ReceiptModal
        receipt={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </>
  );
}
