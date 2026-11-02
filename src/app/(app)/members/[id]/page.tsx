import { notFound } from 'next/navigation';
import { getMemberByIdAction } from '@/actions/members';
import { getPlansAction } from '@/actions/plans';
import { getMemberMembershipsHistoryAction } from '@/actions/memberships';
import { getPaymentsHistoryAction } from '@/actions/payments';
import { getCurrentGymData } from '@/actions/gym';
import { MemberDetailClient } from '@/components/members/MemberDetailClient';
import { resolveCurrentMembership, calculateMembershipDues } from '@/lib/utils/memberships';

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

  return (
    <MemberDetailClient
      member={member}
      memberships={memberships}
      payments={payments}
      availablePlans={availablePlans}
      gymName={gymData.gym?.name}
      gymPhone={gymData.gym?.contact_number}
      gymAddress={gymData.gym?.address}
      currentMembership={currentMembership}
      totalPaidForCurrent={totalPaidForCurrent}
      outstandingBalance={outstandingBalance}
    />
  );
}
