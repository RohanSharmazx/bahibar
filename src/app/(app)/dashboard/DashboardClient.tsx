'use client';

import Link from 'next/link';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import {
  isMembershipActive,
  isMembershipExpiringSoon,
} from '@/lib/utils/memberships';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  AlertTriangle,
  IndianRupee,
  Clock,
  ArrowRight,
  UserPlus,
  CreditCard,
  Download,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import type { MemberWithMembership } from '@/types';

interface DashboardClientProps {
  members: MemberWithMembership[];
  collections: {
    today: number;
    thisMonth: number;
    monthLabel: string;
  };
}

export function DashboardClient({ members, collections }: DashboardClientProps) {
  const { t, formatNumber } = useI18n();

  const totalMembers = members.length;
  const activeMembers = members.filter((m) =>
    isMembershipActive(m.current_membership)
  ).length;

  const expiringSoonMembers = members.filter((m) =>
    isMembershipExpiringSoon(m.current_membership, 7)
  );

  const membersWithDues = members.filter((m) => m.outstanding_balance > 0);
  const totalOutstanding = membersWithDues.reduce((acc, m) => acc + m.outstanding_balance, 0);

  const recentMembers = members.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.dashboard.title}</h1>
          <p className="text-sm text-slate-500">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/members/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-xs hover:bg-sky-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t.dashboard.addMemberBtn}</span>
          </Link>
          <Link
            href="/plans/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            <span>{t.dashboard.newPlanBtn}</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (adaptive 1 col on < 375px, 2 col on tablet, 4 col on desktop) */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SpotlightCard className="border-l-4 border-l-sky-500" spotlightColor="rgba(14, 165, 233, 0.15)">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.totalMembers}</span>
              <Users className="h-4 w-4 text-sky-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{formatNumber(totalMembers)}</div>
            <p className="text-xs text-slate-500 mt-1">
              {formatNumber(activeMembers)} {t.dashboard.activeMembershipsCount}
            </p>
          </CardContent>
        </SpotlightCard>

        <SpotlightCard className="border-l-4 border-l-amber-500" spotlightColor="rgba(245, 158, 11, 0.15)">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.expiring7DaysTitle}</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{formatNumber(expiringSoonMembers.length)}</div>
            <p className="text-xs text-slate-500 mt-1">{t.dashboard.needFollowUp}</p>
          </CardContent>
        </SpotlightCard>

        <SpotlightCard className="border-l-4 border-l-emerald-500" spotlightColor="rgba(16, 185, 129, 0.15)">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.todayFees}</span>
              <IndianRupee className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {formatCurrencyCompact(collections.today)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {collections.today === 0 && collections.thisMonth > 0
                ? `${t.dashboard.monthFees} ${formatCurrencyCompact(collections.thisMonth)} (${t.dashboard.earlierThisMonth})`
                : `${t.dashboard.monthFees} ${formatCurrencyCompact(collections.thisMonth)} (${collections.monthLabel})`}
            </p>
          </CardContent>
        </SpotlightCard>

        <SpotlightCard className="border-l-4 border-l-rose-500" spotlightColor="rgba(244, 63, 94, 0.15)">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.outstandingDuesTitle}</span>
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-rose-600">
              {formatCurrencyCompact(totalOutstanding)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formatNumber(membersWithDues.length)} {t.dashboard.membersWithBalance}
            </p>
          </CardContent>
        </SpotlightCard>
      </div>

      {/* Action / Attention Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expiring this week */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-base">{t.dashboard.expiringWithin7DaysTitle}</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">{t.dashboard.expiringWithin7DaysDesc}</p>
              </div>
              <Link
                href="/members"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                {t.dashboard.viewAllMembers} <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {expiringSoonMembers.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  {t.dashboard.noExpiringMembers}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {expiringSoonMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <Link
                          href={`/members/${m.id}`}
                          className="font-medium text-slate-900 hover:text-sky-600"
                        >
                          {m.full_name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {m.mobile} • {m.current_membership?.plan_name_snapshot}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {t.dashboard.expiresOn} {formatDate(m.current_membership!.end_date)}
                        </span>
                        <div className="mt-1">
                          <Link
                            href={`/members/${m.id}`}
                            className="text-xs font-medium text-sky-600 hover:underline"
                          >
                            {t.dashboard.renewAction}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Registrations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-base">{t.dashboard.recentRegistrationsTitle}</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">{t.dashboard.recentRegistrationsDesc}</p>
              </div>
              <Link
                href="/members"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                {t.dashboard.viewAllMembers} <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {recentMembers.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  {t.dashboard.noMembersYet}.{' '}
                  <Link href="/members/new" className="text-sky-600 font-medium underline">
                    {t.dashboard.addFirstMemberPrompt}
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <Link
                          href={`/members/${m.id}`}
                          className="font-medium text-slate-900 hover:text-sky-600"
                        >
                          {m.full_name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {m.mobile} • {t.dashboard.joinedOn} {formatDate(m.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        {m.outstanding_balance > 0 ? (
                          <Badge variant="danger">
                            {t.dashboard.dueAmount} {formatCurrency(m.outstanding_balance)}
                          </Badge>
                        ) : (
                          <Badge variant="success">{t.dashboard.fullyPaid}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Operations Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.dashboard.quickShortcuts}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Link
                href="/members/new"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.dashboard.registerMemberShortcut}</p>
                  <p className="text-xs text-slate-500">{t.dashboard.registerMemberShortcutDesc}</p>
                </div>
              </Link>

              <Link
                href="/plans"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.dashboard.managePlansShortcut}</p>
                  <p className="text-xs text-slate-500">{t.dashboard.managePlansShortcutDesc}</p>
                </div>
              </Link>

              <Link
                href="/payments"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.dashboard.collectionReportsShortcut}</p>
                  <p className="text-xs text-slate-500">{t.dashboard.collectionReportsShortcutDesc}</p>
                </div>
              </Link>

              <Link
                href="/export"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.dashboard.exportAllDataShortcut}</p>
                  <p className="text-xs text-slate-500">{t.dashboard.exportAllDataShortcutDesc}</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}