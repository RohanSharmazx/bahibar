import Link from 'next/link';
import { BahiBarLogo } from '@/components/ui/logo';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — BahiBar',
  description: 'How BahiBar protects gym member records and owner data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <BahiBarLogo size="sm" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 sm:px-6">
        <article className="mx-auto max-w-3xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 border border-sky-200">
              <ShieldCheck className="h-4 w-4 text-[#087FDB]" />
              Data Safety & Ownership
            </div>
            <h1 className="text-3xl font-extrabold text-[#101F33]">Privacy Policy</h1>
            <p className="text-sm text-slate-500">Effective Date: October 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Data Ownership</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your member records, phone numbers, and payment transaction entries belong entirely to your gym
              workspace. BahiBar acts strictly as a data processor. We do not sell, share, or monetize member
              contact details or transaction records under any circumstances.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Information We Store</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We store the gym owner’s account email and credentials, gym contact details, and the member
              information you explicitly record (name, phone number, plan start and end dates, and payment logs).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. Data Portability & Deletion</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              You are never locked into BahiBar. You can export your full member registry and payment transactions
              to Excel-compatible CSV or JSON at any time. When an authorized gym owner chooses to delete their gym
              workspace from settings, all associated member records, memberships, and transaction logs are
              permanently purged.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Contact</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              For privacy inquiries or technical questions regarding record deletion, contact us at{' '}
              <a href="mailto:support@bahibar.com" className="text-[#087FDB] font-semibold hover:underline">
                support@bahibar.com
              </a>.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}