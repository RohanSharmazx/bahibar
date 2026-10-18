import { getCurrentGymData } from '@/actions/gym';
import { AppShell } from '@/components/layout/AppShell';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { gym, subscription, userName } = await getCurrentGymData();

  // If user is authenticated but has not onboarded a gym yet, redirect to onboarding
  if (!gym) {
    redirect('/onboarding');
  }

  return (
    <AppShell gym={gym} subscription={subscription} userName={userName}>
      {children}
    </AppShell>
  );
}
