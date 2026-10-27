'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function FinalCtaSection() {
  const { t } = useI18n();

  return (
    <section id="early-access" className="py-16 sm:py-24 bg-[#101F33] text-white relative overflow-hidden scroll-mt-16 sm:scroll-mt-20">
      {/* Decorative Brand Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-[#087FDB]/20 to-[#12BBDD]/20 blur-3xl pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-[#12BBDD] border border-white/10 backdrop-blur-xs">
          <span className="flex h-2 w-2 rounded-full bg-[#12BBDD] animate-pulse" />
          <span>30-Day Unrestricted Free Trial</span>
        </div>

        {/* Headline & Body */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t('landing.finalCtaHeadline')}
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t('landing.finalCtaCopy')}
          </p>
        </div>

        {/* Primary & Secondary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#087FDB] px-8 text-sm font-bold text-white shadow-lg hover:bg-[#0669b6] active:bg-[#055393] transition-all cursor-pointer min-h-[48px] tap-feedback"
          >
            <span>{t('landing.finalCtaButton')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10 active:bg-white/15 transition-all cursor-pointer min-h-[48px] tap-feedback"
          >
            <span>{t('common.signIn')}</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#12BBDD]" />
            No credit card required
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#12BBDD]" />
            Full access to all features
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#12BBDD]" />
            Export your data to Excel anytime
          </span>
        </div>
      </div>
    </section>
  );
}
