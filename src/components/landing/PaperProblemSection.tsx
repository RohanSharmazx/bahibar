'use client';

import { useState } from 'react';
import { BookOpen, Search, IndianRupee, CalendarClock, ArrowRight, CheckCircle2, AlertCircle, FileText, Smartphone } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface Scenario {
  id: 'find' | 'payment' | 'expiry' | 'receipts';
  title: string;
  icon: any;
  paperTitle: string;
  paperSteps: string[];
  paperFriction: string;
  digitalTitle: string;
  digitalSteps: string[];
  digitalBenefit: string;
}

const scenarios: Scenario[] = [
  {
    id: 'find',
    title: 'Finding Member Details',
    icon: Search,
    paperTitle: 'Physical Paper Register',
    paperSteps: [
      'Stop spotting a trainee to pull out the front desk ledger book.',
      'Flip through dozens of handwritten pages or binder sheets.',
      'Try reading blurred phone numbers or duplicate entries under common names.',
      'Search for the last monthly receipt slip if the main register line is full.',
    ],
    paperFriction: 'Requires manual page flipping while members wait at the reception counter.',
    digitalTitle: 'BahiBar Quick Search',
    digitalSteps: [
      'Type 2 letters of member name or 4 digits of their phone number.',
      'Instant profile card surfaces with joined date, plan, and emergency contact.',
      'Full membership history and recorded payments visible in one tap.',
    ],
    digitalBenefit: 'Fast keyword search by member name or mobile directly on your phone or laptop.',
  },
  {
    id: 'payment',
    title: 'Tracking Partial Payments & Dues',
    icon: IndianRupee,
    paperTitle: 'Cash Diary & UPI Screenshots',
    paperSteps: [
      'Cross-reference cash diary scribbles against the member enrollment line.',
      'Ask the member to search their personal UPI app history for past transaction IDs.',
      'Deal with awkward disputes when an installment was noted on a loose slip.',
      'Manual calculation of remaining balance for partial payment installments.',
    ],
    paperFriction: 'Uncertainty over who paid what; creates hesitation when asking for dues.',
    digitalTitle: 'BahiBar Audit Ledger',
    digitalSteps: [
      'Chronological payment record with payment mode (Cash, UPI, Card).',
      'Agreed price snapshot minus total collected automatically computed.',
      'Clear, bold balance due indicator; zero guesswork during renewal.',
    ],
    digitalBenefit: 'Unambiguous financial trail with running balances and optional printable vouchers.',
  },
  {
    id: 'expiry',
    title: 'Checking Expired Memberships',
    icon: CalendarClock,
    paperTitle: 'Manual Daily Calendar Scanning',
    paperSteps: [
      'Manually scan all register pages at the start or end of the week.',
      'Count calendar months manually across leap years and 30/31-day months.',
      'Members continue working out for days or weeks after expiry unnoticed.',
      'Ad-hoc reminders made verbally at the gym gate with no advance notice.',
    ],
    paperFriction: 'Members unintentionally train past their paid term; missed renewal cycles.',
    digitalTitle: 'Automated Expiry Calculation',
    digitalSteps: [
      'Automatic calendar-month arithmetic with leap year and month-end clamping.',
      'Dedicated "Expiring in 7 Days" filter surfaces members needing follow-up.',
      'One-tap renewal extension from the day after expiry for seamless continuity.',
    ],
    digitalBenefit: 'Never miss an upcoming expiry; timely, polite renewal conversations.',
  },
  {
    id: 'receipts',
    title: 'Preparing Receipts Manually',
    icon: FileText,
    paperTitle: 'Carbon-Copy Receipt Slips',
    paperSteps: [
      'Find the carbon paper and paper receipt pad during morning rush hour.',
      'Hand-write gym name, date, member name, plan duration, and amount.',
      'Tear off the customer copy and hope the carbon duplicate doesn’t smudge.',
      'Store duplicate books in cupboards where finding an old receipt takes hours.',
    ],
    paperFriction: 'Slow hand-writing during peak hours and lost records when slips fade.',
    digitalTitle: 'One-Click Digital Receipts',
    digitalSteps: [
      'Receipts generate instantly from recorded payments with official gym letterhead.',
      'Download clean PDF vouchers directly or print on standard desk printers.',
      'Instant WhatsApp text slip ready to send to the member in one click.',
    ],
    digitalBenefit: 'Clean, professional vouchers generated in seconds without paper clutter.',
  },
];

export function PaperProblemSection() {
  const [activeTab, setActiveTab] = useState<'find' | 'payment' | 'expiry' | 'receipts'>('find');
  const { t } = useI18n();

  const currentScenario = scenarios.find((s) => s.id === activeTab)!;

  return (
    <section id="problem" className="py-16 sm:py-24 bg-white border-b border-slate-200/80 scroll-mt-16 sm:scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#087FDB] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            {t('landing.problemTitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101F33]">
            {t('landing.problemHeadline')}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            {t('landing.problemCopy')}
          </p>

          {/* Visual Concept Transition Banner */}
          <div className="pt-2 flex items-center justify-center gap-3 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
              <BookOpen className="h-3.5 w-3.5" />
              Physical Paper Diary
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="flex items-center gap-1.5 text-[#087FDB] bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
              <Smartphone className="h-3.5 w-3.5 text-[#087FDB]" />
              Sorted Digital Ledger
            </span>
          </div>
        </div>

        {/* Scenario Selectors */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            const isActive = activeTab === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setActiveTab(scenario.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] active:scale-[0.98] ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{scenario.title}</span>
              </button>
            );
          })}
        </div>

        {/* Micro-Interaction Comparison Card */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Paper Side */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/20 p-6 sm:p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
                  <BookOpen className="h-5 w-5 text-rose-600" />
                  <h3>{currentScenario.paperTitle}</h3>
                </div>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-full">
                  Manual Friction
                </span>
              </div>

              <ol className="space-y-3 text-sm text-slate-700">
                {currentScenario.paperSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-800 font-bold text-xs mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 pt-4 border-t border-rose-100/80 flex items-start gap-2 text-xs text-rose-800 bg-rose-100/40 p-3 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <p>
                <strong>The Cost:</strong> {currentScenario.paperFriction}
              </p>
            </div>
          </div>

          {/* Digital Side */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/20 p-6 sm:p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-base">
                  <Smartphone className="h-5 w-5 text-sky-600" />
                  <h3>{currentScenario.digitalTitle}</h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  BahiBar Approach
                </span>
              </div>

              <ol className="space-y-3 text-sm text-slate-700">
                {currentScenario.digitalSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-800 font-bold text-xs mt-0.5">
                      ✓
                    </span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 pt-4 border-t border-sky-100/80 flex items-start gap-2 text-xs text-sky-900 bg-sky-100/40 p-3 rounded-xl">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
              <p>
                <strong>Intended Outcome:</strong> {currentScenario.digitalBenefit}
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer Note */}
        <p className="mt-4 text-center text-xs text-slate-400">
          Scenarios reflect typical workflow observations from independent neighborhood fitness centers. Demonstration comparison only.
        </p>
      </div>
    </section>
  );
}
