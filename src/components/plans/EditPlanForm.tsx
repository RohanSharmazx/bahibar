'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { updatePlanAction } from '@/actions/plans';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import type { MembershipPlan } from '@/types';

interface EditPlanFormProps {
  plan: MembershipPlan;
}

export function EditPlanForm({ plan }: EditPlanFormProps) {
  const [state, formAction, isPending] = useActionState(
    updatePlanAction.bind(null, plan.id),
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Membership Plan</CardTitle>
        <CardDescription>
          Updating this plan will apply to future enrollments. Existing members keep their historical snapshot prices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state?.error && (
          <div className="mb-4">
            <Alert variant="danger" title="Validation Error">
              {state.error}
            </Alert>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <Input
            label="Plan Name"
            id="name"
            name="name"
            type="text"
            required
            defaultValue={plan.name}
            error={state?.fieldErrors?.name?.[0]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration Value"
              id="duration_value"
              name="duration_value"
              type="number"
              min="1"
              required
              defaultValue={plan.duration_value}
              error={state?.fieldErrors?.duration_value?.[0]}
            />

            <Select
              label="Duration Unit"
              id="duration_unit"
              name="duration_unit"
              required
              defaultValue={plan.duration_unit}
              options={[
                { value: 'months', label: 'Months' },
                { value: 'days', label: 'Days' },
              ]}
            />
          </div>

          <Input
            label="Price (₹ INR)"
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={plan.price}
            error={state?.fieldErrors?.price?.[0]}
          />

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={plan.description || ''}
              className="flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link href="/plans">
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isPending} disabled={isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
