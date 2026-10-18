import Link from 'next/link';
import { getPaymentsHistoryAction, getCollectionSummaryAction } from '@/actions/payments';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Calendar, CreditCard, Search, ArrowUpRight } from 'lucide-react';

export default async function PaymentsPage() {
  const [payments, collections] = await Promise.all([
    getPaymentsHistoryAction(),
    getCollectionSummaryAction(),
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
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today&apos;s Collection
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600">
              {formatCurrency(collections.today)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Cash & digital collections today</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              This Month&apos;s Collection
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-sky-600">
              {formatCurrency(collections.thisMonth)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Calendar month cumulative income</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments History Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base">Transactions Record ({payments.length})</CardTitle>
          <CardDescription>Immutable transaction entries</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No payment transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Member</th>
                    <th className="px-6 py-3.5">Plan</th>
                    <th className="px-6 py-3.5">Method</th>
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
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
                          <ArrowUpRight className="h-3 w-3 text-slate-400" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {p.plan_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                        {p.transaction_reference || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-emerald-600">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
