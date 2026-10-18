'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Sign in to your gym</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your owner email and password to access records
        </p>
      </div>

      {state?.error && (
        <Alert variant="danger" title="Sign In Failed">
          {state.error}
        </Alert>
      )}

      <form action={formAction} className="space-y-4">
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

        <div className="space-y-1">
          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            error={state?.fieldErrors?.password?.[0]}
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-sky-600 hover:text-sky-700"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full mt-2" isLoading={isPending}>
          Sign In
        </Button>
      </form>

      <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
        New gym owner?{' '}
        <Link href="/register" className="font-semibold text-sky-600 hover:text-sky-700">
          Create an account
        </Link>
      </div>
    </div>
  );
}
