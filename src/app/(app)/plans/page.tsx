import Link from 'next/link';
import { getPlansAction, togglePlanActiveAction } from '@/actions/plans';
import { formatCurrency } from '@/lib/utils/currency';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, Clock, Edit2 } from 'lucide-react';

export default async function PlansPage() {
  const plans = await getPlansAction(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Membership Plans</h1>
          <p className="text-sm text-slate-500">
            Create and manage gym pricing packages (Monthly, Quarterly, Annual, etc.)
          </p>
        </div>
        <Link
          href="/plans/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-xs hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create New Plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 mb-4">
            <CreditCard className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No membership plans created yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Add your gym&apos;s standard plans (e.g. 1 Month: ₹800, 3 Months: ₹2,000) so you can quickly
            enroll members.
          </p>
          <Link
            href="/plans/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 text-sm font-semibold text-white shadow-xs hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" />
            Create Your First Plan
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between transition-all ${
                !plan.is_active ? 'opacity-65 bg-slate-50 border-dashed' : 'hover:shadow-md'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {plan.duration_value} {plan.duration_unit}
                    </CardDescription>
                  </div>
                  {plan.is_active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="default">Deactivated</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-3xl font-extrabold text-slate-900">
                  {formatCurrency(plan.price)}
                </div>

                {plan.description && (
                  <p className="text-sm text-slate-600 line-clamp-2">{plan.description}</p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/plans/${plan.id}/edit`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit Price/Details
                  </Link>

                  <form
                    action={async () => {
                      'use server';
                      await togglePlanActiveAction(plan.id, plan.is_active);
                    }}
                  >
                    <button
                      type="submit"
                      className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                        plan.is_active
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {plan.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
