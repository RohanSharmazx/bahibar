'use client';

import { useActionState } from 'react';
import { updateGymAction, type GymActionState } from '@/actions/gym';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { CheckCircle2, Save } from 'lucide-react';
import type { Gym } from '@/types';

interface SettingsFormProps {
  gym: Gym;
}

const initialState: GymActionState = {};

export function SettingsForm({ gym }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateGymAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gym Business Profile</CardTitle>
        <CardDescription>
          These details appear on your member receipts, reports, and header.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.success && (
          <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="font-medium">Gym business profile updated successfully.</span>
          </div>
        )}

        {state.error && (
          <div className="mb-5">
            <Alert variant="danger" title="Update Error">
              {state.error}
            </Alert>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <Input
            label="Gym Name"
            id="name"
            name="name"
            required
            defaultValue={gym.name}
            error={state.fieldErrors?.name?.[0]}
            placeholder="e.g. Iron Fitness Gym"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Owner / Contact Person"
              id="owner_name"
              name="owner_name"
              required
              defaultValue={gym.owner_name}
              error={state.fieldErrors?.owner_name?.[0]}
              placeholder="e.g. Rahul Sharma"
            />
            <Input
              label="Official Contact Number"
              id="contact_number"
              name="contact_number"
              type="tel"
              required
              defaultValue={gym.contact_number}
              error={state.fieldErrors?.contact_number?.[0]}
              placeholder="e.g. 9876543210"
              helperText="10-15 digits phone number"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">
              Gym Location Address (Optional)
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              defaultValue={gym.address || ''}
              placeholder="e.g. 2nd Floor, Main Market, Sector 14"
              className="flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
            {state.fieldErrors?.address?.[0] && (
              <p className="text-xs font-medium text-rose-600">{state.fieldErrors.address[0]}</p>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" isLoading={isPending} className="gap-2 cursor-pointer">
              <Save className="h-4 w-4" />
              <span>Save Profile Changes</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
