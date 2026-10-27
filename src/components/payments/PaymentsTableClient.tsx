'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { comparePaymentsDesc } from '@/lib/utils/memberships';
import { ReceiptModal, type ReceiptData } from './ReceiptModal';
import { Receipt, ArrowUpRight } from 'lucide-react';
import type { PaymentWithMember } from '@/types';

interface PaymentsTableClientProps {
  payments: PaymentWithMember[];
  gymName?: string;
  gymPhone?: string;
  gymAddress?: string | null;
}

export function PaymentsTableClient({
  payments,
  gymName,
  gymPhone,
  gymAddress,
}: PaymentsTableClientProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);

  // Deduplicate and deterministically sort payments latest-first
  const sortedPayments = Array.from(
    new Map(payments.map((p) => [p.id, p])).values()
  ).sort(comparePaymentsDesc);

  if (sortedPayments.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        No payment transactions recorded yet.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View (md screens and up) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5">Member</th>
              <th className="px-6 py-3.5">Plan</th>
              <th className="px-6 py-3.5">Method</th>
              <th className="px-6 py-3.5">Reference</th>
              <th className="px-6 py-3.5 text-right">Amount (₹)</th>
              <th className="px-6 py-3.5 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedPayments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                  {formatDate(p.payment_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/members/${p.member_id}`}
                    className="font-semibold text-slate-900 hover:text-sky-600 inline-flex items-center gap-1"
                  >
                    {p.member_name}
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">{p.plan_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-700">
                    {p.payment_method}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                  {p.transaction_reference || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-emerald-600">
                  {formatCurrency(p.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
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
                        memberName: p.member_name,
                        memberMobile: p.member_mobile,
                        memberEmail: p.member_email,
                        planName: p.plan_name,
                        gymName,
                        gymPhone,
                        gymAddress,
                        agreedPrice: p.agreed_price,
                        startDate: p.start_date,
                        endDate: p.end_date,
                        outstandingBalance: p.outstanding_balance,
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                    title="View & Download Receipt"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Transaction Cards (< md screens) */}
      <div className="md:hidden divide-y divide-slate-100 p-2">
        {sortedPayments.map((p) => (
          <div key={p.id} className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/members/${p.member_id}`}
                  className="font-semibold text-sm text-slate-900 hover:text-sky-600 flex items-center gap-1"
                >
                  {p.member_name}
                  <ArrowUpRight className="h-3 w-3 text-slate-400" />
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatDate(p.payment_date)} • {p.plan_name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-emerald-600">
                  {formatCurrency(p.amount)}
                </div>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700 mt-0.5">
                  {p.payment_method}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {(p.transaction_reference || p.notes) ? (
                <div className="text-[11px] text-slate-500 font-mono">
                  {p.transaction_reference && <span>Ref: {p.transaction_reference}</span>}
                </div>
              ) : (
                <div />
              )}
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
                    memberName: p.member_name,
                    memberMobile: p.member_mobile,
                    memberEmail: p.member_email,
                    planName: p.plan_name,
                    gymName,
                    gymPhone,
                    gymAddress,
                    agreedPrice: p.agreed_price,
                    startDate: p.start_date,
                    endDate: p.end_date,
                    outstandingBalance: p.outstanding_balance,
                  })
                }
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[84px] tap-feedback"
              >
                <Receipt className="h-4 w-4" />
                Receipt
              </button>
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
