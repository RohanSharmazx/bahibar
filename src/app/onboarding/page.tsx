'use client';

import { Suspense, useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createGymAction } from '@/actions/gym';
import { logoutAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { BahiBarLogo } from '@/components/ui/logo';
import { LanguageToggle, useI18n } from '@/lib/i18n/context';
import { ArrowLeft, LogOut } from 'lucide-react';

function OnboardingContent() {
  const [state, formAction, isPending] = useActionState(createGymAction, null);
  const searchParams = useSearchParams();
  const isNewWorkspace = searchParams.get('new_workspace') === 'true';
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header Navigation */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between pb-4">
        <Link
          href={isNewWorkspace ? '/dashboard' : '/'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-2 px-1 min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isNewWorkspace ? 'Return to Dashboard' : 'Back to Home'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[44px]"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{t.common.signOut}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <BahiBarLogo size="md" showTagline={true} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isNewWorkspace ? 'Create an Additional Gym Workspace' : 'Set up your Gym Profile'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isNewWorkspace
              ? 'Add another gym facility under your account. You can switch between them anytime.'
              : 'This information will appear on membership summaries, receipts, and reports.'}
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
              <Button type="submit" className="w-full text-base min-h-[44px]" size="lg" isLoading={isPending}>
                {isNewWorkspace ? 'Create Workspace & Open Dashboard' : 'Complete Setup & Go to Dashboard'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="py-4 text-center text-xs text-slate-400">
        BahiBar • Gym records, sorted.
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-slate-500">Loading gym setup...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
