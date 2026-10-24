'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { createMemberAction } from '@/actions/members';
import { calculateEndDate, formatDate, getTodayISO } from '@/lib/utils/dates';
import { formatCurrency, sanitizeCurrencyInput } from '@/lib/utils/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { ArrowLeft, Calendar, IndianRupee, Sparkles } from 'lucide-react';
import type { MembershipPlan } from '@/types';

interface AddMemberFormProps {
  plans: MembershipPlan[];
}

export function AddMemberForm({ plans }: AddMemberFormProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [startDate, setStartDate] = useState<string>(getTodayISO());
  const [agreedPrice, setAgreedPrice] = useState<string>(
    plans[0]?.price !== undefined ? String(plans[0].price) : ''
  );
  const [paymentAmount, setPaymentAmount] = useState<string>(
    plans[0]?.price !== undefined ? String(plans[0].price) : ''
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  // Find selected plan details
  const currentPlan = plans.find((p) => p.id === selectedPlanId);

  // Recalculate end date whenever start date or plan changes
  let calculatedEndDate = '';
  if (currentPlan && startDate) {
    try {
      const end = calculateEndDate(startDate, currentPlan.duration_value, currentPlan.duration_unit);
      calculatedEndDate = formatDate(end);
    } catch {
      calculatedEndDate = 'Invalid date';
    }
  }

  // Handle plan dropdown change
  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      const priceStr = String(plan.price);
      setAgreedPrice(priceStr);
      setPaymentAmount(priceStr);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const numAgreed = agreedPrice === '' ? 0 : parseFloat(agreedPrice);
    const numPay = paymentAmount === '' ? 0 : parseFloat(paymentAmount);

    const formData = new FormData(e.currentTarget);
    formData.set('plan_id', selectedPlanId);
    formData.set('start_date', startDate);
    formData.set('agreed_price', String(numAgreed));
    formData.set('payment_amount', String(numPay));
    formData.set('payment_method', paymentMethod);

    startTransition(async () => {
      const res = await createMemberAction(null, formData);
      if (res?.error) {
        setError(res.error);
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/members"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Members
      </Link>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {error && (
          <Alert variant="danger" title="Registration Error">
            {error}
          </Alert>
        )}

        {/* Section 1: Member Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle>Member Details</CardTitle>
            <CardDescription>Primary contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                id="full_name"
                name="full_name"
                required
                placeholder="e.g. Rahul Sharma"
                error={fieldErrors.full_name?.[0]}
              />
              <Input
                label="Mobile Number"
                id="mobile"
                name="mobile"
                type="tel"
                required
                placeholder="e.g. 9876543210"
                helperText="Must be 10 to 15 digits and unique per member"
                error={fieldErrors.mobile?.[0]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Email (Optional)"
                id="email"
                name="email"
                type="email"
                placeholder="member@gmail.com"
                error={fieldErrors.email?.[0]}
              />
              <Select
                label="Gender"
                id="gender"
                name="gender"
                error={fieldErrors.gender?.[0]}
                options={[
                  { value: '', label: 'Select gender...' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <Input
                label="Date of Birth"
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                error={fieldErrors.date_of_birth?.[0]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Emergency Contact (Optional)"
                id="emergency_contact"
                name="emergency_contact"
                placeholder="Parent/Spouse name & phone"
                error={fieldErrors.emergency_contact?.[0]}
              />
              <Input
                label="Address / Area (Optional)"
                id="address"
                name="address"
                placeholder="e.g. Sector 14, Main Road"
                error={fieldErrors.address?.[0]}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Health notes, trainer preferences, locker number..."
                className="flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              />
              {fieldErrors.notes?.[0] && (
                <p className="text-xs font-medium text-rose-600">{fieldErrors.notes[0]}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Membership Enrollment & Automatic Expiry */}
        <Card>
          <CardHeader>
            <CardTitle>Select Plan & Duration</CardTitle>
            <CardDescription>
              Expiry date and fees calculate automatically based on the chosen plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plans.length === 0 ? (
              <Alert variant="warning" title="No Plans Configured">
                Please{' '}
                <Link href="/plans/new" className="font-semibold underline">
                  create a membership plan
                </Link>{' '}
                first before registering members.
              </Alert>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="plan_select" className="block text-sm font-medium text-slate-700">
                      Membership Plan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="plan_select"
                      value={selectedPlanId}
                      onChange={(e) => handlePlanChange(e.target.value)}
                      className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.duration_value} {p.duration_unit}) — {formatCurrency(p.price)}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.plan_id?.[0] && (
                      <p className="text-xs font-medium text-rose-600">{fieldErrors.plan_id[0]}</p>
                    )}
                  </div>

                  <Input
                    label="Start Date"
                    id="start_date"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    error={fieldErrors.start_date?.[0]}
                  />
                </div>

                {/* Auto Calculated Summary Preview */}
                <div className="rounded-xl bg-sky-50 p-4 border border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-sky-800">
                        Calculated Expiry Date
                      </p>
                      <p className="text-lg font-bold text-sky-950">{calculatedEndDate}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-sky-700">Standard Plan Price:</span>
                    <p className="text-base font-bold text-sky-900">
                      {currentPlan ? formatCurrency(currentPlan.price) : '₹0'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <Input
                    label="Agreed Price (₹ INR)"
                    id="agreed_price"
                    type="text"
                    inputMode="decimal"
                    required
                    value={agreedPrice}
                    error={fieldErrors.agreed_price?.[0]}
                    onChange={(e) => {
                      const sanitized = sanitizeCurrencyInput(e.target.value);
                      setAgreedPrice(sanitized);
                      const numVal = sanitized === '' ? 0 : parseFloat(sanitized);
                      const numPay = paymentAmount === '' ? 0 : parseFloat(paymentAmount);
                      if (numPay > numVal) {
                        setPaymentAmount(sanitized);
                      }
                    }}
                    helperText={
                      currentPlan && agreedPrice !== '' && parseFloat(agreedPrice) < currentPlan.price
                        ? `Discount applied: ${formatCurrency(currentPlan.price - parseFloat(agreedPrice))}`
                        : undefined
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Initial Payment Recording */}
        <Card>
          <CardHeader>
            <CardTitle>Initial Payment Collection</CardTitle>
            <CardDescription>
              Record the first payment collected (full or partial advance).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Amount Paid Now (₹ INR)"
                id="payment_amount"
                type="text"
                inputMode="decimal"
                value={paymentAmount}
                error={fieldErrors.payment_amount?.[0]}
                onChange={(e) => {
                  const sanitized = sanitizeCurrencyInput(e.target.value);
                  setPaymentAmount(sanitized);
                }}
                helperText={`Outstanding Balance: ${formatCurrency(
                  Math.max(
                    0,
                    (agreedPrice === '' ? 0 : parseFloat(agreedPrice)) -
                      (paymentAmount === '' ? 0 : parseFloat(paymentAmount))
                  )
                )}`}
              />

              <Select
                label="Payment Method"
                id="payment_method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                error={fieldErrors.payment_method?.[0]}
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'upi', label: 'UPI (GPay / PhonePe / Paytm)' },
                  { value: 'card', label: 'Debit / Credit Card' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/members">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="lg" isLoading={isPending} disabled={plans.length === 0}>
            Register Member & Save Record
          </Button>
        </div>
      </form>
    </div>
  );
}
