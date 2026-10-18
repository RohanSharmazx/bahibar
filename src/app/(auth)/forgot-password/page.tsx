'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Reset your password</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your registered email address and we will send a password reset link
        </p>
      </div>

      {state?.error && (
        <Alert variant="danger" title="Error">
          {state.error}
        </Alert>
      )}

      {state?.success ? (
        <Alert variant="success" title="Check your inbox">
          If an account exists with that email, we have sent instructions to reset your password.
        </Alert>
      ) : (
        <form action={formAction} className="space-y-4">
          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            required
            placeholder="owner@yourgym.com"
            error={state?.fieldErrors?.email?.[0]}
          />

          <Button type="submit" className="w-full mt-2" isLoading={isPending}>
            Send Reset Instructions
          </Button>
        </form>
      )}

      <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
