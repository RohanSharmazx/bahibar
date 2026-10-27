'use client';

import { useActionState } from 'react';
import { createGymAction } from '@/actions/gym';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Building2, Sparkles } from 'lucide-react';

interface OnboardingFormProps {
  defaultOwnerName?: string;
}

export function OnboardingForm({ defaultOwnerName = '' }: OnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(createGymAction, null);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-100 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          One last step
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Set up your gym profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          This information appears on your member receipts and payment vouchers
        </p>
      </div>

      {state?.error && (
        <Alert variant="danger" title="Onboarding Error">
          {state.error}
        </Alert>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          label="Gym Name"
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Iron Fitness Gym"
          error={state?.fieldErrors?.name?.[0]}
        />

        <Input
          label="Owner / Manager Name"
          id="owner_name"
          name="owner_name"
          type="text"
          required
          defaultValue={defaultOwnerName}
          placeholder="e.g. Vikram Sharma"
          error={state?.fieldErrors?.owner_name?.[0]}
        />

        <Input
          label="Contact Number (Receipts & WhatsApp)"
          id="contact_number"
          name="contact_number"
          type="tel"
          required
          placeholder="e.g. 9876543210"
          error={state?.fieldErrors?.contact_number?.[0]}
          helperText="Used on member receipt slips for member inquiries"
        />

        <div className="space-y-1.5">
          <label htmlFor="address" className="block text-sm font-medium text-slate-700">
            Gym Address (Optional)
          </label>
          <textarea
            id="address"
            name="address"
            rows={2}
            placeholder="e.g. Shop 4, Ground Floor, Sector 14, Main Market"
            className="flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
          />
          {state?.fieldErrors?.address?.[0] && (
            <p className="text-xs text-rose-600 mt-1">{state.fieldErrors.address[0]}</p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            isLoading={isPending}
            className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Create Gym & Open Dashboard
          </Button>
        </div>
      </form>
    </div>
  );
}
