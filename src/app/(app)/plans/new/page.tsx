'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createPlanAction } from '@/actions/plans';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export default function NewPlanPage() {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(createPlanAction, null);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/plans"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.plans.backToPlans}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{t.plans.createPlanTitle}</CardTitle>
          <CardDescription>
            {t.plans.createPlanSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <div className="mb-6">
              <Alert variant="danger" title={t.common.error}>
                {state.error}
              </Alert>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <Input
              label={t.plans.planName}
              id="name"
              name="name"
              type="text"
              required
              placeholder={t.plans.planNamePlaceholder}
              error={state?.fieldErrors?.name?.[0]}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.plans.durationValue}
                id="duration_value"
                name="duration_value"
                type="number"
                min="1"
                required
                defaultValue="1"
                placeholder="1"
                error={state?.fieldErrors?.duration_value?.[0]}
              />

              <Select
                label={t.plans.durationUnit}
                id="duration_unit"
                name="duration_unit"
                required
                defaultValue="months"
                options={[
                  { value: 'months', label: t.plans.months },
                  { value: 'days', label: t.plans.days },
                ]}
                error={state?.fieldErrors?.duration_unit?.[0]}
              />
            </div>

            <Input
              label={t.plans.price}
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="e.g. 1500"
              error={state?.fieldErrors?.price?.[0]}
            />

            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                {t.plans.description}
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder={t.plans.descriptionPlaceholder}
                className="flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link href="/plans">
                <Button type="button" variant="outline">
                  {t.common.cancel}
                </Button>
              </Link>
              <Button type="submit" isLoading={isPending}>
                {t.plans.savePlanButton}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
