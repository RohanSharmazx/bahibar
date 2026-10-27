import { CheckCircle2, ShieldAlert, HeartHandshake, Download } from 'lucide-react';

export function PricingModelSection() {
  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Transparent Monetization
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Our future commercial model
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            We believe in honest, predictable pricing without hidden lock-ins or holding your gym records hostage.
          </p>
        </div>

        {/* Pricing Architecture Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: Pilot Phase */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/20 p-6 sm:p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-full inline-block">
                Current Status
              </span>
              <h3 className="text-lg font-bold text-slate-900">Pre-Launch Pilot</h3>
              <p className="text-2xl font-black text-sky-700">₹0 / Free for Testers</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilot gym owners receive direct access, developer onboarding, and active input into product
                development at zero software cost.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-sky-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                  Full access to all pilot capabilities
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                  Personal developer support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                  Priority early adopter terms
                </li>
              </ul>
            </div>
            <a
              href="#early-access"
              className="mt-6 inline-flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-sky-600 px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-sky-700 active:bg-sky-800 transition-colors"
            >
              Apply for Pilot
            </a>
          </div>

          {/* Card 2: Intended Core Plan */}
          <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 sm:p-7 flex flex-col justify-between shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white">
              Planned Commercial Launch
            </div>
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full inline-block">
                Core Gym Plan
              </span>
              <h3 className="text-lg font-bold text-slate-900">Single Transparent Flat Fee</h3>
              <p className="text-2xl font-black text-slate-900">Affordable Monthly / Annual</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                One clear subscription covering all essential day-to-day gym requirements: members, plans,
                payments, dues tracking, and receipts.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  30-day unrestricted free trial
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  No per-member penalty tiers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Optional annual discount
                </li>
              </ul>
            </div>
            <div className="mt-6 py-2.5 text-center text-xs font-semibold text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
              Pricing announced prior to public launch
            </div>
          </div>

          {/* Card 3: Post-Trial & Cancellation Policy */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200/70 px-2.5 py-0.5 rounded-full inline-block">
                Our Guarantee
              </span>
              <h3 className="text-lg font-bold text-slate-900">No Hostage Data Policy</h3>
              <p className="text-2xl font-black text-slate-700">Your Records are Yours</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                If you ever decide to pause or stop using BahiBar, your member records and historical
                payments are never deleted or locked away.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-slate-600 shrink-0" />
                  Full Excel CSV export always enabled
                </li>
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-slate-600 shrink-0" />
                  Full JSON backup snapshot download
                </li>
                <li className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-slate-600 shrink-0" />
                  Zero cancellation obstacles
                </li>
              </ul>
            </div>
            <div className="mt-6 text-center text-[11px] text-slate-400">
              Transparent, fair business practices
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
