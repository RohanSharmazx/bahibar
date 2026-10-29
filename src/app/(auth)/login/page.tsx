'use client';

import { Suspense, useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '@/actions/auth';
import { trackLoginCompleted } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { useI18n } from '@/lib/i18n/context';

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get('reset') === 'success';
  const urlError = searchParams.get('error');
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{t('auth.loginTitle')}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      {resetSuccess && (
        <Alert variant="success" title={t('common.success')}>
          Your password has been updated. Please sign in with your new password.
        </Alert>
      )}

      {urlError && (
        <Alert variant="danger" title={t('common.warning')}>
          {urlError}
        </Alert>
      )}

      {state?.error && (
        <Alert variant="danger" title={t('common.error')}>
          {state.error}
        </Alert>
      )}

      <form
        action={formAction}
        onSubmit={() => {
          trackLoginCompleted();
        }}
        className="space-y-4"
      >
        <Input
          label={t('auth.emailLabel')}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t('auth.emailPlaceholder')}
          error={state?.fieldErrors?.email?.[0]}
        />

        <div className="space-y-1">
          <Input
            label={t('auth.passwordLabel')}
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
              className="text-xs font-medium text-[#087FDB] hover:text-[#0669b6] py-1.5 inline-block"
            >
              {t('auth.forgotPasswordLink')}
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full mt-2" isLoading={isPending}>
          {t('auth.signInButton')}
        </Button>
      </form>

      <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
        {t('auth.noAccountPrompt')}{' '}
        <Link href="/register" className="font-semibold text-[#087FDB] hover:text-[#0669b6] py-1.5 inline-block">
          {t('auth.registerLink')}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-sm text-slate-500">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
