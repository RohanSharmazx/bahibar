'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { useI18n } from '@/lib/i18n/context';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{t('auth.registerTitle')}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {t('auth.registerSubtitle')}
        </p>
      </div>

      {state?.error && (
        <Alert variant="danger" title={t('common.error')}>
          {state.error}
        </Alert>
      )}

      {state?.message && (
        <Alert variant="success" title={t('common.success')}>
          <p>{state.message}</p>
          <div className="mt-3">
            <Link
              href="/login"
              className="inline-flex items-center text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
            >
              Go to Sign In →
            </Link>
          </div>
        </Alert>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          label={t('auth.fullNameLabel')}
          id="full_name"
          name="full_name"
          type="text"
          required
          placeholder={t('auth.fullNamePlaceholder')}
          error={state?.fieldErrors?.full_name?.[0]}
        />

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

        <Input
          label={t('auth.passwordLabel')}
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="At least 6 characters"
          error={state?.fieldErrors?.password?.[0]}
        />

        <Input
          label={t('auth.confirmPasswordLabel')}
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          placeholder={t('auth.confirmPasswordPlaceholder')}
          error={state?.fieldErrors?.confirm_password?.[0]}
        />

        <Button type="submit" className="w-full mt-2" isLoading={isPending}>
          {t('auth.registerButton')}
        </Button>
      </form>

      <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
        {t('auth.alreadyAccountPrompt')}{' '}
        <Link href="/login" className="font-semibold text-[#087FDB] hover:text-[#0669b6] py-1.5 inline-block">
          {t('common.signIn')}
        </Link>
      </div>
    </div>
  );
}
