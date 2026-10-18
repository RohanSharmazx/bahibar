import { createClient } from '@/lib/supabase/server';
import { requireGymAccess } from '@/lib/supabase/auth-helpers';
import { notFound } from 'next/navigation';
import { updatePlanAction } from '@/actions/plans';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { gymId } = await requireGymAccess();
  const supabase = await createClient();

  const { data: plan, error } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('id', id)
    .eq('gym_id', gymId)
    .single();

  if (error || !plan) {
    notFound();
  }

  async function handlePlanUpdate(formData: FormData) {
    'use server';
    await updatePlanAction(id, null, formData);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/plans"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Plans
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Membership Plan</CardTitle>
          <CardDescription>
            Updating this plan will apply to future enrollments. Existing members keep their historical snapshot prices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handlePlanUpdate} className="space-y-4">
            <Input
              label="Plan Name"
              id="name"
              name="name"
              type="text"
              required
              defaultValue={plan.name}
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
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
