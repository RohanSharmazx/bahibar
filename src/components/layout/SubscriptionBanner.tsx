'use client';

import Link from 'next/link';
import { evaluateSubscription } from '@/lib/subscription';
import { Lock, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import type { SoftwareSubscription } from '@/types';

interface SubscriptionBannerProps {
  subscription: SoftwareSubscription | null;
}

export function SubscriptionBanner({ subscription }: SubscriptionBannerProps) {
  // Free Pilot: do not show lockout or renewal banners during the free pilot
  if (subscription?.status === 'pilot' || subscription?.plan_name === 'Free Pilot' || process.env.NEXT_PUBLIC_FREE_PILOT !== 'false') {
    return null;
  }

  const evaluated = evaluateSubscription(subscription);

  if (evaluated.isReadOnly) {
    return (
      <div className="bg-rose-600 text-white px-4 py-2.5 text-xs sm:text-sm font-medium shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Lock className="h-4 w-4 shrink-0" />
            <span>
              <strong>Read-Only Mode:</strong> Your 30-day trial has ended. Existing member records
              and exports are safe. Renew to add members or record payments.
            </span>
          </div>
          <Link
            href="/settings"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-rose-700 font-bold hover:bg-rose-50 text-xs transition-colors"
          >
            Renew Subscription
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (evaluated.inGracePeriod) {
    return (
      <div className="bg-orange-500 text-white px-4 py-2 text-xs sm:text-sm font-medium shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>Grace Period Active:</strong> {evaluated.graceDaysLeft} days remaining before
              workspace enters read-only mode.
            </span>
          </div>
          <Link
            href="/settings"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-orange-700 font-bold hover:bg-orange-50 text-xs transition-colors"
          >
            Renew Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (evaluated.effectiveStatus === 'trial' && evaluated.isExpiringSoon) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs sm:text-sm font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Trial Reminder: Your 30-day free trial ends in{' '}
              <strong>{evaluated.daysLeft} days</strong>.
            </span>
          </div>
          <Link
            href="/settings"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-600 text-white font-semibold hover:bg-amber-700 text-xs transition-colors"
          >
            View Plans & Pricing
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
