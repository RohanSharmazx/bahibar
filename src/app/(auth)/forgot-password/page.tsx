'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { useI18n } from '@/lib/i18n/context';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{t('auth.forgotTitle')}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {t('auth.forgotSubtitle')}
        </p>
      </div>

      {state?.error && (
        <Alert variant="danger" title={t('common.error')}>
          {state.error}
        </Alert>
      )}

      {state?.success ? (
        <div className="space-y-4">
          <Alert variant="success" title={t('common.success')}>
            If an account exists with that email, we have sent instructions to reset your password.
          </Alert>

          {state.devResetUrl && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-2">
              <p className="font-bold uppercase tracking-wider text-[11px] text-amber-800">
                Local Development Sandbox
              </p>
              <p className="text-slate-600">
                In local mode (without live SMTP), email delivery is simulated. You can test the password reset flow directly using the generated link below:
              </p>
              <div>
                <Link
                  href={state.devResetUrl}
                  className="inline-flex items-center gap-1 font-semibold text-[#087FDB] hover:text-[#0669b6] underline"
                >
                  Open Password Reset Page &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <Input
            label={t('auth.emailLabel')}
            id="email"
            name="email"
            type="email"
            required
            placeholder={t('auth.emailPlaceholder')}
            error={state?.fieldErrors?.email?.[0]}
          />

          <Button type="submit" className="w-full mt-2" isLoading={isPending}>
            {t('auth.sendResetLink')}
          </Button>
        </form>
      )}

      <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-[#087FDB] hover:text-[#0669b6] py-1.5 inline-block">
          {t('auth.backToLogin')}
        </Link>
      </div>
    </div>
  );
}
