'use client';

import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/currency';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PaymentsTableClient } from '@/components/payments/PaymentsTableClient';
import { useI18n } from '@/lib/i18n/context';
import type { PaymentWithMember } from '@/types';

interface CollectionSummary {
  today: number;
  thisMonth: number;
  todayCount: number;
  thisMonthCount: number;
  todayDateFormatted: string;
  monthLabel: string;
}

interface GymData {
  gym: {
    id: string;
    name: string;
    contact_number?: string;
    address?: string | null;
  } | null;
}

interface PaymentsViewClientProps {
  payments: PaymentWithMember[];
  collections: CollectionSummary;
  gymData: GymData;
}

export function PaymentsViewClient({
  payments,
  collections,
  gymData,
}: PaymentsViewClientProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.payments.title}
          </h1>
          <p className="text-sm text-slate-500">
            {t.payments.subtitle}
          </p>
        </div>
        <Link
          href="/export"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
        >
          {t.payments.exportCsvReport}
        </Link>
      </div>

      {/* Collection Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.payments.todayCollection}
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {collections.todayDateFormatted}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600">
              {formatCurrency(collections.today)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {collections.today > 0
                ? `${collections.todayCount} ${t.payments.feePaymentsCollectedToday}`
                : `${t.payments.noPaymentsToday} (${collections.todayDateFormatted})`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.payments.thisMonthCollection}
              </span>
              <span className="text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                {collections.monthLabel}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-sky-600">
              {formatCurrency(collections.thisMonth)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {collections.thisMonth === 0
                ? `${t.payments.noPaymentsThisMonth} ${collections.monthLabel}`
                : collections.today === collections.thisMonth
                ? `${formatCurrency(collections.thisMonth)} (${collections.thisMonthCount})`
                : `${formatCurrency(collections.today)} + ${formatCurrency(collections.thisMonth - collections.today)}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments History: Desktop Table + Mobile Cards */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base">
            {t.payments.transactionsRecordTitle} ({payments.length})
          </CardTitle>
          <CardDescription>
            {t.payments.transactionsRecordSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <PaymentsTableClient
            payments={payments}
            gymName={gymData?.gym?.name}
            gymPhone={gymData?.gym?.contact_number}
            gymAddress={gymData?.gym?.address}
          />
        </CardContent>
      </Card>
    </div>
  );
}
