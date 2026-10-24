'use client';

import { useState } from 'react';
import { Search, CreditCard, Calendar, Check, X, Shield, Smartphone } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

type ComparisonTab = 'find' | 'payment' | 'expiry';

export function ComparisonSection() {
  const [activeTab, setActiveTab] = useState<ComparisonTab>('find');

  return (
    <section id="comparison" className="py-16 sm:py-24 bg-white border-b border-slate-200/80 scroll-mt-16 sm:scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Side-by-Side Comparison
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Paper register vs. BahiBar preview
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Compare what happens at your reception desk in everyday gym scenarios.
          </p>
        </div>

        {/* Scenario Tabs */}
        <div role="tablist" aria-label="Comparison Scenarios" className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'find'}
            onClick={() => setActiveTab('find')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px] tap-feedback tab-transition ${
              activeTab === 'find'
                ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-600/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
            }`}
          >
            <Search className="h-4 w-4" />
            1. Find a Member
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'payment'}
            onClick={() => setActiveTab('payment')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px] tap-feedback tab-transition ${
              activeTab === 'payment'
                ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-600/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            2. Check Payment Status
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'expiry'}
            onClick={() => setActiveTab('expiry')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px] tap-feedback tab-transition ${
              activeTab === 'expiry'
                ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-600/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
            }`}
          >
            <Calendar className="h-4 w-4" />
            3. Calculate Expiry Date
          </button>
        </div>

        {/* Comparison Showcase */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Paper Register Representation */}
          <div className="rounded-2xl border border-slate-300 bg-amber-50/20 p-6 sm:p-8 flex flex-col justify-between text-left">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                    Traditional Method
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">Physical Paper Ledger</h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-medium">
                  Current Practice
                </span>
              </div>

              {activeTab === 'find' && (
                <div className="space-y-3.5 text-sm text-slate-700">
                  <div className="bg-white p-4 rounded-xl border border-amber-200 font-mono text-xs text-slate-600 space-y-1 shadow-2xs">
                    <p className="text-slate-400 font-bold border-b pb-1">PAGE 42 — OCTOBER REGISTRATIONS</p>
                    <p>• 02/10 - Sunil Verma | 98234... | 3M | ₹4,500 cash [tick mark]</p>
                    <p>• 04/10 - Pooja Sharma | 98111... | 1M | ₹1,200 [paid ₹800, due ₹400]</p>
                    <p>• 08/10 - Amit Kumar | [illegible ink smudge]</p>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      Must locate the correct binder or month notebook.
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      Entries can be scattered across multiple pages after renewals.
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      Physical wear, spills, and lost loose slips risk record loss.
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-3.5 text-sm text-slate-700">
                  <div className="bg-white p-4 rounded-xl border border-amber-200 text-xs text-slate-600 space-y-2 shadow-2xs">
                    <p className="font-semibold text-slate-800">Scenario: Member states they already paid via UPI</p>
                    <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 text-[11px] space-y-1 font-mono">
                      <p>1. Check counter cash diary for matching date.</p>
                      <p>2. Ask member to search bank statement on their mobile.</p>
                      <p>3. Calculate remaining ₹400 balance on scrap paper.</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      No single consolidated view of total fees vs amount collected.
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      Receipts depend on handwritten slips that members frequently lose.
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'expiry' && (
                <div className="space-y-3.5 text-sm text-slate-700">
                  <div className="bg-white p-4 rounded-xl border border-amber-200 text-xs text-slate-600 space-y-2 shadow-2xs">
                    <p className="font-semibold text-slate-800">Scenario: Member joined on 31 Jan for 1 Month</p>
                    <p className="text-xs text-slate-600">
                      Does the membership end on 28 Feb or 02 March? Month-end leap year calculation is
                      frequently estimated by hand.
                    </p>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      Manual daily scanning of 100+ lines to find who is due today.
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      Members train unnoticed for 1-2 weeks past expiry before notice.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-amber-200/60 text-xs text-slate-500">
              Reliant on physical custody, handwriting legibility, and memory.
            </div>
          </div>

          {/* BahiBar Digital Representation */}
          <div className="rounded-2xl border border-sky-300 bg-sky-50/30 p-6 sm:p-8 flex flex-col justify-between text-left shadow-sm">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-sky-200/80">
                <div>
                  <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">
                    BahiBar Solution
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">Interactive Digital Card</h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                  Proposed Design
                </span>
              </div>

              {activeTab === 'find' && (
                <div className="space-y-3.5">
                  {/* Digital Preview Component */}
                  <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Search className="h-4 w-4 text-sky-600" />
                      <span className="text-xs font-mono text-slate-800 font-bold">Searching &quot;Pooja&quot;...</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Pooja Sharma</p>
                        <p className="text-xs text-slate-500">+91 98111 23456 • Active</p>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        Due: ₹400
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      Find any member instantly by typing 2 characters of their name or phone.
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      All past renewals and fee history grouped under one member profile.
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      Accessible from front desk computer or mobile phone.
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-3.5">
                  <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-2xs space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Agreed Fee:</span>
                      <span className="font-bold text-slate-800">₹1,200.00</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Collected:</span>
                      <span className="font-bold text-emerald-600">₹800.00 (UPI - 04 Oct)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-100">
                      <span className="text-rose-700 font-bold">Balance Due:</span>
                      <span className="font-bold text-rose-700 text-sm">₹400.00</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      Live dues calculated without mental math or paper cross-checking.
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      Printable receipt voucher slips with gym name and transaction reference.
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'expiry' && (
                <div className="space-y-3.5">
                  <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Start Date:</span>
                      <span className="font-semibold text-slate-800">31 Jan 2027</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Plan Duration:</span>
                      <span className="font-semibold text-slate-800">1 Month</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="text-sky-800 font-bold">Calculated Expiry:</span>
                      <span className="font-bold text-emerald-700">28 Feb 2027 (Clamped)</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      Deterministic calendar arithmetic prevents calculation disputes.
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      &quot;Expiring in 7 Days&quot; dashboard tab surfaces upcoming renewals automatically.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-sky-200/80 text-xs text-sky-800 font-medium">
              Information is structured, searchable, and exportable at any time.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
