import Link from 'next/link';
import { getPaymentsHistoryAction, getCollectionSummaryAction } from '@/actions/payments';
import { getCurrentGymData } from '@/actions/gym';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PaymentsTableClient } from '@/components/payments/PaymentsTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PaymentsPage() {
  const [payments, collections, gymData] = await Promise.all([
    getPaymentsHistoryAction(),
    getCollectionSummaryAction(),
    getCurrentGymData(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Payments & Collections
          </h1>
          <p className="text-sm text-slate-500">
            Audit log of all member fees collected (Cash, UPI, Card)
          </p>
        </div>
        <Link
          href="/export"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
        >
          Export CSV Report
        </Link>
      </div>

      {/* Collection Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Today&apos;s Collection
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
                ? `${collections.todayCount} fee payment${collections.todayCount > 1 ? 's' : ''} collected today`
                : `No payments recorded yet for today (${collections.todayDateFormatted})`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                This Month&apos;s Collection
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
                ? `No payments recorded in ${collections.monthLabel}`
                : collections.today === collections.thisMonth
                ? `All ${formatCurrency(collections.thisMonth)} collected today (${collections.thisMonthCount} transaction${collections.thisMonthCount > 1 ? 's' : ''})`
                : collections.today === 0
                ? `${formatCurrency(collections.thisMonth)} collected earlier this month (${collections.thisMonthCount} transaction${collections.thisMonthCount > 1 ? 's' : ''})`
                : `${formatCurrency(collections.today)} today + ${formatCurrency(collections.thisMonth - collections.today)} earlier this month`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments History: Desktop Table + Mobile Cards */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base">Transactions Record ({payments.length})</CardTitle>
          <CardDescription>Immutable transaction entries with printable receipts</CardDescription>
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
