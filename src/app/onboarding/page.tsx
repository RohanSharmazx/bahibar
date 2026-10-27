import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getUser, getUserGymStaff } from '@/lib/supabase/auth-helpers';
import { OnboardingForm } from './OnboardingForm';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ new_workspace?: string }>;
}) {
  const user = await getUser();
  if (!user) {
    redirect('/login?redirectTo=/onboarding');
  }

  const resolvedParams = await searchParams;
  const isNewWorkspace = resolvedParams?.new_workspace === 'true';

  if (!isNewWorkspace) {
    const staff = await getUserGymStaff();
    if (staff) {
      redirect('/dashboard');
    }
  }

  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-slate-500">Loading gym setup...</div>}>
      <OnboardingForm isNewWorkspace={isNewWorkspace} />
    </Suspense>
  );
}
