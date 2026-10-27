'use client';

import { useState } from 'react';
import { Calculator, Clock, Info, Plus, Minus, Users } from 'lucide-react';

export function SavingsEstimator() {
  const [memberCount, setMemberCount] = useState<number>(120);
  const [lookupsPerDay, setLookupsPerDay] = useState<number>(15);
  const [minutesPerLookup, setMinutesPerLookup] = useState<number>(3);
  const [operatingDays, setOperatingDays] = useState<number>(26);

  // When changing member count, adjust lookupsPerDay proportionally if user uses the slider/presets
  const handleMemberCountChange = (val: number) => {
    const safeVal = Math.min(500, Math.max(20, Math.round(Number(val) || 20)));
    setMemberCount(safeVal);
    const suggested = Math.min(100, Math.max(3, Math.round(safeVal * 0.12)));
    setLookupsPerDay(suggested);
  };

  const handleLookupsChange = (val: number) => {
    const safeLookups = Math.min(100, Math.max(1, Math.round(Number(val) || 1)));
    setLookupsPerDay(safeLookups);
  };

  const handlePresetSelect = (members: number) => {
    handleMemberCountChange(members);
  };

  // Formula calculation
  // Monthly lookup time in hours = (Lookups per day × minutes per lookup × operating days per month) ÷ 60
  const monthlyMinutes = lookupsPerDay * minutesPerLookup * operatingDays;
  const monthlyHours = Number((monthlyMinutes / 60).toFixed(1));

  // Equivalent 8-hour working days spent purely searching registers
  const equivalentWorkDays = Number((monthlyHours / 8).toFixed(1));

  return (
    <section id="estimator" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80 scroll-mt-16 sm:scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Interactive Calculator
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Estimate your monthly record-lookup time
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            See how many hours you and your gym trainers spend each month answering questions like{' '}
            <em>&quot;When does my plan expire?&quot;</em> or <em>&quot;Did my UPI payment go through?&quot;</em>
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="w-full lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-sky-600" />
                Your Gym&apos;s Daily Routine Inputs
              </h3>
              <span className="text-xs text-slate-500 font-medium">Tap presets or adjust inputs</span>
            </div>

            {/* Quick Gym Size Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Quick Size Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetSelect(45)}
                  className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer tap-feedback text-center ${
                    memberCount <= 60
                      ? 'border-sky-500 bg-sky-50 text-sky-800 ring-1 ring-sky-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">Studio</span>
                  <span className="text-[11px] opacity-75 font-normal">~45 members</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect(120)}
                  className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer tap-feedback text-center ${
                    memberCount > 60 && memberCount <= 180
                      ? 'border-sky-500 bg-sky-50 text-sky-800 ring-1 ring-sky-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">Standard</span>
                  <span className="text-[11px] opacity-75 font-normal">~120 members</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect(260)}
                  className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer tap-feedback text-center ${
                    memberCount > 180
                      ? 'border-sky-500 bg-sky-50 text-sky-800 ring-1 ring-sky-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">Large Gym</span>
                  <span className="text-[11px] opacity-75 font-normal">~260 members</span>
                </button>
              </div>
            </div>

            {/* Input 1: Active Member Count Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="memberCount" className="text-sm font-semibold text-slate-700">
                  Approximate Active Member Count
                </label>
                <span className="text-sm font-bold text-sky-600 font-mono bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {memberCount} members
                </span>
              </div>
              <input
                id="memberCount"
                name="memberCount"
                type="range"
                min="20"
                max="500"
                step="5"
                value={memberCount}
                aria-label="Approximate Active Member Count"
                aria-valuemin={20}
                aria-valuemax={500}
                aria-valuenow={memberCount}
                onChange={(e) => handleMemberCountChange(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>20 (Small studio)</span>
                <span>250 (Medium gym)</span>
                <span>500+ (Large center)</span>
              </div>
            </div>

            {/* Input 2: Lookups Per Day with Stepper Buttons */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label htmlFor="lookupsPerDay" className="text-sm font-semibold text-slate-700">
                  Manual Record Lookups per Day
                </label>
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setLookupsPerDay(Math.max(1, lookupsPerDay - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 cursor-pointer tap-feedback"
                    aria-label="Decrease lookups"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    id="lookupsPerDay"
                    name="lookupsPerDay"
                    type="number"
                    min="1"
                    max="100"
                    value={lookupsPerDay}
                    aria-label="Manual Record Lookups per Day"
                    onChange={(e) => handleLookupsChange(Number(e.target.value))}
                    className="w-16 rounded-lg border border-slate-300 px-2 py-2 text-sm font-bold text-slate-800 text-center focus:border-sky-500 focus:outline-none min-h-[40px]"
                  />
                  <button
                    type="button"
                    onClick={() => setLookupsPerDay(Math.min(100, lookupsPerDay + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 cursor-pointer tap-feedback"
                    aria-label="Increase lookups"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-slate-500 ml-1">lookups</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Includes new inquiries, expiry queries, payment receipts, and balance checks (~10-15% of active members daily).
              </p>
            </div>

            {/* Input 3: Minutes Per Lookup */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label htmlFor="minutesPerLookup" className="text-sm font-semibold text-slate-700">
                  Average Minutes per Paper Lookup
                </label>
                <select
                  id="minutesPerLookup"
                  name="minutesPerLookup"
                  aria-label="Average Minutes per Paper Lookup"
                  value={minutesPerLookup}
                  onChange={(e) => setMinutesPerLookup(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 focus:border-sky-500 focus:outline-none min-h-[44px] cursor-pointer"
                >
                  <option value={1.5}>1.5 mins (Fast - recent pages)</option>
                  <option value={3}>3.0 mins (Average search & check)</option>
                  <option value={5}>5.0 mins (Cross-checking receipts)</option>
                </select>
              </div>
            </div>

            {/* Input 4: Operating Days per Month */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label htmlFor="operatingDays" className="text-sm font-semibold text-slate-700">
                  Operating Days per Month
                </label>
                <select
                  id="operatingDays"
                  name="operatingDays"
                  aria-label="Operating Days per Month"
                  value={operatingDays}
                  onChange={(e) => setOperatingDays(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 focus:border-sky-500 focus:outline-none min-h-[44px] cursor-pointer"
                >
                  <option value={24}>24 days (Closed Sundays)</option>
                  <option value={26}>26 days (Open 6 days/week)</option>
                  <option value={30}>30 days (Open daily)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-white to-sky-50/50 p-6 sm:p-7 shadow-sm text-slate-900 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Estimated Administrative Time
                </span>
                <Clock className="h-5 w-5 text-sky-600" />
              </div>

              <div>
                <p className="text-xs text-slate-600 font-medium">
                  At these settings, you spend approximately:
                </p>
                <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                  <span className="text-5xl font-black text-sky-700 tracking-tight transition-all duration-200">
                    {monthlyHours}
                  </span>
                  <span className="text-xl font-bold text-slate-700">hours / month</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  That equals roughly{' '}
                  <strong className="text-slate-800 font-bold">{equivalentWorkDays} full 8-hour work days</strong>{' '}
                  each month spent flipping through register pages.
                </p>
              </div>

              {/* Transparent Mathematical Formula Breakdown */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs text-slate-600 space-y-1.5 font-mono">
                <div className="text-[11px] font-bold text-slate-700 font-sans uppercase tracking-wider">
                  Calculation Formula
                </div>
                <p className="text-[11px] text-slate-700">
                  ({lookupsPerDay} lookups/day × {minutesPerLookup} mins × {operatingDays} days) ÷ 60
                </p>
                <p className="text-[11px] text-sky-800 font-semibold">
                  = {monthlyMinutes} minutes = {monthlyHours} hours
                </p>
              </div>

              <div className="rounded-lg bg-sky-100/60 p-3 text-xs text-sky-900 flex items-start gap-2">
                <Info className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
                <p>
                  Digital keyword lookup eliminates page-by-page register searching, allowing desk staff to
                  answer member queries quickly without interrupting coaching on the floor.
                </p>
              </div>
            </div>

            {/* Honest Assumption & Disclaimer Note */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Methodology & Assumptions:</p>
              <p>
                This calculation estimates front-desk time lost to physical record retrieval based on your
                selected inputs. It is an illustrative aid to understand operational friction, not a
                measured result or guaranteed financial savings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
