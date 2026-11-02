'use client';

import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate, getDaysRemaining } from '@/lib/utils/dates';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  Search,
  Phone,
  ArrowRight,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import type { MemberWithMembership } from '@/types';

interface MembersListClientProps {
  members: MemberWithMembership[];
  search?: string;
  status?: string;
}

export function MembersListClient({
  members,
  search,
  status = 'all',
}: MembersListClientProps) {
  const { t, formatNumber } = useI18n();

  const filterTabs = [
    { label: t.members.tabAll, value: 'all' },
    { label: t.members.tabActive, value: 'active' },
    { label: t.members.tabExpiring, value: 'expiring' },
    { label: t.members.tabExpired, value: 'expired' },
    { label: t.members.tabDues, value: 'dues' },
    { label: t.members.tabArchived, value: 'archived' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.members.title}</h1>
          <p className="text-sm text-slate-500">
            {formatNumber(members.length)}{' '}
            {status === 'archived' ? t.members.archivedRecords : t.members.registeredRecords}
          </p>
        </div>
        <Link
          href="/members/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-xs hover:bg-sky-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>{t.members.addMemberBtn}</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form className="relative w-full sm:max-w-xs" method="GET" role="search">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            name="search"
            aria-label={t.members.searchPlaceholder}
            defaultValue={search || ''}
            placeholder={t.members.searchPlaceholder}
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
          />
          {status !== 'all' && <input type="hidden" name="status" value={status} />}
        </form>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0" role="tablist">
          {filterTabs.map((tab) => {
            const isActive = status === tab.value;
            const href = `?status=${tab.value}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
            return (
              <Link
                key={tab.value}
                href={href}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Members Directory Content */}
      {members.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 mb-4">
            <User className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{t.members.noMembersFound}</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            {search
              ? `${t.members.noMembersMatching} "${search}". ${t.members.tryDifferentSearch}`
              : t.members.addFirstMemberInstructions}
          </p>
          <Link
            href="/members/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 text-sm font-semibold text-white shadow-xs hover:bg-sky-700"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t.members.addMemberBtn}</span>
          </Link>
        </Card>
      ) : (
        <>
          {/* Desktop Table View (lg screens and above) */}
          <div className="hidden lg:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">{t.members.colMember}</th>
                  <th className="px-6 py-3.5">{t.members.colMobile}</th>
                  <th className="px-6 py-3.5">{t.members.colActivePlan}</th>
                  <th className="px-6 py-3.5">{t.members.colExpiryDate}</th>
                  <th className="px-6 py-3.5">{t.members.colStatus}</th>
                  <th className="px-6 py-3.5">{t.members.colFeeBalance}</th>
                  <th className="px-6 py-3.5 text-right">{t.members.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => {
                  const currentMem = member.current_membership;
                  const hasDue = member.outstanding_balance > 0;
                  const daysRemaining = currentMem ? getDaysRemaining(currentMem.end_date) : null;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        <Link
                          href={`/members/${member.id}`}
                          className="hover:text-sky-600 transition-colors flex items-center gap-2"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700 font-bold text-xs">
                            {member.full_name.charAt(0).toUpperCase()}
                          </span>
                          <span>{member.full_name}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-mono text-xs">
                        {member.mobile}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                        {currentMem ? currentMem.plan_name_snapshot : t.members.noActivePlan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">
                        {currentMem ? formatDate(currentMem.end_date) : t.members.noActivePlan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currentMem ? (
                          daysRemaining !== null && daysRemaining < 0 ? (
                            <Badge variant="danger" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {t.common.expired}
                            </Badge>
                          ) : daysRemaining !== null && daysRemaining <= 7 ? (
                            <Badge variant="warning" className="gap-1">
                              <Clock className="h-3 w-3" />
                              {daysRemaining}d left
                            </Badge>
                          ) : (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {t.common.active}
                            </Badge>
                          )
                        ) : (
                          <Badge variant="default">{t.members.noActivePlan}</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasDue ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {t.dashboard.dueAmount} {formatCurrency(member.outstanding_balance)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {t.dashboard.fullyPaid}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/members/${member.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                        >
                          {t.members.viewAndPay} <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Card View (< lg screens) */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => {
              const currentMem = member.current_membership;
              const hasDue = member.outstanding_balance > 0;
              const daysRemaining = currentMem ? getDaysRemaining(currentMem.end_date) : null;

              return (
                <Link
                  key={member.id}
                  href={`/members/${member.id}`}
                  className="group block"
                >
                  <Card className="h-full transition-all hover:border-sky-400 hover:shadow-md">
                    <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                              {member.full_name}
                            </h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3 shrink-0" />
                              <span className="font-mono">{member.mobile}</span>
                            </p>
                          </div>
                          <div className="shrink-0">
                            {currentMem ? (
                              daysRemaining !== null && daysRemaining < 0 ? (
                                <Badge variant="danger" className="gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {t.common.expired}
                                </Badge>
                              ) : daysRemaining !== null && daysRemaining <= 7 ? (
                                <Badge variant="warning" className="gap-1">
                                  <Clock className="h-3 w-3" />
                                  {daysRemaining}d left
                                </Badge>
                              ) : (
                                <Badge variant="success" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {t.common.active}
                                </Badge>
                              )
                            ) : (
                              <Badge variant="default">{t.members.noActivePlan}</Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">{t.members.colActivePlan}:</span>
                            <span className="font-medium text-slate-800">
                              {currentMem ? currentMem.plan_name_snapshot : t.members.noActivePlan}
                            </span>
                          </div>

                          {currentMem && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">{t.members.colExpiryDate}:</span>
                              <span className="font-medium text-slate-800">
                                {formatDate(currentMem.end_date)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          {hasDue ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                              <AlertTriangle className="h-3 w-3" />
                              {t.dashboard.dueAmount} {formatCurrency(member.outstanding_balance)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              {t.dashboard.fullyPaid}
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-semibold text-sky-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          {t.members.viewAndPay} <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}