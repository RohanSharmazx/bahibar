'use client';

import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  CreditCard,
  Calendar,
  FileCheck2,
  CheckCircle2,
  Clock,
  IndianRupee,
  Download,
  Printer,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Search,
  MessageCircle,
} from 'lucide-react';
import { calculateEndDate, formatDate, formatDateToISO } from '@/lib/utils/dates';
import { formatCurrency } from '@/lib/utils/currency';
import { downloadReceiptPdf, type ReceiptPdfData } from '@/lib/utils/pdf';
import { useI18n } from '@/lib/i18n/context';

export type StoryStep = 'register' | 'payment' | 'dues' | 'receipt';

interface DemoPlan {
  id: string;
  name: string;
  duration: number;
  durationUnit: 'days' | 'months';
  price: number;
}

const DEMO_PLANS: DemoPlan[] = [
  { id: 'p1', name: '1 Month Standard', duration: 1, durationUnit: 'months', price: 1500 },
  { id: 'p2', name: '3 Months Quarterly', duration: 3, durationUnit: 'months', price: 4500 },
  { id: 'p3', name: '6 Months Fitness', duration: 6, durationUnit: 'months', price: 8000 },
  { id: 'p4', name: '1 Year Annual Strength', duration: 12, durationUnit: 'months', price: 14000 },
];

export function ProductStorySection() {
  const { t } = useI18n();
  const [activeStep, setActiveStep] = useState<StoryStep>('register');

  // Step 1: Member Registration State
  const [memberName, setMemberName] = useState('Vikram Rathore');
  const [memberPhone, setMemberPhone] = useState('98201 44556');
  const [selectedPlanId, setSelectedPlanId] = useState('p2');
  const [startDate, setStartDate] = useState('2026-10-18');

  // Step 2: Payment Recording State
  const [paymentOption, setPaymentOption] = useState<'full' | 'partial' | 'unpaid'>('partial');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash' | 'card'>('upi');
  const [txnRef, setTxnRef] = useState('UPI-9820144556-OK');

  // Step 3: Dues & Expiry Filter State
  const [duesFilter, setDuesFilter] = useState<'all' | 'expiring' | 'dues' | 'active'>('all');
  const [selectedRosterMember, setSelectedRosterMember] = useState<'vikram' | 'pooja' | 'amit'>('vikram');

  // Step 4: Receipt State Feedback
  const [copiedSlip, setCopiedSlip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Selected Plan Object
  const currentPlan = useMemo(
    () => DEMO_PLANS.find((p) => p.id === selectedPlanId) || DEMO_PLANS[1],
    [selectedPlanId]
  );

  // Calculated Expiry Date
  const calculatedExpiryDate = useMemo(() => {
    try {
      if (!startDate) return '—';
      const end = calculateEndDate(startDate, currentPlan.duration, currentPlan.durationUnit);
      return formatDate(end);
    } catch {
      return 'Invalid Date';
    }
  }, [startDate, currentPlan]);

  // Payment Breakdown Calculations (100% mathematically consistent)
  const agreedPrice = currentPlan.price;
  const amountPaid = useMemo(() => {
    if (paymentOption === 'full') return agreedPrice;
    if (paymentOption === 'unpaid') return 0;
    if (agreedPrice === 4500) return 2500;
    return Math.round(agreedPrice * 0.55);
  }, [paymentOption, agreedPrice]);

  const outstandingBalance = agreedPrice - amountPaid;

  // Receipt Data for Pure TypeScript Client PDF Download
  const receiptPdfData: ReceiptPdfData = useMemo(
    () => ({
      id: 'demo-8812',
      amount: amountPaid,
      payment_date: startDate || '2026-10-18',
      payment_method: paymentMethod,
      transaction_reference: paymentMethod === 'upi' ? txnRef : null,
      memberName: memberName || 'Vikram Rathore',
      memberMobile: memberPhone || '98201 44556',
      memberEmail: 'vikram.rathore@example.com',
      planName: currentPlan.name,
      gymName: 'Olympic Fitness Club',
      gymPhone: '98765 43210',
      gymAddress: 'Plot 14, Main Market, Sector 14, Gurugram',
      agreedPrice,
      startDate,
      endDate: calculatedExpiryDate,
      outstandingBalance,
    }),
    [amountPaid, startDate, paymentMethod, txnRef, memberName, memberPhone, currentPlan, agreedPrice, calculatedExpiryDate, outstandingBalance]
  );

  const handleDownloadPdf = () => {
    try {
      downloadReceiptPdf(receiptPdfData, `BahiBar-Demo-Receipt-${memberName.replace(/\s+/g, '_')}.pdf`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopySlip = () => {
    const slipText = `*Fee Payment Voucher - Olympic Fitness Club*\n` +
      `Receipt No: REC-DEMO-8812\n` +
      `Member: ${memberName}\n` +
      `Plan: ${currentPlan.name}\n` +
      `Amount Paid: ${formatCurrency(amountPaid)}\n` +
      `Payment Mode: ${paymentMethod.toUpperCase()}\n` +
      `Balance Due: ${formatCurrency(outstandingBalance)}\n` +
      `Valid Until: ${calculatedExpiryDate}\n\n` +
      `Thank you for working out with us!`;

    navigator.clipboard?.writeText(slipText).then(() => {
      setCopiedSlip(true);
      setTimeout(() => setCopiedSlip(false), 2500);
    });
  };

  const handleResetDemo = () => {
    setMemberName('Vikram Rathore');
    setMemberPhone('98201 44556');
    setSelectedPlanId('p2');
    setStartDate('2026-10-18');
    setPaymentOption('partial');
    setPaymentMethod('upi');
    setDuesFilter('all');
    setActiveStep('register');
  };

  return (
    <section
      id="story"
      className="py-16 sm:py-24 bg-slate-50/80 border-b border-slate-200/80 scroll-mt-16 sm:scroll-mt-20 relative overflow-hidden"
    >
      {/* Compatibility Anchor for Existing #demo and #workflow Links */}
      <span id="demo" className="absolute -top-20" aria-hidden="true" />
      <span id="workflow" className="absolute -top-20" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#087FDB] border border-sky-200/80 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-[#12BBDD]" />
            {t('landing.storyTitle')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101F33]">
            {t('landing.storyHeadline')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t('landing.storyCopy')}
          </p>
        </div>

        {/* Story Step Segmented Navigation Bar */}
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            {[
              { id: 'register', number: '1', title: t('landing.step1Title').split(':')[1]?.trim() || 'Register', subtitle: 'New Enrollment' },
              { id: 'payment', number: '2', title: t('landing.step2Title').split(':')[1]?.trim() || 'Payment', subtitle: 'Record Fees' },
              { id: 'dues', number: '3', title: t('landing.step3Title').split(':')[1]?.trim() || 'Ledger', subtitle: 'Track Dues' },
              { id: 'receipt', number: '4', title: t('landing.step4Title').split(':')[1]?.trim() || 'Receipt', subtitle: 'Instant Voucher' },
            ].map((step) => {
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id as StoryStep)}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all cursor-pointer min-h-[44px] tap-feedback ${
                    isActive
                      ? 'bg-[#101F33] text-white shadow-sm ring-2 ring-[#087FDB]/40'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  aria-pressed={isActive}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-[#087FDB] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {step.number}
                    </span>
                    <span className="text-xs font-bold">{step.title}</span>
                  </div>
                  <span
                    className={`text-[10px] hidden sm:inline ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {step.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Interactive Stage (2-Column Desktop, Stacked Mobile) */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Context & Narrative Explanation */}
          <div className="lg:col-span-5 space-y-6">
            {activeStep === 'register' && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#087FDB] uppercase tracking-wider">
                  <UserPlus className="h-4 w-4" />
                  Step 1 of 4 — Member Registration
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-[#101F33]">
                  Enroll a member with automatic expiry dates.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enter the member’s name, contact number, and select their membership duration.
                  BahiBar applies standard calendar-month arithmetic with leap-year clamping so the
                  expiry date is accurate right down to the day.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Instant calendar anniversary computation (e.g. 18 Oct + 3 Mo = 18 Jan)</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Snapshot pricing protects historical fees when plan rates change</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Single-entry enrollment automatically populates dues and collections</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveStep('payment')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#087FDB] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0669b6] active:bg-[#055393] transition-all cursor-pointer min-h-[44px] tap-feedback"
                  >
                    <span>Proceed to Step 2: Record Payment</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeStep === 'payment' && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#087FDB] uppercase tracking-wider">
                  <CreditCard className="h-4 w-4" />
                  Step 2 of 4 — Fee Payment & Dues
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-[#101F33]">
                  Record full or partial payments without gaps.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Gym members rarely pay on a rigid schedule. Whether they pay upfront via UPI, leave a
                  cash advance, or take an installment, BahiBar keeps the ledger balanced with zero
                  scribbles in notebook margins.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Support for Cash, UPI, and Card transactions with reference tags</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Instant mathematical balance due calculation: Agreed Fee − Paid = Pending</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Immutable payment logs create an audit trail you can trust</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep('dues')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#087FDB] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0669b6] active:bg-[#055393] transition-all cursor-pointer min-h-[44px] tap-feedback"
                  >
                    <span>Proceed to Step 3: Track Dues</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep('register')}
                    className="text-xs text-slate-500 hover:text-slate-800 underline min-h-[44px] flex items-center"
                  >
                    ← Back to Registration
                  </button>
                </div>
              </div>
            )}

            {activeStep === 'dues' && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#087FDB] uppercase tracking-wider">
                  <Calendar className="h-4 w-4" />
                  Step 3 of 4 — Membership Ledger
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-[#101F33]">
                  Spot upcoming renewals and dues at a glance.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  No more scanning registers line-by-line. BahiBar immediately surfaces members who are
                  due for renewal in the next 7 days or who carry an unpaid balance.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>One-tap filters: Expiring Soon, Pending Dues, Active</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Calculates exact days left until expiration automatically</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Seamless 1-click renewal continuation from the day after expiry</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep('receipt')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#087FDB] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0669b6] active:bg-[#055393] transition-all cursor-pointer min-h-[44px] tap-feedback"
                  >
                    <span>Proceed to Step 4: Generate Receipt</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep('payment')}
                    className="text-xs text-slate-500 hover:text-slate-800 underline min-h-[44px] flex items-center"
                  >
                    ← Back to Payment
                  </button>
                </div>
              </div>
            )}

            {activeStep === 'receipt' && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#087FDB] uppercase tracking-wider">
                  <FileCheck2 className="h-4 w-4" />
                  Step 4 of 4 — Fee Receipt Voucher
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-[#101F33]">
                  Produce a professional receipt in 1 tap.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Provide instant proof of payment without handwritten duplicate slips. Download a crisp,
                  standalone PDF receipt, print a counter voucher, or copy a WhatsApp summary directly.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Pure client-side zero-dependency PDF generator: works on mobile & desktop</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Standardized voucher with gym letterhead, receipt number, and dues</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Pre-formatted WhatsApp message ready to share with the trainee</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer min-h-[44px] tap-feedback"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                    <span>Reset Simulation</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep('register')}
                    className="text-xs text-slate-500 hover:text-slate-800 underline min-h-[44px] flex items-center"
                  >
                    Start From Step 1
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Interactive Product Viewport (Sticky on Desktop) */}
          <div className="w-full lg:col-span-7 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xl overflow-hidden text-left">
              {/* Window Chrome Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-[#101F33] px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-[11px] font-medium text-slate-300 font-mono">
                    Olympic Fitness Club • BahiBar Desk
                  </span>
                </div>
                <span className="rounded-md bg-sky-900/80 px-2 py-0.5 text-[10px] font-bold text-[#12BBDD] uppercase tracking-wider border border-sky-700/50">
                  Interactive Demo
                </span>
              </div>

              {/* Viewport Content for Current Active Step */}
              <div className="p-4 sm:p-6 bg-slate-50/40">
                {/* STEP 1: Registration Card */}
                {activeStep === 'register' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#101F33]">New Member Enrollment</h4>
                        <p className="text-xs text-slate-500">Live test: Change plan or date to see expiry update</p>
                      </div>
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        Step 1 Form
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="memberName" className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name
                        </label>
                        <input
                          id="memberName"
                          name="memberName"
                          type="text"
                          value={memberName}
                          onChange={(e) => setMemberName(e.target.value)}
                          aria-label="Full Name"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#087FDB] focus:outline-hidden min-h-[44px]"
                          placeholder="Member name"
                        />
                      </div>
                      <div>
                        <label htmlFor="memberPhone" className="block text-xs font-semibold text-slate-700 mb-1">
                          Mobile Number
                        </label>
                        <input
                          id="memberPhone"
                          name="memberPhone"
                          type="tel"
                          value={memberPhone}
                          onChange={(e) => setMemberPhone(e.target.value)}
                          aria-label="Mobile Number"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#087FDB] focus:outline-hidden min-h-[44px]"
                          placeholder="10-digit number"
                        />
                      </div>
                    </div>

                    {/* Plan Selector Buttons */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Select Membership Pricing Plan
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                        {DEMO_PLANS.map((plan) => {
                          const isSelected = selectedPlanId === plan.id;
                          return (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={() => setSelectedPlanId(plan.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] tap-feedback ${
                                isSelected
                                  ? 'border-[#087FDB] bg-sky-50/70 ring-1 ring-[#087FDB]'
                                  : 'border-slate-200 bg-white hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900">{plan.name}</span>
                                {isSelected && <Check className="h-3.5 w-3.5 text-[#087FDB]" />}
                              </div>
                              <span className="text-xs font-extrabold text-[#087FDB]">
                                {formatCurrency(plan.price)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Joining Date & Computed Expiry */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      <div>
                        <label htmlFor="startDateInput" className="block text-xs font-semibold text-slate-700 mb-1">
                          Joining Date
                        </label>
                        <input
                          id="startDateInput"
                          name="startDateInput"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          aria-label="Joining Date"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#087FDB] focus:outline-hidden min-h-[44px]"
                        />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Calculated Expiry Date
                        </span>
                        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-bold text-emerald-800 min-h-[44px]">
                          <span>{calculatedExpiryDate}</span>
                          <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                            Exact Month
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Calculated Agreed Fee Display */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Agreed Membership Fee:</span>
                      <span className="text-base font-extrabold text-[#101F33]">
                        {formatCurrency(agreedPrice)}
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 2: Record Payment View */}
                {activeStep === 'payment' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#101F33]">
                          Record Fee Collection — {memberName}
                        </h4>
                        <p className="text-xs text-slate-500">Plan: {currentPlan.name} • Agreed: {formatCurrency(agreedPrice)}</p>
                      </div>
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        Step 2 Ledger
                      </span>
                    </div>

                    {/* Payment Installment Options */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Amount Received by Gym Desk
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentOption('full')}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] tap-feedback ${
                            paymentOption === 'full'
                              ? 'border-[#087FDB] bg-sky-50/80 ring-1 ring-[#087FDB]'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-xs font-bold text-slate-900">Full Payment</span>
                          <span className="text-xs font-extrabold text-[#087FDB] block">
                            {formatCurrency(agreedPrice)}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentOption('partial')}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] tap-feedback ${
                            paymentOption === 'partial'
                              ? 'border-[#087FDB] bg-sky-50/80 ring-1 ring-[#087FDB]'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-xs font-bold text-slate-900">Partial Installment</span>
                          <span className="text-xs font-extrabold text-[#087FDB] block">
                            {formatCurrency(agreedPrice === 4500 ? 2500 : Math.round(agreedPrice * 0.55))}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentOption('unpaid')}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] tap-feedback ${
                            paymentOption === 'unpaid'
                              ? 'border-rose-400 bg-rose-50/80 ring-1 ring-rose-400'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-xs font-bold text-slate-900">Unpaid / Due</span>
                          <span className="text-xs font-extrabold text-rose-600 block">₹0.00</span>
                        </button>
                      </div>
                    </div>

                    {/* Payment Mode Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Payment Mode
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['upi', 'cash', 'card'] as const).map((mode) => {
                          const isSelected = paymentMethod === mode;
                          return (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setPaymentMethod(mode)}
                              className={`py-2 px-3 rounded-lg border text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[44px] tap-feedback ${
                                isSelected
                                  ? 'border-[#101F33] bg-[#101F33] text-white shadow-2xs'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {mode}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Transaction Reference (if UPI) */}
                    {paymentMethod === 'upi' && (
                      <div>
                        <label htmlFor="storyTxnRef" className="block text-xs font-semibold text-slate-700 mb-1">
                          UPI Transaction Ref (Optional)
                        </label>
                        <input
                          id="storyTxnRef"
                          name="storyTxnRef"
                          type="text"
                          value={txnRef}
                          onChange={(e) => setTxnRef(e.target.value)}
                          aria-label="UPI Transaction Reference"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#087FDB] focus:outline-hidden min-h-[44px] font-mono"
                        />
                      </div>
                    )}

                    {/* Real-time Mathematical Accounting Box */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Agreed Package Price:</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(agreedPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Total Collected Today:</span>
                        <span className="font-bold text-emerald-700">{formatCurrency(amountPaid)}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">Pending Balance Due:</span>
                        <span
                          className={`font-extrabold text-sm px-2 py-0.5 rounded ${
                            outstandingBalance > 0
                              ? 'text-rose-700 bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {formatCurrency(outstandingBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Live Dues & Renewals Ledger */}
                {activeStep === 'dues' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#101F33]">Gym Member Dues & Renewals</h4>
                        <p className="text-xs text-slate-500">Filter and audit active members and overdue fees</p>
                      </div>
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        Step 3 Table
                      </span>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/90 rounded-xl text-xs">
                      {[
                        { id: 'all', label: 'All Roster (3)' },
                        { id: 'expiring', label: 'Expiring Soon (1)' },
                        { id: 'dues', label: 'Pending Dues (1)' },
                        { id: 'active', label: 'Fully Paid (1)' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setDuesFilter(tab.id as any)}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer min-h-[44px] flex items-center ${
                            duesFilter === tab.id
                              ? 'bg-white text-[#101F33] shadow-2xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Ledger Rows */}
                    <div className="space-y-2">
                      {/* Member 1: Vikram Rathore (from Step 1 & 2) */}
                      {(duesFilter === 'all' || duesFilter === 'dues') && (
                        <div
                          onClick={() => setSelectedRosterMember('vikram')}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedRosterMember === 'vikram'
                              ? 'border-[#087FDB] bg-sky-50/40 shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">{memberName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{memberPhone}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {currentPlan.name} • Exp: {calculatedExpiryDate}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                outstandingBalance > 0
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {outstandingBalance > 0 ? `Due: ${formatCurrency(outstandingBalance)}` : 'Cleared'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Member 2: Pooja Sharma (Expiring in 4 days) */}
                      {(duesFilter === 'all' || duesFilter === 'expiring') && (
                        <div
                          onClick={() => setSelectedRosterMember('pooja')}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedRosterMember === 'pooja'
                              ? 'border-amber-400 bg-amber-50/40 shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">Pooja Sharma</span>
                                <span className="text-[10px] text-slate-400 font-mono">98111 23456</span>
                              </div>
                              <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                                1 Month Standard • Expires in 6 days (24 Oct)
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              Expiring Soon
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Member 3: Amit Rao (Active, fully paid) */}
                      {(duesFilter === 'all' || duesFilter === 'active') && (
                        <div
                          onClick={() => setSelectedRosterMember('amit')}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedRosterMember === 'amit'
                              ? 'border-emerald-400 bg-emerald-50/40 shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">Amit Rao</span>
                                <span className="text-[10px] text-slate-400 font-mono">98765 43210</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                6 Months Fitness • Exp: 18 Apr 2027
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active • Paid
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: Standalone Receipt Voucher View */}
                {activeStep === 'receipt' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#101F33]">Generated Fee Receipt</h4>
                        <p className="text-xs text-slate-500">Official voucher based on recorded payment</p>
                      </div>
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        Step 4 Voucher
                      </span>
                    </div>

                    {/* Realistic Receipt Slip Paper Mockup */}
                    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm space-y-3 font-sans">
                      {/* Receipt Header */}
                      <div className="border-b border-dashed border-slate-200 pb-3 text-center space-y-1">
                        <h5 className="font-black text-sm text-[#101F33] tracking-wide uppercase">
                          Olympic Fitness Club
                        </h5>
                        <p className="text-[11px] text-slate-500">Sector 14 Market, Gurugram • Phone: 98765 43210</p>
                        <p className="text-[10px] font-mono text-slate-400">RECEIPT NO: REC-DEMO-8812 • DATE: {startDate}</p>
                      </div>

                      {/* Receipt Member & Plan Breakdown */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Member Name:</span>
                          <span className="font-bold text-slate-900">{memberName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Phone:</span>
                          <span className="font-mono text-slate-700">{memberPhone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Enrolled Plan:</span>
                          <span className="font-semibold text-slate-800">{currentPlan.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Valid Period:</span>
                          <span className="font-medium text-slate-700">{startDate} to {calculatedExpiryDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Payment Mode:</span>
                          <span className="font-bold uppercase text-sky-700">{paymentMethod}</span>
                        </div>
                      </div>

                      {/* Totals & Balance Due */}
                      <div className="border-t border-dashed border-slate-200 pt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total Agreed Price:</span>
                          <span className="font-semibold text-slate-800">{formatCurrency(agreedPrice)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Amount Paid (Received):</span>
                          <span>{formatCurrency(amountPaid)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-100 font-extrabold text-slate-900">
                          <span>Balance Remaining:</span>
                          <span className={outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                            {formatCurrency(outstandingBalance)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Functional Receipt Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#087FDB] px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0669b6] active:bg-[#055393] transition-all cursor-pointer min-h-[44px] tap-feedback"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{downloadSuccess ? 'Downloaded!' : 'Download PDF'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer min-h-[44px] tap-feedback"
                      >
                        <Printer className="h-3.5 w-3.5 text-slate-500" />
                        <span>Print Voucher</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopySlip}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer min-h-[44px] tap-feedback"
                      >
                        {copiedSlip ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-emerald-600" />}
                        <span>{copiedSlip ? 'Copied Slip!' : 'WhatsApp Slip'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Viewport Footer */}
              <div className="bg-[#101F33] px-4 py-2.5 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Interactive sandbox • Real client state only (no DB writes)</span>
                <span className="font-bold text-[#12BBDD]">
                  Step {activeStep === 'register' ? '1' : activeStep === 'payment' ? '2' : activeStep === 'dues' ? '3' : '4'} of 4
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
