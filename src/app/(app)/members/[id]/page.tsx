import { createClient } from '@/lib/supabase/server';
import { requireGymAccess } from '@/lib/supabase/auth-helpers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMemberByIdAction } from '@/actions/members';
import { getPlansAction } from '@/actions/plans';
import { getMemberMembershipsHistoryAction } from '@/actions/memberships';
import { getPaymentsHistoryAction } from '@/actions/payments';
import { getCurrentGymData } from '@/actions/gym';
import { MemberActionsClient } from '@/components/members/MemberActionsClient';
import { MemberPaymentHistoryClient } from '@/components/payments/MemberPaymentHistoryClient';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate, getDaysRemaining, isExpired } from '@/lib/utils/dates';
import { resolveCurrentMembership, calculateMembershipDues } from '@/lib/utils/memberships';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  CreditCard,
  Edit,
  History,
  CheckCircle2,
  Clock,
  MessageCircle,
} from 'lucide-react';
import type { Member } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Fetch Member
  const member = await getMemberByIdAction(id);

  if (!member) {
    notFound();
  }

  // 2. Fetch all memberships history, payments, available plans, and gym data
  const [memberships, payments, availablePlans, gymData] = await Promise.all([
    getMemberMembershipsHistoryAction(id),
    getPaymentsHistoryAction(id),
    getPlansAction(true),
    getCurrentGymData(),
  ]);

  const currentMembership = resolveCurrentMembership(memberships);

  // Outstanding balance calculation for current active membership
  const { totalPaid: totalPaidForCurrent, outstandingBalance } = calculateMembershipDues(
    currentMembership,
    payments
  );

  // Calculate days remaining
  const daysRemaining = currentMembership ? getDaysRemaining(currentMembership.end_date) : null;
  const isCurrentExpired = currentMembership ? isExpired(currentMembership.end_date) : false;

  // Formulate WhatsApp follow-up link for India (prefix with 91 if 10-digit number)
  const rawDigits = member.mobile.replace(/\D/g, '');
  const cleanPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;

  let followUpText = `Hi ${member.full_name}, greetings from ${gymData.gym?.name || 'the gym'}!`;
  if (outstandingBalance > 0) {
    followUpText = `Hi ${member.full_name}, this is a gentle reminder from ${gymData.gym?.name || 'the gym'} regarding your pending fee balance of ${formatCurrency(outstandingBalance)}. Please let us know if you need any assistance.`;
  } else if (isCurrentExpired) {
    followUpText = `Hi ${member.full_name}, your membership at ${gymData.gym?.name || 'the gym'} has expired. Please visit the front desk to renew your plan!`;
  } else if (daysRemaining !== null && daysRemaining <= 7 && currentMembership) {
    followUpText = `Hi ${member.full_name}, your gym membership at ${gymData.gym?.name || 'the gym'} is expiring on ${formatDate(currentMembership.end_date)}. Renew early to keep your workouts uninterrupted!`;
  }
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(followUpText)}`;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/members"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Member List
        </Link>

        <MemberActionsClient
          memberId={member.id}
          isArchived={member.is_archived}
          currentMembership={currentMembership}
          outstandingBalance={outstandingBalance}
          availablePlans={availablePlans}
        />
      </div>

      {member.is_archived && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <span>
            This member is archived. They are excluded from active search lists, but all historical records are preserved.
          </span>
        </div>
      )}

      {/* Main Grid: Profile & Current Membership */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 font-bold text-lg">
                {member.full_name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-lg">{member.full_name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" />
                  {member.mobile}
                </CardDescription>
              </div>
            </div>
            <Link
              href={`/members/${member.id}/edit`}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Edit Profile"
            >
              <Edit className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-sm text-slate-600 border-t border-slate-100">
            {member.email && (
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{member.email}</span>
              </div>
            )}
            {member.gender && (
              <div className="flex items-center gap-2.5 capitalize">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{member.gender}</span>
              </div>
            )}
            {member.date_of_birth && (
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span>DOB: {formatDate(member.date_of_birth)}</span>
              </div>
            )}
            {member.address && (
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{member.address}</span>
              </div>
            )}
            {member.emergency_contact && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="font-semibold text-slate-500">Emergency Contact:</span>
                <p className="mt-0.5 text-slate-700">{member.emergency_contact}</p>
              </div>
            )}
            {member.notes && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="font-semibold text-slate-500">Notes:</span>
                <p className="mt-0.5 text-slate-700">{member.notes}</p>
              </div>
            )}

            {/* Quick Contact & WhatsApp Follow-up */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <a
                href={`tel:${member.mobile}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                title={`Call ${member.full_name}`}
              >
                <Phone className="h-3.5 w-3.5 text-slate-500" />
                Call
              </a>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition-colors"
                title="Send WhatsApp Follow-up"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                WhatsApp
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Current Membership & Fee Status */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">Current Membership</CardTitle>
              <CardDescription>Active subscription terms & balance</CardDescription>
            </div>
            {currentMembership ? (
              isCurrentExpired ? (
                <Badge variant="danger">Expired</Badge>
              ) : daysRemaining !== null && daysRemaining <= 7 ? (
                <Badge variant="warning">{daysRemaining} days left</Badge>
              ) : (
                <Badge variant="success">Active</Badge>
              )
            ) : (
              <Badge variant="default">No Membership</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {currentMembership ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Plan</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {currentMembership.plan_name_snapshot}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Start Date</span>
                    <p className="text-base font-semibold text-slate-900 mt-0.5">
                      {formatDate(currentMembership.start_date)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Expiry Date</span>
                    <p className={`text-base font-bold mt-0.5 ${isCurrentExpired ? 'text-rose-600' : 'text-slate-900'}`}>
                      {formatDate(currentMembership.end_date)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Agreed Fee</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {formatCurrency(currentMembership.agreed_price)}
                    </p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="rounded-xl border border-slate-200 p-3.5">
                    <span className="text-xs text-slate-500">Agreed Price</span>
                    <p className="text-lg font-bold text-slate-900 mt-1">
                      {formatCurrency(currentMembership.agreed_price)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                    <span className="text-xs text-emerald-700 font-medium">Total Paid</span>
                    <p className="text-lg font-bold text-emerald-800 mt-1">
                      {formatCurrency(totalPaidForCurrent)}
                    </p>
                  </div>
                  <div className={`rounded-xl border p-3.5 ${
                    outstandingBalance > 0
                      ? 'border-rose-200 bg-rose-50/50'
                      : 'border-slate-200 bg-slate-50'
                  }`}>
                    <span className={`text-xs font-medium ${outstandingBalance > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                      Outstanding Dues
                    </span>
                    <p className={`text-lg font-bold mt-1 ${outstandingBalance > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                      {formatCurrency(outstandingBalance)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">No active membership found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs / Sections: Membership History & Payment Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Payment History</CardTitle>
              <CardDescription>Recorded cash / UPI payments</CardDescription>
            </div>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="pt-2">
            <MemberPaymentHistoryClient
              payments={payments}
              memberName={member.full_name}
              memberMobile={member.mobile}
              memberEmail={member.email}
              planName={currentMembership?.plan_name_snapshot}
              gymName={gymData.gym?.name}
              gymPhone={gymData.gym?.contact_number}
              gymAddress={gymData.gym?.address}
              agreedPrice={currentMembership ? Number(currentMembership.agreed_price) : undefined}
              startDate={currentMembership?.start_date}
              endDate={currentMembership?.end_date}
              outstandingBalance={outstandingBalance}
            />
          </CardContent>
        </Card>

        {/* Membership Periods History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Membership History</CardTitle>
              <CardDescription>Past and current subscription periods</CardDescription>
            </div>
            <History className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="pt-2">
            {memberships.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No membership periods recorded.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {memberships.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-slate-900">{m.plan_name_snapshot}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(m.start_date)} → {formatDate(m.end_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800">
                        {formatCurrency(m.agreed_price)}
                      </span>
                      <p className="text-[10px] text-slate-400 capitalize">{m.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
