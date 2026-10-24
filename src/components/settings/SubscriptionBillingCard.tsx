'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/dates';
import { formatCurrency } from '@/lib/utils/currency';
import {
  createSubscriptionOrderAction,
  verifyAndFulfillSubscriptionAction,
  type SubscriptionBillingDetails,
} from '@/actions/subscription';
import { SAAS_CONFIG } from '@/lib/subscription-plans';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type { Gym } from '@/types';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface SubscriptionBillingCardProps {
  gym: Gym;
  billingDetails: SubscriptionBillingDetails;
}

export function SubscriptionBillingCard({
  gym,
  billingDetails,
}: SubscriptionBillingCardProps) {
  const { evaluated, availablePlans, payments, isTestMode } = billingDetails;
  const [selectedPlanId, setSelectedPlanId] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [testModalOrder, setTestModalOrder] = useState<{
    orderId: string;
    amountPaise: number;
    planId: 'monthly' | 'annual';
  } | null>(null);

  const isExpired = evaluated.effectiveStatus === 'expired';
  const isTrial = evaluated.effectiveStatus === 'trial';
  const isPastDue = evaluated.effectiveStatus === 'past_due';
  const isActive = evaluated.effectiveStatus === 'active';

  const selectedPlan = availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0];

  const handleInitiateCheckout = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await createSubscriptionOrderAction(selectedPlanId);
      if (!res.success || !res.order) {
        setErrorMsg(res.error || 'Could not initialize order.');
        setLoading(false);
        return;
      }

      const order = res.order;

      // If Razorpay SDK is loaded and we have live/configured keys
      if (typeof window !== 'undefined' && window.Razorpay && !order.orderId.startsWith('order_test_')) {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'BahiBar',
          description: `Subscription: ${selectedPlan.name}`,
          order_id: order.orderId,
          handler: async function (response: any) {
            const fulfillRes = await verifyAndFulfillSubscriptionAction({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId: selectedPlanId,
            });

            if (fulfillRes.success) {
              setSuccessMsg(fulfillRes.message || 'Subscription successfully activated!');
            } else {
              setErrorMsg(fulfillRes.error || 'Payment signature verification failed.');
            }
            setLoading(false);
          },
          prefill: {
            name: gym.owner_name,
            contact: gym.contact_number,
          },
          theme: {
            color: '#087FDB',
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Test Sandbox Mode Modal (works offline and without live Razorpay keys)
        setTestModalOrder({
          orderId: order.orderId,
          amountPaise: order.amount,
          planId: selectedPlanId,
        });
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment initiation failed.');
      setLoading(false);
    }
  };

  const handleSimulateTestPayment = async (scenario: 'success' | 'failure' | 'invalid_sig') => {
    if (!testModalOrder) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (scenario === 'failure') {
        setErrorMsg('Test scenario: Payment was canceled by user.');
        setTestModalOrder(null);
        setLoading(false);
        return;
      }

      const fakePaymentId = `pay_test_${Math.random().toString(36).substring(2, 10)}`;
      const signature =
        scenario === 'invalid_sig'
          ? 'invalid_forged_signature_123'
          : `sig_test_${testModalOrder.orderId}`;

      const res = await verifyAndFulfillSubscriptionAction({
        orderId: testModalOrder.orderId,
        paymentId: fakePaymentId,
        signature,
        planId: testModalOrder.planId,
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Subscription successfully activated!');
        setTestModalOrder(null);
      } else {
        setErrorMsg(res.error || 'Payment verification failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Test payment execution failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-sky-600" />
              <CardTitle>BahiBar Subscription & Billing</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Software license, 30-day trial status, and renewal management for{' '}
              <strong className="text-slate-800">{gym.name}</strong>
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {SAAS_CONFIG.isFreeOpenSourceMode ? (
              <Badge variant="success" className="gap-1.5 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Community Pilot Edition (100% Free)
              </Badge>
            ) : (
              <>
                {isTestMode && (
                  <Badge variant="warning" className="border-amber-300 bg-amber-50 text-amber-800 text-xs">
                    Test / Sandbox Mode
                  </Badge>
                )}

                {isTrial && (
                  <Badge variant="warning" className="gap-1.5 font-semibold">
                    <Clock className="h-3.5 w-3.5" />
                    Free Trial ({evaluated.daysLeft}d left)
                  </Badge>
                )}
                {isActive && (
                  <Badge variant="success" className="gap-1.5 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Active Subscription
                  </Badge>
                )}
                {isPastDue && (
                  <Badge variant="warning" className="gap-1.5 font-semibold bg-orange-100 text-orange-800 border-orange-300">
                    <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
                    Grace Period ({evaluated.graceDaysLeft}d left)
                  </Badge>
                )}
                {isExpired && (
                  <Badge variant="danger" className="gap-1.5 font-semibold">
                    <Lock className="h-3.5 w-3.5" />
                    Read-Only Mode
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Alert Banners */}
        {SAAS_CONFIG.isFreeOpenSourceMode ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>BahiBar Community Edition — Free Hosted Pilot Active</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
              This instance is running the free community pilot. All gym management capabilities
              (member tracking, plan customization, WhatsApp payment receipts, dues alerts, and full CSV/JSON
              backups) are completely unlocked with no paywall or trial expiration.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold">
              <a
                href="https://github.com/your-username/bahibar"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Source on GitHub
              </a>
              <span className="text-emerald-300">•</span>
              <a
                href="/export"
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 hover:underline"
              >
                Export Full Gym Backup
              </a>
            </div>
          </div>
        ) : (
          <>
            {isExpired && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-950">
                  <Lock className="h-5 w-5 text-rose-600 shrink-0" />
                  <span>30-Day Trial Ended — Read-Only Mode Active</span>
                </div>
                <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
                  Your existing gym members, payment logs, and plans remain 100% safe and exportable.
                  To enroll new members, record dues collections, or make plan adjustments, renew your
                  workspace subscription below.
                </p>
              </div>
            )}

            {isPastDue && (
              <div className="rounded-xl border border-orange-200 bg-orange-50/90 p-4 text-sm text-orange-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-orange-900">
                  <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                  <span>Renewal Grace Period Active ({evaluated.graceDaysLeft} days remaining)</span>
                </div>
                <p className="text-xs text-orange-800">
                  Your active subscription period has elapsed. Please renew to prevent your gym workspace
                  from transitioning into read-only mode.
                </p>
              </div>
            )}
          </>
        )}

        {/* Subscription Metadata Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
          <div>
            <span className="text-xs text-slate-500 uppercase font-medium">Current Plan</span>
            <p className="font-bold text-slate-900 capitalize mt-0.5">
              {evaluated.rawSubscription?.plan_name || 'Free Trial'}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase font-medium">Activated / Started On</span>
            <p className="font-semibold text-slate-900 mt-0.5">
              {evaluated.rawSubscription?.start_date
                ? formatDate(evaluated.rawSubscription.start_date)
                : '—'}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase font-medium">Valid Until</span>
            <p className="font-semibold text-slate-900 mt-0.5">
              {evaluated.rawSubscription?.end_date
                ? formatDate(evaluated.rawSubscription.end_date)
                : '—'}
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3 text-sm rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 text-sm rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
            {successMsg}
          </div>
        )}

        {/* Plan Selection Grid & Checkout */}
        {SAAS_CONFIG.isFreeOpenSourceMode ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Community Edition Entitlements</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>Unlimited Members:</strong> No cap on registered active or archived athletes.</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>Full Dues & Payment Tracking:</strong> Record cash, UPI, and bank collections.</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>Instant WhatsApp & PDF Slips:</strong> Share digital receipts with 1 click.</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>Automated Local Backups:</strong> JSON and CSV exports remain 100% in your hands.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80 text-xs text-slate-600">
              <span>Looking to report a bug or request a feature?</span>
              <a
                href="https://github.com/your-username/bahibar/issues"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Issue on GitHub
              </a>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Choose Billing Interval for {gym.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availablePlans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {plan.savingsPercent && (
                        <span className="absolute -top-3 right-4 px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-bold rounded-full shadow-2xs">
                          Save {plan.savingsPercent}% (2 Months Free)
                        </span>
                      )}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-base">{plan.name}</span>
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-2xl font-black text-slate-900">
                            ₹{plan.priceRupees.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-500">
                            /{plan.billingInterval === 'year' ? 'year' : 'month'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">{plan.description}</p>
                      </div>

                      <ul className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                        {plan.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing & Tax Transparency Notice */}
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <p className="font-medium text-slate-700">Billing Transparency & Entitlement Terms:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Provisional launch pricing: ₹249/mo or ₹2,499/yr inclusive of applicable taxes.</li>
                <li>Subscriptions are tied directly to this gym workspace (<code className="text-slate-800">{gym.name}</code>).</li>
                <li>No automatic recurring debits are charged without explicit confirmation; renewal is manual.</li>
                <li>Data remains exportable in CSV and JSON formats even if access expires.</li>
              </ul>
            </div>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                <span>Payment Gateway: </span>
                <strong className="text-slate-700">Razorpay (Cards, UPI, NetBanking)</strong>
              </div>
              <Button
                type="button"
                onClick={handleInitiateCheckout}
                disabled={loading}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 cursor-pointer"
              >
                {loading ? (
                  <span>Preparing checkout...</span>
                ) : isExpired ? (
                  <span className="flex items-center gap-2">
                    Renew {selectedPlan.name} (₹{selectedPlan.priceRupees})
                    <ArrowRight className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Extend / Upgrade to {selectedPlan.name} (₹{selectedPlan.priceRupees})
                    <Sparkles className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Test Simulator Modal */}
        {testModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-xs">
                    TEST
                  </div>
                  <h4 className="font-bold text-slate-900">Razorpay Test Simulator</h4>
                </div>
                <button
                  onClick={() => setTestModalOrder(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600">
                You are testing the subscription flow in development mode. Simulating this checkout
                verifies authoritative order creation, signature checking, and entitlement activation.
              </p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
                <div>Order ID: {testModalOrder.orderId}</div>
                <div>Amount: ₹{testModalOrder.amountPaise / 100} INR</div>
                <div>Workspace: {gym.name}</div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => handleSimulateTestPayment('success')}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  Simulate Successful Payment & Signature
                </Button>
                <Button
                  onClick={() => handleSimulateTestPayment('invalid_sig')}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-rose-300 text-rose-700 hover:bg-rose-50 cursor-pointer"
                >
                  Simulate Tampered / Invalid Signature (Should Reject)
                </Button>
                <Button
                  onClick={() => handleSimulateTestPayment('failure')}
                  disabled={loading}
                  variant="ghost"
                  className="w-full text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Simulate User Cancellation
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Payment History Audit Table */}
        {payments && payments.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-2">BahiBar Subscription Payments</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-medium border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Payment ID</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-medium">{formatDate(p.created_at)}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {p.gateway_payment_id}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        ₹{(p.amount / 100).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
