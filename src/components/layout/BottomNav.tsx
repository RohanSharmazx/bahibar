'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  IndianRupee,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Download, Settings, UserPlus } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function BottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { t } = useI18n();

  const mobileTabs = [
    { name: t.bottomNav.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: t.bottomNav.members, href: '/members', icon: Users },
    { name: t.bottomNav.plans, href: '/plans', icon: CreditCard },
    { name: t.bottomNav.payments, href: '/payments', icon: IndianRupee },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-xs lg:hidden pb-safe">
        <div className="grid h-16 grid-cols-5 items-center px-1">
          {mobileTabs.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors h-full',
                  isActive ? 'text-sky-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <Icon className={cn('h-5 w-5 mb-0.5', isActive ? 'text-sky-600' : 'text-slate-400')} />
                <span className="truncate max-w-[56px] text-center">{item.name}</span>
              </Link>
            );
          })}

          {/* More actions trigger */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors h-full cursor-pointer"
          >
            <Menu className="h-5 w-5 mb-0.5 text-slate-400" />
            <span>{t.bottomNav.more}</span>
          </button>
        </div>
      </nav>

      {/* More actions mobile drawer/modal */}
      <Modal
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title={t.bottomNav.moreActions}
        maxWidth="sm"
      >
        <div className="space-y-2 py-2">
          <Link
            href="/members/new"
            onClick={() => setIsMoreOpen(false)}
            className="flex items-center gap-3 rounded-xl bg-sky-50 p-3 text-sm font-semibold text-sky-700 hover:bg-sky-100"
          >
            <UserPlus className="h-5 w-5 text-sky-600" />
            <div>
              <p>{t.bottomNav.addNewMember}</p>
              <p className="text-xs font-normal text-sky-600">{t.bottomNav.registerMemberDesc}</p>
            </div>
          </Link>

          <Link
            href="/export"
            onClick={() => setIsMoreOpen(false)}
            className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-5 w-5 text-slate-500" />
            <div>
              <p>{t.bottomNav.exportData}</p>
              <p className="text-xs text-slate-400">{t.bottomNav.exportDataDesc}</p>
            </div>
          </Link>

          <Link
            href="/settings"
            onClick={() => setIsMoreOpen(false)}
            className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Settings className="h-5 w-5 text-slate-500" />
            <div>
              <p>{t.bottomNav.gymSettings}</p>
              <p className="text-xs text-slate-400">{t.bottomNav.gymSettingsDesc}</p>
            </div>
          </Link>
        </div>
      </Modal>
    </>
  );
}
