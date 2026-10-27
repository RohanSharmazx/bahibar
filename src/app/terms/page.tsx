import Link from 'next/link';
import { BahiBarLogo } from '@/components/ui/logo';
import { FileText, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — BahiBar',
  description: 'Terms and conditions for using BahiBar gym management software.',
};

export default function TermsPage() {
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
              <FileText className="h-4 w-4 text-[#087FDB]" />
              Account & Service Terms
            </div>
            <h1 className="text-3xl font-extrabold text-[#101F33]">Terms of Service</h1>
            <p className="text-sm text-slate-500">Effective Date: October 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Service Provision</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              BahiBar provides cloud-based gym member tracking, payment recording, and receipt generation software
              intended for independent gym owners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Free Trial & Subscriptions</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              New gym accounts receive a 30-day unrestricted free trial with access to all core features. No credit
              card is required at signup. At the end of the trial period, accounts may subscribe to continue adding
              new members. In all cases, existing records remain exportable under our no-hostage-data principle.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. Responsible Use</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Gym owners are responsible for maintaining the confidentiality of their credentials and for ensuring
              that member information is entered in compliance with applicable local regulations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Support & Contact</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              If you have any questions or require operational assistance, contact us at{' '}
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