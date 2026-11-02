import { getMembersWithDetailsAction } from '@/actions/members';
import { MembersListClient } from '@/components/members/MembersListClient';

interface MembersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: 'all' | 'active' | 'expiring' | 'expired' | 'dues' | 'archived';
  }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const { search, status = 'all' } = await searchParams;
  const members = await getMembersWithDetailsAction({ search, status });

  return (
    <MembersListClient
      members={members}
      search={search}
      status={status}
    />
  );
}
