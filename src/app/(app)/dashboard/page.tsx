import { getMembersWithDetailsAction } from '@/actions/members';
import { getCollectionSummaryAction } from '@/actions/payments';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const [members, collections] = await Promise.all([
    getMembersWithDetailsAction({ status: 'all' }),
    getCollectionSummaryAction(),
  ]);

  return <DashboardClient members={members} collections={collections} />;
}
