'use client';

import { useState, useTransition } from 'react';
import { recordPaymentAction } from '@/actions/payments';
import { renewMembershipAction } from '@/actions/memberships';
import { archiveMemberAction, restoreMemberAction } from '@/actions/members';
import { calculateEndDate, calculateRenewalStartDate, formatDate, getTodayISO } from '@/lib/utils/dates';
import { formatCurrency } from '@/lib/utils/currency';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { RefreshCw, IndianRupee, Archive, RotateCcw, Sparkles } from 'lucide-react';
import type { MembershipPlan, MemberMembership } from '@/types';

interface MemberActionsClientProps {
  memberId: string;
  isArchived: boolean;
  currentMembership: MemberMembership | null;
  outstandingBalance: number;
  availablePlans: MembershipPlan[];
}

export function MemberActionsClient({
  memberId,
  isArchived,
  currentMembership,
  outstandingBalance,
  availablePlans,
}: MemberActionsClientProps) {
  // Modal states
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Renewal form states
  const defaultRenewalPlan = availablePlans[0];
  const [renewPlanId, setRenewPlanId] = useState(defaultRenewalPlan?.id || '');
  
  // Calculate default renewal start date (if active -> starts day after current end_date; if expired -> today)
  const defaultRenewalStart = currentMembership
    ? calculateRenewalStartDate(currentMembership.end_date).toISOString().split('T')[0]
    : getTodayISO();

  const [renewStartDate, setRenewStartDate] = useState(defaultRenewalStart);
  const [renewAgreedPrice, setRenewAgreedPrice] = useState(defaultRenewalPlan?.price || 0);
  const [renewPaymentAmount, setRenewPaymentAmount] = useState(defaultRenewalPlan?.price || 0);
  const [renewPaymentMethod, setRenewPaymentMethod] = useState('cash');

  // Renewal calculated end date
  const selectedPlan = availablePlans.find((p) => p.id === renewPlanId);
  let renewalCalculatedEndDate = '';
  if (selectedPlan && renewStartDate) {
    try {
      const end = calculateEndDate(renewStartDate, selectedPlan.duration_value, selectedPlan.duration_unit);
      renewalCalculatedEndDate = formatDate(end);
    } catch {
      renewalCalculatedEndDate = '';
    }
  }

  // Payment form states
  const [payAmount, setPayAmount] = useState<number>(outstandingBalance);
  const [payMethod, setPayMethod] = useState<string>('cash');
  const [payDate, setPayDate] = useState<string>(getTodayISO());
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set('plan_id', renewPlanId);
    formData.set('start_date', renewStartDate);
    formData.set('agreed_price', String(renewAgreedPrice));
    formData.set('payment_amount', String(renewPaymentAmount));
    formData.set('payment_method', renewPaymentMethod);

    startTransition(async () => {
      const res = await renewMembershipAction(memberId, null, formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsRenewOpen(false);
      }
    });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentMembership) return;

    const formData = new FormData();
    formData.set('membership_id', currentMembership.id);
    formData.set('amount', String(payAmount));
    formData.set('payment_method', payMethod);
    formData.set('payment_date', payDate);
    formData.set('transaction_reference', payRef);
    formData.set('notes', payNotes);

    startTransition(async () => {
      const res = await recordPaymentAction(memberId, null, formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsPaymentOpen(false);
      }
    });
  };

  const handleArchiveToggle = () => {
    if (confirm(isArchived ? 'Restore this member?' : 'Archive this member from active directory?')) {
      startTransition(async () => {
        if (isArchived) {
          await restoreMemberAction(memberId);
        } else {
          await archiveMemberAction(memberId);
        }
      });
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => {
            setError(null);
            setIsRenewOpen(true);
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Renew Membership
        </Button>

        {outstandingBalance > 0 && (
          <Button
            variant="success"
            onClick={() => {
              setError(null);
              setPayAmount(outstandingBalance);
              setIsPaymentOpen(true);
            }}
            className="gap-2"
          >
            <IndianRupee className="h-4 w-4" />
            Record Payment ({formatCurrency(outstandingBalance)})
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={handleArchiveToggle}
          disabled={isPending}
          className="text-slate-500 hover:text-slate-900 gap-1.5"
        >
          {isArchived ? (
            <>
              <RotateCcw className="h-4 w-4" />
              Restore Member
            </>
          ) : (
            <>
              <Archive className="h-4 w-4 text-slate-400" />
              Archive
            </>
          )}
        </Button>
      </div>

      {/* Renewal Dialog Modal */}
      <Modal
        isOpen={isRenewOpen}
        onClose={() => setIsRenewOpen(false)}
        title="Renew Membership"
        description="Select plan and dates to continue gym membership without losing history"
      >
        {error && (
          <div className="mb-4">
            <Alert variant="danger" title="Renewal Error">
              {error}
            </Alert>
          </div>
        )}

        <form onSubmit={handleRenewSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Select Plan</label>
            <select
              value={renewPlanId}
              onChange={(e) => {
                setRenewPlanId(e.target.value);
                const p = availablePlans.find((plan) => plan.id === e.target.value);
                if (p) {
                  setRenewAgreedPrice(p.price);
                  setRenewPaymentAmount(p.price);
                }
              }}
              className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            >
              {availablePlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.duration_value} {p.duration_unit}) — {formatCurrency(p.price)}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Renewal Start Date"
            type="date"
            required
            value={renewStartDate}
            onChange={(e) => setRenewStartDate(e.target.value)}
            helperText="Auto-set to continue seamlessly from previous membership"
          />

          <div className="rounded-xl bg-sky-50 p-3.5 border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-sky-600" />
              <div>
                <p className="text-xs text-sky-700 font-medium">New Expiry Date</p>
                <p className="text-sm font-bold text-sky-950">{renewalCalculatedEndDate}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-sky-900">
              {selectedPlan ? formatCurrency(selectedPlan.price) : ''}
            </p>
          </div>

          <Input
            label="Agreed Price (₹ INR)"
            type="number"
            step="0.01"
            min="0"
            required
            value={renewAgreedPrice}
            onChange={(e) => setRenewAgreedPrice(Number(e.target.value))}
          />

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Input
              label="Payment Amount (₹)"
              type="number"
              step="0.01"
              min="0"
              max={renewAgreedPrice}
              value={renewPaymentAmount}
              onChange={(e) => setRenewPaymentAmount(Number(e.target.value))}
            />
            <Select
              label="Payment Method"
              value={renewPaymentMethod}
              onChange={(e) => setRenewPaymentMethod(e.target.value)}
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'upi', label: 'UPI' },
                { value: 'card', label: 'Card' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsRenewOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Confirm Renewal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Dialog Modal */}
      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="Record Fee Payment"
        description={`Record cash or UPI payment towards dues of ${formatCurrency(outstandingBalance)}`}
      >
        {error && (
          <div className="mb-4">
            <Alert variant="danger" title="Payment Error">
              {error}
            </Alert>
          </div>
        )}

        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <Input
            label="Amount Paid (₹ INR)"
            type="number"
            step="0.01"
            min="1"
            max={outstandingBalance}
            required
            value={payAmount}
            onChange={(e) => setPayAmount(Number(e.target.value))}
            helperText={`Maximum payable: ${formatCurrency(outstandingBalance)}`}
          />

          <Select
            label="Payment Method"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'upi', label: 'UPI (GPay / PhonePe / Paytm)' },
              { value: 'card', label: 'Card' },
              { value: 'other', label: 'Other' },
            ]}
          />

          <Input
            label="Payment Date"
            type="date"
            required
            value={payDate}
            onChange={(e) => setPayDate(e.target.value)}
          />

          <Input
            label="Transaction Reference / UPI ID (Optional)"
            placeholder="e.g. UPI Ref 3091823901"
            value={payRef}
            onChange={(e) => setPayRef(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Notes (Optional)</label>
            <textarea
              rows={2}
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              placeholder="e.g. Paid in front desk cash box"
              className="flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success" isLoading={isPending}>
              Save Payment
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
