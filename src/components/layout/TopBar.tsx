'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dumbbell, LogOut, ShieldAlert, Menu } from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import { MobileNavDrawer } from './MobileNavDrawer';
import type { Gym, SoftwareSubscription } from '@/types';
import { differenceInDays, parseISO } from 'date-fns';

interface TopBarProps {
  gym: Gym | null;
  subscription: SoftwareSubscription | null;
  userName?: string;
}

export function TopBar({ gym, subscription, userName }: TopBarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isTrial = subscription?.status === 'trial';
  const isExpired = subscription?.status === 'expired';

  let daysLeftInTrial = 0;
  if (isTrial && subscription?.end_date) {
    daysLeftInTrial = Math.max(0, differenceInDays(parseISO(subscription.end_date), new Date()));
  }

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

            <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs group-hover:bg-sky-700 transition-colors">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                  {gym ? gym.name : 'GymManager'}
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden xs:block">
                  {gym ? `Owner: ${gym.owner_name}` : 'Local Gym Management'}
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Status + Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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

            {isExpired && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Read-Only</span> Mode
              </span>
            )}

            <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-700">{userName || 'Gym Owner'}</span>
                <span className="text-[10px] text-slate-400">Owner</span>
              </div>
              <form action={logoutAction}>
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
