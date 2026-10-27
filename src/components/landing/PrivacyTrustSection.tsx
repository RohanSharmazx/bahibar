'use client';

import { ShieldCheck, Download, Database, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function PrivacyTrustSection() {
  const { t } = useI18n();

  return (
    <section id="security" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80 scroll-mt-16 sm:scroll-mt-20 relative">
      <span id="trust" className="absolute -top-20" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#087FDB] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            {t('landing.securityTitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101F33]">
            {t('landing.securityHeadline')}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            {t('landing.securityCopy')}
          </p>
        </div>

        {/* 4 Architecture Pillars */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Separation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Gym Workspace Scoping</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every member, plan, and fee entry is partitioned by unique gym ID with PostgreSQL Row-Level
              Security in cloud mode, ensuring each owner only accesses their own gym&apos;s data.
            </p>
            <div className="pt-2 text-[11px] text-sky-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Partitioned by gym workspace
            </div>
          </div>

          {/* Pillar 2: Data Portability */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Download className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">1-Click Spreadsheet Exports</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You are never locked in. Download your complete members directory, plan catalog, and payment
              ledger into clean CSV files compatible with Microsoft Excel and Google Sheets.
            </p>
            <div className="pt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Includes UTF-8 BOM formatting
            </div>
          </div>

          {/* Pillar 3: Immutable Financial History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Permanent Payment History</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Recorded payments are saved as sequential transaction entries. Renewing an expired membership
              never overwrites or erases previous fee receipts or historical records.
            </p>
            <div className="pt-2 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Unbroken historical ledger
            </div>
          </div>

          {/* Pillar 4: Backup & Restoration */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Structured JSON Backup</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export a complete, structured JSON backup of your gym&apos;s plans, members, and transactions
              directly from your settings whenever you need independent offline archives.
            </p>
            <div className="pt-2 text-[11px] text-purple-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Available on-demand
            </div>
          </div>
        </div>

        {/* Honest Technical Status Notice */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">
                Current Technical Status & Architecture Notes:
              </p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Workspaces support complete export and safe cascade deletion. While on-demand CSV and JSON
                exports are fully operational today, automated nightly off-site backups remain on our production
                cloud infrastructure roadmap.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
