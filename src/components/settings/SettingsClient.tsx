'use client';

import { SettingsForm } from '@/components/settings/SettingsForm';
import { DangerZone } from '@/components/settings/DangerZone';
import { SubscriptionBillingCard } from '@/components/settings/SubscriptionBillingCard';
import { useI18n } from '@/lib/i18n/context';
import type { Gym, SoftwareSubscription } from '@/types';
import type { SubscriptionBillingDetails } from '@/actions/subscription';

interface SettingsClientProps {
  gym: Gym;
  subscription: SoftwareSubscription | null;
  role?: string;
  billingDetails?: SubscriptionBillingDetails;
}

export function SettingsClient({
  gym,
  subscription,
  role = 'owner',
  billingDetails,
}: SettingsClientProps) {
  const { t } = useI18n();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.settings.title}</h1>
        <p className="text-sm text-slate-500">{t.settings.subtitle}</p>
      </div>

      {/* Gym Profile Form */}
      <SettingsForm gym={gym} />

      {/* Software Subscription & Billing Section */}
      {billingDetails && role === 'owner' ? (
        <SubscriptionBillingCard gym={gym} billingDetails={billingDetails} />
      ) : (
        /* Fallback read-only summary for staff members */
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm space-y-2">
          <h3 className="font-bold text-slate-800">Subscription Status</h3>
          <p className="text-xs text-slate-600">
            Current status: <strong className="capitalize">{subscription?.status || 'Trial'}</strong> (valid until {subscription?.end_date || '—'}).
            Contact the gym owner to manage billing.
          </p>
        </div>
      )}

      {/* Danger Zone: Authorized Gym Owner Only */}
      {role === 'owner' && <DangerZone gym={gym} />}
    </div>
  );
}
