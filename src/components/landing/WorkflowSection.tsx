'use client';

import { useState } from 'react';
import { Layers, UserPlus, CreditCard, BellRing, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface Stage {
  number: number;
  title: string;
  tagline: string;
  description: string;
  icon: any;
  mockupHeader: string;
  mockupContent: React.ReactNode;
}

export function WorkflowSection() {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages: Stage[] = [
    {
      number: 1,
      title: 'Set up your membership plans',
      tagline: 'Define your standard prices and durations',
      description:
        'Create standard monthly, quarterly, semi-annual, or annual packages with your gym fees. You can customize prices during individual member enrollment if needed.',
      icon: Layers,
      mockupHeader: 'Membership Plans Catalog',
      mockupContent: (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs">
            <div>
              <p className="font-bold text-slate-900">1 Month Standard</p>
              <p className="text-[11px] text-slate-500">Duration: 1 month</p>
            </div>
            <span className="font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded">₹1,500.00</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-sky-300 bg-sky-50/50 shadow-2xs">
            <div>
              <p className="font-bold text-slate-900">3 Months Exclusive</p>
              <p className="text-[11px] text-sky-700 font-medium">Duration: 3 months (Most Popular)</p>
            </div>
            <span className="font-bold text-sky-700 bg-white border border-sky-200 px-2 py-1 rounded">
              ₹4,500.00
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs">
            <div>
              <p className="font-bold text-slate-900">1 Year Annual Strength</p>
              <p className="text-[11px] text-slate-500">Duration: 12 months</p>
            </div>
            <span className="font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded">₹14,000.00</span>
          </div>
        </div>
      ),
    },
    {
      number: 2,
      title: 'Add a member and select a plan',
      tagline: 'Simple 1-minute registration form',
      description:
        'Collect only essential information: full name, mobile number, emergency contact, and plan. No tedious 50-field forms or unnecessary paperwork.',
      icon: UserPlus,
      mockupHeader: 'New Member Registration',
      mockupContent: (
        <div className="space-y-2.5 text-xs bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold">Full Name</span>
            <p className="font-semibold text-slate-900 mt-0.5">Vikram Singh</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold">Mobile</span>
              <p className="font-semibold text-slate-900 mt-0.5 font-mono">+91 98234 56789</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold">Selected Plan</span>
              <p className="font-semibold text-sky-700 mt-0.5">3 Months Exclusive</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 3,
      title: 'See calculated expiry and record payment',
      tagline: 'Automatic date math and payment logging',
      description:
        'BahiBar automatically sets the exact expiry date covering full calendar months. Record cash, UPI, or card collections, and issue instant printable receipts.',
      icon: CreditCard,
      mockupHeader: 'Expiry Date & Payment Voucher',
      mockupContent: (
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Start → Expiry</span>
              <p className="font-bold text-emerald-900">18 Oct 2026 → 18 Jan 2027</p>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
              3 Months
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Payment Mode</span>
              <p className="font-bold text-slate-900">UPI / QR Scan (₹4,500)</p>
            </div>
            <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded font-bold">
              Full Paid
            </span>
          </div>
        </div>
      ),
    },
    {
      number: 4,
      title: 'Review upcoming renewals and outstanding fees',
      tagline: 'Proactive front-desk notifications',
      description:
        'Open your dashboard to see members whose memberships end in the next 7 days, or members with pending fee installments. Send polite 1-click WhatsApp follow-ups.',
      icon: BellRing,
      mockupHeader: 'Front-Desk Renewal Dashboard',
      mockupContent: (
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Pooja Sharma</p>
              <p className="text-[11px] text-amber-800 font-medium">Expires in 4 days • 1 Month Standard</p>
            </div>
            <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
              Due for Renewal
            </span>
          </div>
          <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Amit Rao</p>
              <p className="text-[11px] text-rose-700 font-medium">Installment Balance: ₹1,500</p>
            </div>
            <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded">
              Pending Dues
            </span>
          </div>
        </div>
      ),
    },
  ];

  const current = stages.find((s) => s.number === activeStage)!;

  return (
    <section id="workflow" className="py-16 sm:py-24 bg-white border-b border-slate-200/80 scroll-mt-16 sm:scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Guided Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            How BahiBar is designed to work
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Four straightforward steps that replace the manual routine of physical registers.
          </p>
        </div>

        {/* Workflow Stages Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Navigation: 4 Stages */}
          <div className="lg:col-span-6 space-y-3">
            {stages.map((stage) => {
              const isActive = activeStage === stage.number;
              const Icon = stage.icon;
              return (
                <button
                  key={stage.number}
                  type="button"
                  onClick={() => setActiveStage(stage.number)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer min-h-[48px] tap-feedback ${
                    isActive
                      ? 'border-sky-500 bg-sky-50/60 shadow-xs ring-2 ring-sky-500/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        isActive ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {stage.number}
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          isActive ? 'text-sky-900' : 'text-slate-800'
                        }`}
                      >
                        {stage.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{stage.tagline}</p>
                      {isActive && (
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed border-t border-sky-100 pt-2">
                          {stage.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Preview: Dynamic Stage Mockup */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white font-bold text-xs">
                    {current.number}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{current.mockupHeader}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Step {current.number} of 4</span>
              </div>

              {current.mockupContent}

              <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Designed for daily desk usability</span>
                <span className="text-sky-600 font-semibold">Stage {current.number}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
