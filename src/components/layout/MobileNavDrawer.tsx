'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  IndianRupee,
  Download,
  Settings,
  UserPlus,
  X,
  LogOut,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { BahiBarIcon } from '@/components/ui/logo';
import { logoutAction } from '@/actions/auth';
import { useI18n, LanguageToggle } from '@/lib/i18n/context';
import type { Gym, SoftwareSubscription } from '@/types';
import { differenceInDays, parseISO } from 'date-fns';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  gym: Gym | null;
  subscription: SoftwareSubscription | null;
  userName?: string;
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  gym,
  subscription,
  userName,
}: MobileNavDrawerProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const mainNavigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.members'), href: '/members', icon: Users },
    { name: t('nav.plans'), href: '/plans', icon: CreditCard },
    { name: t('nav.payments'), href: '/payments', icon: IndianRupee },
  ];

  const secondaryNavigation = [
    { name: t('nav.export'), href: '/export', icon: Download },
    { name: t('nav.settings'), href: '/settings', icon: Settings },
  ];

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isTrial = subscription?.status === 'trial';
  const isExpired = subscription?.status === 'expired';
  let daysLeftInTrial = 0;
  if (isTrial && subscription?.end_date) {
    daysLeftInTrial = Math.max(0, differenceInDays(parseISO(subscription.end_date), new Date()));
  }

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col justify-between p-4 overflow-y-auto animate-in slide-in-from-left duration-200"
      >
        <div className="space-y-5">
          {/* Top Bar with Gym info & Close button */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                <BahiBarIcon size={24} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 leading-tight truncate">
                  {gym ? gym.name : 'BahiBar'}
                </h2>
                <p className="text-[11px] text-slate-500 truncate">
                  {gym ? `Owner: ${gym.owner_name}` : 'Gym records, sorted.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Software Subscription Indicator */}
          {isTrial && (
            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Trial: {daysLeftInTrial} days remaining</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-700">License</span>
            </Link>
          )}

          {isExpired && (
            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-800"
            >
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Subscription Expired (Read-Only)</span>
            </Link>
          )}

          {/* Add Member Quick Action */}
          <Link
            href="/members/new"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#087FDB] px-4 text-sm font-semibold text-white shadow-xs hover:bg-[#0669b6] active:bg-[#055393] transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t('common.addMember')}</span>
          </Link>

          {/* Primary Management Navigation */}
          <nav className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t('nav.management')}
            </p>
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sky-50 text-[#087FDB] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-[#087FDB]' : 'text-slate-400')} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* System & Tools Navigation */}
          <nav className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t('nav.system')}
            </p>
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sky-50 text-[#087FDB] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-[#087FDB]' : 'text-slate-400')} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account & Language Selection in Drawer */}
        <div className="pt-4 border-t border-slate-200 mt-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500">Language / भाषा</span>
            <LanguageToggle />
          </div>

          <div className="flex items-center justify-between px-2 pt-1 border-t border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-800">{userName || 'Gym Owner'}</p>
              <p className="text-xs text-slate-400">{t('common.owner')}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('common.signOut')}</span>
              </button>
            </form>
          </div>

          <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 border border-slate-100 flex items-center justify-between">
            <span className="font-semibold text-slate-700">BahiBar v1.0</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="h-3 w-3" /> Secure Local
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
