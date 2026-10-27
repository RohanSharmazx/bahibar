import type { Metadata } from 'next';
import { getUser } from '@/lib/supabase/auth-helpers';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { DeletionNoticeBanner } from '@/components/landing/DeletionNoticeBanner';
import { HeroSection } from '@/components/landing/HeroSection';
import { PaperProblemSection } from '@/components/landing/PaperProblemSection';
import { ProductStorySection } from '@/components/landing/ProductStorySection';
import { SavingsEstimator } from '@/components/landing/SavingsEstimator';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { PrivacyTrustSection } from '@/components/landing/PrivacyTrustSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { FinalCtaSection } from '@/components/landing/FinalCtaSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'BahiBar — Digital Gym Register & Member Fee Tracker',
  description:
    'Experience BahiBar: The smart digital gym ledger for Indian fitness clubs. Calculate precise expiry dates, track overdue member dues, and share professional WhatsApp fee vouchers in seconds.',
  keywords: [
    'gym software',
    'gym register',
    'digital gym ledger',
    'fitness club fees',
    'gym member tracker',
    'India gym management',
  ],
  openGraph: {
    title: 'BahiBar — Digital Gym Register & Member Fee Tracker',
    description:
      'Replace notebook registers with BahiBar. Manage member renewals, overdue payments, and instant receipts easily.',
    type: 'website',
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ deleted?: string }>;
}) {
  const user = await getUser();
  const resolvedParams = searchParams ? await searchParams : {};
  const isDeleted = resolvedParams.deleted === 'true';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 scroll-smooth">
      {isDeleted && <DeletionNoticeBanner />}
      <LandingHeader userLoggedIn={!!user} />
      <main className="flex-1">
        {/* Section 1: Hero & Product Preview */}
        <HeroSection />

        {/* Section 2: The Paper-Register Problem */}
        <PaperProblemSection />

        {/* Section 3: One Coherent Interactive Product Story */}
        <ProductStorySection />

        {/* Section 4: Daily Routine & Administrative Time Calculator */}
        <SavingsEstimator />

        {/* Section 5: Core Benefits */}
        <BenefitsSection />

        {/* Section 6: Data Safety, Privacy & Architecture */}
        <PrivacyTrustSection />

        {/* Section 7: Clear FAQs */}
        <FaqSection />

        {/* Section 8: Final Call to Action */}
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
