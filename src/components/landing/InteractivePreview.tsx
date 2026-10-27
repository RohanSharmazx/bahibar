'use client';

import { useState, useMemo } from 'react';
import { Search, RotateCcw, Calendar, CreditCard, IndianRupee, CheckCircle2, UserCheck, ShieldAlert, Sparkles, Clock, Check } from 'lucide-react';
import { calculateEndDate, formatDate, formatDateToISO, parseDateOnly } from '@/lib/utils/dates';
import { formatCurrency } from '@/lib/utils/currency';

interface DemoMember {
  id: string;
  name: string;
  phone: string;
  defaultPlan: string;
  planId: string;
  durationMonths: number;
  price: number;
  joinedDate: string;
}

const DEMO_MEMBERS: DemoMember[] = [
  {
    id: 'm1',
    name: 'Sunil Verma',
    phone: '98234 56789',
    defaultPlan: '3 Months Exclusive',
    planId: 'p2',
    durationMonths: 3,
    price: 4500,
    joinedDate: '2026-10-18',
  },
  {
    id: 'm2',
    name: 'Pooja Sharma',
    phone: '98111 23456',
    defaultPlan: '1 Month Standard',
    planId: 'p1',
    durationMonths: 1,
    price: 1500,
    joinedDate: '2026-10-18',
  },
  {
    id: 'm3',
    name: 'Amit Rao',
    phone: '98765 43210',
    defaultPlan: '6 Months Fitness',
    planId: 'p3',
    durationMonths: 6,
    price: 8000,
    joinedDate: '2026-10-18',
  },
  {
    id: 'm4',
    name: 'Rohan Deshmukh',
    phone: '97654 32198',
    defaultPlan: '1 Year Annual Strength',
    planId: 'p4',
    durationMonths: 12,
    price: 14000,
    joinedDate: '2026-10-18',
  },
];

const DEMO_PLANS = [
  { id: 'p1', name: '1 Month Standard', duration: 1, price: 1500 },
  { id: 'p2', name: '3 Months Exclusive', duration: 3, price: 4500 },
  { id: 'p3', name: '6 Months Fitness', duration: 6, price: 8000 },
  { id: 'p4', name: '1 Year Annual Strength', duration: 12, price: 14000 },
];

export function InteractivePreview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('m1');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('p2');
  const [startDate, setStartDate] = useState<string>('2026-10-18');
  const [paymentOption, setPaymentOption] = useState<'full' | 'partial' | 'unpaid'>('full');
  const [customPaidAmount, setCustomPaidAmount] = useState<number>(2500);

  // Selected member object
  const selectedMember = useMemo(
    () => DEMO_MEMBERS.find((m) => m.id === selectedMemberId) || DEMO_MEMBERS[0],
    [selectedMemberId]
  );

  // Selected plan object
  const selectedPlan = useMemo(
    () => DEMO_PLANS.find((p) => p.id === selectedPlanId) || DEMO_PLANS[1],
    [selectedPlanId]
  );

  // Expiry calculation using calendar arithmetic
  const calculatedExpiryDate = useMemo(() => {
    try {
      if (!startDate) return '—';
      const end = calculateEndDate(startDate, selectedPlan.duration, 'months');
      return formatDate(end);
    } catch {
      return 'Invalid Date';
    }
  }, [startDate, selectedPlan.duration]);

  // Payment dues calculation
  const totalDue = selectedPlan.price;
  const amountPaid = useMemo(() => {
    if (paymentOption === 'full') return totalDue;
    if (paymentOption === 'unpaid') return 0;
    return Math.min(Math.max(0, customPaidAmount), totalDue);
  }, [paymentOption, customPaidAmount, totalDue]);

  const outstandingBalance = Math.max(0, totalDue - amountPaid);

  // When member changes, also update the plan to match that member's default plan
  const handleMemberSelect = (member: DemoMember) => {
    setSelectedMemberId(member.id);
    setSelectedPlanId(member.planId);
    const plan = DEMO_PLANS.find((p) => p.id === member.planId);
    if (plan && paymentOption === 'partial') {
      setCustomPaidAmount(Math.round(plan.price / 2));
    }
  };

  // When plan changes, adjust partial paid amount if currently in partial mode
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = DEMO_PLANS.find((p) => p.id === planId);
    if (plan && paymentOption === 'partial') {
      setCustomPaidAmount(Math.round(plan.price / 2));
    }
  };

  // When payment option changes
  const handlePaymentOptionSelect = (opt: 'full' | 'partial' | 'unpaid') => {
    setPaymentOption(opt);
    if (opt === 'partial') {
      if (customPaidAmount >= totalDue || customPaidAmount <= 0) {
        setCustomPaidAmount(Math.round(totalDue / 2));
      }
    }
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return DEMO_MEMBERS;
    const q = searchQuery.toLowerCase();
    return DEMO_MEMBERS.filter(
      (m) => m.name.toLowerCase().includes(q) || m.phone.includes(q)
    );
  }, [searchQuery]);

  // Reset to initial demo state
  const handleReset = () => {
    setSearchQuery('');
    setSelectedMemberId('m1');
    setSelectedPlanId('p2');
    setStartDate('2026-10-18');
    setPaymentOption('full');
    setCustomPaidAmount(2500);
  };

  return (
    <section id="demo" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80 scroll-mt-16 sm:scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600 bg-sky-100/70 px-3 py-1 rounded-full border border-sky-200">
            Live Functional Prototype
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Interactive Product Preview
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Test how member search, calendar-month expiry calculations, and payment tracking operate
            together. No sign up required.
          </p>
        </div>

        {/* Demo Disclaimer Banner */}
        <div className="mt-8 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Demonstration data only.</strong> This interactive sandbox runs entirely in your
              browser and does not save records to a server.
            </span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 tap-feedback"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Demo
          </button>
        </div>

        {/* Interactive Workspace */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Member Directory & Search */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Step 1: Choose or Search Member
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {filteredMembers.length} available
                </span>
              </div>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="previewMemberSearch"
                  name="previewMemberSearch"
                  type="text"
                  placeholder="Type name (e.g. Pooja, Sunil)..."
                  aria-label="Search demo members by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-sky-500 font-medium min-h-[40px]"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto p-2">
              {filteredMembers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No fictional members match &quot;{searchQuery}&quot;. Try &quot;Sunil&quot; or &quot;Pooja&quot;.
                </div>
              ) : (
                filteredMembers.map((m) => {
                  const isSelected = m.id === selectedMemberId;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleMemberSelect(m)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer min-h-[48px] tap-feedback ${
                        isSelected
                          ? 'bg-sky-50 border border-sky-300 ring-2 ring-sky-300/40 shadow-xs'
                          : 'hover:bg-slate-50 active:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${
                            isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            {m.name}
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">+91 {m.phone}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        isSelected ? 'bg-sky-100 text-sky-800 font-bold' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {m.defaultPlan}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Interactive Plan, Expiry & Fee Calculator */}
          <div className="w-full lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">
                  Step 2: Interactive Plan Terms & Expiry
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Enrollment for {selectedMember.name}
                </h3>
              </div>
              <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 font-mono self-start sm:self-auto">
                Phone: {selectedMember.phone}
              </span>
            </div>

            {/* Plan Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Membership Plan
                </label>
                <span className="text-[11px] text-sky-700 font-semibold">
                  Active: {selectedPlan.name}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DEMO_PLANS.map((plan) => {
                  const isSelected = plan.id === selectedPlanId;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer min-h-[56px] tap-feedback ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-500/30 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 active:bg-slate-100'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 leading-snug">{plan.name}</p>
                      <p className="text-xs font-bold text-sky-700 mt-1">{formatCurrency(plan.price)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {plan.duration} {plan.duration === 1 ? 'Month' : 'Months'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dates & Auto-Calculated Expiry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <label htmlFor="previewStartDateInput" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  Membership Start Date
                </label>
                <input
                  id="previewStartDateInput"
                  name="previewStartDateInput"
                  type="date"
                  value={startDate}
                  aria-label="Membership Start Date"
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 min-h-[44px]"
                />
                {/* Date Shortcut Buttons for Mobile */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setStartDate('2026-10-18')}
                    className="text-[10px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 px-2 py-1 rounded cursor-pointer tap-feedback"
                  >
                    18 Oct Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => setStartDate('2027-01-31')}
                    className="text-[10px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 px-2 py-1 rounded cursor-pointer tap-feedback text-amber-800"
                    title="Test month-end clamping on Jan 31"
                  >
                    31 Jan (Clamping)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  Calculated Expiry Date
                </span>
                <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-extrabold text-emerald-800 min-h-[44px] flex items-center justify-between shadow-2xs">
                  <span>{calculatedExpiryDate}</span>
                  <span className="text-[10px] uppercase font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    Auto-set
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium block">
                  {selectedPlan.duration} calendar {selectedPlan.duration === 1 ? 'month' : 'months'} full coverage
                </span>
              </div>
            </div>

            {/* Payment & Outstanding Dues Simulation */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Simulate Payment Collection
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handlePaymentOptionSelect('full')}
                  className={`min-h-[44px] py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center text-center tap-feedback ${
                    paymentOption === 'full'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  Full Paid ({formatCurrency(totalDue)})
                </button>
                <button
                  type="button"
                  onClick={() => handlePaymentOptionSelect('partial')}
                  className={`min-h-[44px] py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center text-center tap-feedback ${
                    paymentOption === 'partial'
                      ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/30 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  Partial Installment
                </button>
                <button
                  type="button"
                  onClick={() => handlePaymentOptionSelect('unpaid')}
                  className={`min-h-[44px] py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center text-center tap-feedback ${
                    paymentOption === 'unpaid'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/30 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  Unpaid (Full Due)
                </button>
              </div>

              {paymentOption === 'partial' && (
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <span className="font-medium text-amber-900">Enter partial amount collected:</span>
                  <div className="flex items-center gap-2">
                    <label htmlFor="previewPartialAmount" className="font-bold text-slate-600">
                      ₹
                    </label>
                    <input
                      id="previewPartialAmount"
                      name="previewPartialAmount"
                      type="number"
                      min="100"
                      max={totalDue}
                      step="100"
                      value={customPaidAmount}
                      aria-label="Partial amount collected"
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCustomPaidAmount(isNaN(val) ? 0 : val);
                      }}
                      className="w-28 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 font-bold text-xs text-right focus:outline-none focus:border-amber-500 min-h-[36px]"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomPaidAmount(Math.round(totalDue / 2))}
                      className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 font-bold px-2 py-1 rounded cursor-pointer tap-feedback"
                    >
                      50%
                    </button>
                  </div>
                </div>
              )}

              {/* Financial Snapshot Summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Agreed Fee</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {formatCurrency(totalDue)}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-700 block font-medium">Recorded Paid</span>
                  <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
                    {formatCurrency(amountPaid)}
                  </span>
                </div>
                <div>
                  <span className={`block font-medium ${outstandingBalance > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                    Pending Due
                  </span>
                  <span
                    className={`font-bold text-sm mt-0.5 block ${
                      outstandingBalance > 0 ? 'text-rose-700' : 'text-slate-700'
                    }`}
                  >
                    {formatCurrency(outstandingBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
