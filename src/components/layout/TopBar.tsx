'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, ShieldAlert, Menu } from 'lucide-react';
import { BahiBarIcon } from '@/components/ui/logo';
import { logoutAction } from '@/actions/auth';
import { resetAnalytics } from '@/lib/analytics';
import { LanguageToggle, useI18n } from '@/lib/i18n/context';
import { WorkspaceSelector } from './WorkspaceSelector';
import { MobileNavDrawer } from './MobileNavDrawer';
import { evaluateSubscription } from '@/lib/subscription';
import type { Gym, SoftwareSubscription } from '@/types';

interface TopBarProps {
  gym: Gym | null;
  subscription: SoftwareSubscription | null;
  userName?: string;
  accessibleGyms?: { gym: Gym; role: string }[];
}

export function TopBar({ gym, subscription, userName, accessibleGyms = [] }: TopBarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isFreePilot =
    subscription?.status === 'pilot' ||
    subscription?.plan_name === 'Free Pilot' ||
    process.env.NEXT_PUBLIC_FREE_PILOT !== 'false';
  const evaluated = evaluateSubscription(subscription);
  const isTrial = !isFreePilot && evaluated.effectiveStatus === 'trial';
  const isPastDue = !isFreePilot && evaluated.effectiveStatus === 'past_due';
  const isExpired = !isFreePilot && evaluated.effectiveStatus === 'expired';
  const daysLeftInTrial = evaluated.daysLeft;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="flex h-16 items-center justify-between px-3 sm:px-6">
          {/* Left: Mobile Hamburger & Gym Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
              aria-expanded={isDrawerOpen}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <Link href="/dashboard" className="flex items-center group shrink-0" aria-label="BahiBar Dashboard">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shadow-2xs group-hover:bg-slate-100 transition-colors">
                  <BahiBarIcon size={28} />
                </div>
              </Link>
              <div className="min-w-0">
                {gym && accessibleGyms.length > 1 ? (
                  <WorkspaceSelector currentGym={gym} accessibleGyms={accessibleGyms} />
                ) : (
                  <Link href="/dashboard" className="block min-w-0">
                    <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                      {gym ? gym.name : 'BahiBar'}
                    </h1>
                  </Link>
                )}
                <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden xs:block">
                  {gym ? `Owner: ${gym.owner_name}` : 'Gym records, sorted.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Status + Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isFreePilot && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200"
                title="Active Free Pilot Partner Workspace"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="hidden sm:inline">Free Pilot</span>
                <span>Partner</span>
              </span>
            )}

            {isTrial && (
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 border border-amber-200 hover:bg-amber-100/70 transition-colors"
                title={`${daysLeftInTrial} days remaining in software trial`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="hidden sm:inline">Trial:</span>
                <span>{daysLeftInTrial}d left</span>
              </Link>
            )}

            {isPastDue && (
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-800 border border-orange-200 hover:bg-orange-100 transition-colors"
                title={`${evaluated.graceDaysLeft} days remaining in renewal grace period`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-ping" />
                <span className="hidden sm:inline">Grace Period:</span>
                <span>{evaluated.graceDaysLeft}d</span>
              </Link>
            )}

            {isExpired && (
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Trial ended. Click to renew and restore write access."
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Read-Only</span> Mode
              </Link>
            )}

            {/* Language Toggle in TopBar */}
            <LanguageToggle />

            <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-700">{userName || 'Gym Owner'}</span>
                <span className="text-[10px] text-slate-400">Owner</span>
              </div>
              <form
                action={logoutAction}
                onSubmit={() => {
                  resetAnalytics();
                }}
              >
                <button
                  type="submit"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileNavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        gym={gym}
        subscription={subscription}
        userName={userName}
      />
    </>
  );
}
