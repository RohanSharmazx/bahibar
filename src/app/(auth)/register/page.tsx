'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Create owner account</h2>
        <p className="mt-1 text-sm text-slate-500">
          Get started with digital registers in under 2 minutes
        </p>
      </div>

      {state?.error && (
        <Alert variant="danger" title="Registration Failed">
          {state.error}
        </Alert>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          label="Your Full Name"
          id="full_name"
          name="full_name"
          type="text"
          required
          placeholder="Vikram Singh"
          error={state?.fieldErrors?.full_name?.[0]}
        />

        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="owner@yourgym.com"
          error={state?.fieldErrors?.email?.[0]}
        />

        <Input
          label="Create Password"
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="At least 6 characters"
          error={state?.fieldErrors?.password?.[0]}
        />

        <Input
          label="Confirm Password"
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Re-enter password"
          error={state?.fieldErrors?.confirm_password?.[0]}
        />

        <Button type="submit" className="w-full mt-2" isLoading={isPending}>
          Create Account & Setup Gym
        </Button>
      </form>

      <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
        Already registered?{' '}
        <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
          Sign In
        </Link>
      </div>
    </div>
  );
}
