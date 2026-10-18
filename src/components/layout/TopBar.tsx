'use client';

import Link from 'next/link';
import { Dumbbell, LogOut, User, ShieldAlert } from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import type { Gym, SoftwareSubscription } from '@/types';
import { differenceInDays, parseISO } from 'date-fns';

interface TopBarProps {
  gym: Gym | null;
  subscription: SoftwareSubscription | null;
  userName?: string;
}

export function TopBar({ gym, subscription, userName }: TopBarProps) {
  const isTrial = subscription?.status === 'trial';
  const isExpired = subscription?.status === 'expired';
  
  let daysLeftInTrial = 0;
  if (isTrial && subscription?.end_date) {
    daysLeftInTrial = Math.max(0, differenceInDays(parseISO(subscription.end_date), new Date()));
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand / Gym Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {gym ? gym.name : 'GymManager'}
            </h1>
            <p className="text-xs text-slate-500">
              {gym ? `Owner: ${gym.owner_name}` : 'Local Gym Management'}
            </p>
          </div>
        </div>

        {/* Status + Actions */}
        <div className="flex items-center gap-3">
          {isTrial && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 border border-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Trial: {daysLeftInTrial} days left
            </span>
          )}

          {isExpired && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
              <ShieldAlert className="h-3.5 w-3.5" />
              Read-Only Mode
            </span>
          )}

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
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
  );
}
