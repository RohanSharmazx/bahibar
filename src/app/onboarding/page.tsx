'use client';

import { useActionState } from 'react';
import { createGymAction } from '@/actions/gym';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Dumbbell, Building2, Phone, MapPin, User } from 'lucide-react';

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState(createGymAction, null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md mb-4">
            <Dumbbell className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Set up your Gym Profile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This information will appear on membership summaries, receipts, and reports.
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-10">
          {state?.error && (
            <div className="mb-6">
              <Alert variant="danger" title="Gym Setup Error">
                {state.error}
              </Alert>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <Input
              label="Gym Name"
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Iron Fitness Center"
              helperText="The public name of your gym"
              error={state?.fieldErrors?.name?.[0]}
            />

            <Input
              label="Owner / Manager Name"
              id="owner_name"
              name="owner_name"
              type="text"
              required
              placeholder="e.g. Vikram Singh"
              error={state?.fieldErrors?.owner_name?.[0]}
            />

            <Input
              label="Contact Phone Number"
              id="contact_number"
              name="contact_number"
              type="tel"
              required
              placeholder="e.g. 9876543210"
              helperText="For gym inquiries and official records"
              error={state?.fieldErrors?.contact_number?.[0]}
            />

            <div className="space-y-1.5">
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                Gym Address (Optional)
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                placeholder="Shop 4, Market Road, Near City Center..."
                className="flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              />
              {state?.fieldErrors?.address?.[0] && (
                <p className="text-xs font-medium text-rose-600">
                  {state.fieldErrors.address[0]}
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full text-base" size="lg" isLoading={isPending}>
                Complete Setup & Go to Dashboard
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
