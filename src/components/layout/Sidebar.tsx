'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  IndianRupee,
  Download,
  Settings,
  UserPlus,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
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

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 border-r border-slate-200 bg-white">
      <div className="flex flex-1 flex-col justify-between p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Quick Action */}
          <Link
            href="/members/new"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#087FDB] px-4 text-sm font-semibold text-white shadow-xs hover:bg-[#0669b6] active:bg-[#055393] transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t('common.addMember')}</span>
          </Link>

          {/* Primary Navigation */}
          <nav className="space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {t('nav.management')}
            </p>
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sky-50 text-[#087FDB] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-[#087FDB]' : 'text-slate-400')} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Tools & Settings Navigation */}
          <nav className="space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {t('nav.system')}
            </p>
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sky-50 text-[#087FDB] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-[#087FDB]' : 'text-slate-400')} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 border border-slate-100 mb-6">
          <p className="font-semibold text-slate-700">BahiBar v1.0</p>
          <p className="mt-0.5">{t('common.appTagline')}</p>
        </div>
      </div>
    </aside>
  );
}
