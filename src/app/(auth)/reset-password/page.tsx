'use client';

import { Suspense, useActionState, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordAction, validateResetTokenAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { useI18n } from '@/lib/i18n/context';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    validateResetTokenAction(token).then((res) => {
      if (!res.valid) {
        setTokenError(res.error || 'This reset link is invalid or expired.');
      }
      setIsValidating(false);
    });
  }, [token]);

  if (isValidating) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">
        Verifying password reset link...
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Reset Link Expired</h2>
          <p className="mt-1 text-sm text-slate-500">
            The security token for this password reset link is invalid or has expired.
          </p>
        </div>

        <Alert variant="danger" title="Invalid Reset Link">
          {tokenError}
        </Alert>

        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="block w-full text-center py-2 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm transition-colors"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{t('auth.resetTitle')}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {t('auth.resetSubtitle')}
        </p>
      </div>

      {state?.error && (
        <Alert variant="danger" title={t('common.error')}>
          {state.error}
        </Alert>
      )}

      <form action={formAction} className="space-y-4">
        {token && <input type="hidden" name="token" value={token} />}

        <Input
          label={t('auth.newPasswordLabel')}
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="At least 6 characters"
          error={state?.fieldErrors?.password?.[0]}
        />

        <Input
          label={t('auth.confirmPasswordLabel')}
          id="confirm_password"
          name="confirm_password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Re-enter new password"
          error={state?.fieldErrors?.confirm_password?.[0]}
        />

        <Button type="submit" className="w-full mt-2" isLoading={isPending}>
          {t('auth.updatePasswordButton')}
        </Button>
      </form>

      <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-[#087FDB] hover:text-[#0669b6] py-1.5 inline-block">
          {t('auth.backToLogin')}
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-sm text-slate-500">
          Loading password reset...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
