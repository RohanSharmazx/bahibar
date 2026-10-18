import Link from 'next/link';
import { getMembersWithDetailsAction } from '@/actions/members';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, Phone, Calendar, ArrowRight, User } from 'lucide-react';

interface MembersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: 'all' | 'active' | 'expiring' | 'expired' | 'dues' | 'archived';
  }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const { search, status = 'all' } = await searchParams;
  const members = await getMembersWithDetailsAction({ search, status });

  const filterTabs = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Expiring Soon', value: 'expiring' },
    { label: 'Expired', value: 'expired' },
    { label: 'Dues / Pending', value: 'dues' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gym Members</h1>
          <p className="text-sm text-slate-500">
            {members.length} {status === 'archived' ? 'archived' : 'registered'} member records
          </p>
        </div>
        <Link
          href="/members/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-xs hover:bg-sky-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Add Member
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form className="relative w-full sm:max-w-xs" method="GET">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="search"
            name="search"
            defaultValue={search || ''}
            placeholder="Search name or mobile..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
          />
          {status !== 'all' && <input type="hidden" name="status" value={status} />}
        </form>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
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

      {/* Members List */}
      {members.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 mb-4">
            <User className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No members found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            {search
              ? `No members matching "${search}". Try searching with different terms.`
              : 'Add your first member to start tracking attendance and membership fees.'}
          </p>
          <Link
            href="/members/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 text-sm font-semibold text-white shadow-xs hover:bg-sky-700"
          >
            <UserPlus className="h-4 w-4" />
            Add New Member
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const currentMem = member.current_membership;
            const hasDue = member.outstanding_balance > 0;

            let statusBadge = <Badge variant="default">No Active Plan</Badge>;
            if (currentMem) {
              const now = new Date();
              const end = new Date(currentMem.end_date);
              const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

              if (diffDays < 0) {
                statusBadge = <Badge variant="danger">Expired</Badge>;
              } else if (diffDays <= 7) {
                statusBadge = <Badge variant="warning">{diffDays}d left</Badge>;
              } else {
                statusBadge = <Badge variant="success">Active</Badge>;
              }
            }

            return (
              <Link
                key={member.id}
                href={`/members/${member.id}`}
                className="group block"
              >
                <Card className="h-full transition-all hover:border-sky-400 hover:shadow-md">
                  <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {member.full_name}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" />
                            {member.mobile}
                          </p>
                        </div>
                        {statusBadge}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Plan:</span>
                          <span className="font-medium text-slate-800">
                            {currentMem ? currentMem.plan_name_snapshot : 'None'}
                          </span>
                        </div>

                        {currentMem && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Valid Until:</span>
                            <span className="font-medium text-slate-800">
                              {formatDate(currentMem.end_date)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {hasDue ? (
                          <span className="text-xs font-bold text-rose-600">
                            Due: {formatCurrency(member.outstanding_balance)}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-emerald-600">
                            Fully Paid
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-semibold text-sky-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        View <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
