'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, Clock, Calendar, Users, IndianRupee, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n/context';

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="w-full lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3.5 py-1 text-xs font-semibold text-sky-800 border border-sky-200/80 shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-sky-600 animate-pulse" />
              {t('landing.heroPill')}
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              {t('landing.heroHeadline1')}{' '}
              <span className="text-[#087FDB] block sm:inline">
                {t('landing.heroHeadline2')}
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t('landing.heroCopy')}
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#087FDB] px-6 text-sm font-bold text-white shadow-md hover:bg-[#0669b6] active:bg-[#055393] transition-all cursor-pointer min-h-[48px] tap-feedback"
              >
                <span>{t('landing.startTrial')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#story"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer min-h-[48px] tap-feedback"
              >
                <span>{t('landing.seeHowItWorks')}</span>
              </a>
            </div>

            {/* Existing gym sign in prompt */}
            <div className="pt-1 text-center lg:text-left">
              <span className="text-xs text-slate-500">
                {t('landing.existingGymPrompt')}{' '}
                <Link
                  href="/login"
                  className="font-semibold text-sky-600 hover:text-sky-700 underline underline-offset-2"
                >
                  {t('landing.signInLink')}
                </Link>
              </span>
            </div>

            {/* Micro value badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                No physical notebook wear-and-tear
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Standard calendar-month expiry
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Indian Rupee & UPI friendly
              </span>
            </div>
          </div>

          {/* Right Column: Realistic Product Mockup Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative background glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-400/20 to-indigo-400/20 blur-xl opacity-70 pointer-events-none" />

              {/* Realistic Mockup Container */}
              <div className="relative rounded-2xl border border-slate-200/90 bg-white shadow-xl overflow-hidden text-left">
                {/* Mockup Window Chrome */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-[11px] font-medium text-slate-500 font-mono">
                      Olympic Fitness Club • BahiBar Desk
                    </span>
                  </div>
                  <span className="rounded-md bg-sky-100/80 px-2 py-0.5 text-[10px] font-bold text-sky-800 uppercase tracking-wider">
                    Product Preview
                  </span>
                </div>

                {/* Mockup Quick Stats Header */}
                <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50/60 border-b border-slate-100 text-center text-xs">
                  <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-medium">Active Members</span>
                    <span className="text-base font-extrabold text-[#101F33]">142</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-emerald-600 block font-medium">Collections</span>
                    <span className="text-base font-extrabold text-emerald-700">₹1.84L</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-amber-600 block font-medium">Expiring Soon</span>
                    <span className="text-base font-extrabold text-amber-700">6</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-rose-600 block font-medium">Pending Dues</span>
                    <span className="text-base font-extrabold text-rose-700">₹18,500</span>
                  </div>
                </div>

                {/* Mockup Member Rows (Fictional demonstration data) */}
                <div className="p-3 space-y-2.5">
                  {/* Member 1: Enrolled in demo with partial payment */}
                  <div className="rounded-xl border border-sky-200/80 bg-sky-50/20 p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-[#087FDB] font-bold text-xs">
                          V
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">Vikram Rathore</p>
                          <p className="text-[11px] text-slate-600 font-medium">3 Months Quarterly • Enrolled 18 Oct</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-800 border border-sky-200">
                        Partial Paid
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-sky-100/70">
                      <span className="text-slate-500">Paid: ₹2,500 / ₹4,500</span>
                      <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        Due: ₹2,000
                      </span>
                    </div>
                  </div>

                  {/* Member 2: Expiring soon, fully paid */}
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/20 p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">
                          P
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">Pooja Sharma</p>
                          <p className="text-[11px] text-amber-700 font-medium">1 Month Standard • Valid until 24 Oct</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
                        Expiring (6d)
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-amber-100/70">
                      <span className="text-slate-500">Paid: ₹1,500 (UPI)</span>
                      <span className="font-semibold text-emerald-700">Fees Cleared</span>
                    </div>
                  </div>

                  {/* Member 3: Active with installment due */}
                  <div className="rounded-xl border border-slate-100 p-2.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">
                          R
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">Rohit Kulkarni</p>
                          <p className="text-[11px] text-slate-500">1 Year Annual • Exp: 14 Jun 2027</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                        Active • Dues
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100/70">
                      <span className="text-slate-500">Paid: ₹10,000 / ₹14,000</span>
                      <span className="font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Balance: ₹4,000
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mockup footer indicator */}
                <div className="bg-slate-50/80 px-3.5 py-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Sample Gym Overview • Fictional Demo Data</span>
                  <a href="#story" className="text-[#087FDB] font-semibold hover:underline">
                    Explore Interactive Story →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
