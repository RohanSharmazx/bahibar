'use client';

import { useActionState } from 'react';
import { resetPasswordAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Set new password</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose a secure new password for your account
        </p>
      </div>

      {state?.error && (
        <Alert variant="danger" title="Password Reset Failed">
          {state.error}
        </Alert>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          label="New Password"
          id="password"
          name="password"
          type="password"
          required
          placeholder="At least 6 characters"
          error={state?.fieldErrors?.password?.[0]}
        />

        <Input
          label="Confirm New Password"
          id="confirm_password"
          name="confirm_password"
          type="password"
          required
          placeholder="Re-enter new password"
          error={state?.fieldErrors?.confirm_password?.[0]}
        />

        <Button type="submit" className="w-full mt-2" isLoading={isPending}>
          Update Password
        </Button>
      </form>
    </div>
  );
}
