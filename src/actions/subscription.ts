'use server';

import { revalidatePath } from 'next/cache';
import { requireGymAccess, getUser } from '@/lib/supabase/auth-helpers';
import { getSaasPlan, SAAS_PLANS, type SaasPlan } from '@/lib/subscription-plans';
import { evaluateSubscription, type EvaluatedSubscription } from '@/lib/subscription';
import {
  createGatewayOrder,
  verifyPaymentSignature,
  fulfillSubscriptionPayment,
  isRazorpayTestMode,
  type RazorpayOrderResult,
} from '@/lib/razorpay';
import { isLocalPlaceholderMode, readLocalDb } from '@/lib/local-db';
import { createClient } from '@/lib/supabase/server';
import type {
  SaasSubscriptionOrder,
  SaasSubscriptionPayment,
  SoftwareSubscription,
} from '@/types';

export interface SubscriptionBillingDetails {
  evaluated: EvaluatedSubscription;
  availablePlans: SaasPlan[];
  orders: SaasSubscriptionOrder[];
  payments: SaasSubscriptionPayment[];
  isTestMode: boolean;
}

/**
 * Retrieves the gym's full subscription state and SaaS billing history.
 */
export async function getSubscriptionBillingDetailsAction(): Promise<SubscriptionBillingDetails> {
  const { gymId, role } = await requireGymAccess();

  let rawSub: SoftwareSubscription | null = null;
  let orders: SaasSubscriptionOrder[] = [];
  let payments: SaasSubscriptionPayment[] = [];

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    rawSub = db.software_subscriptions.find((s) => s.gym_id === gymId) || null;
    orders = (db.saas_subscription_orders || [])
      .filter((o) => o.gym_id === gymId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    payments = (db.saas_subscription_payments || [])
      .filter((p) => p.gym_id === gymId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    const supabase = await createClient();
    const [{ data: subData }, { data: ordersData }, { data: paymentsData }] = await Promise.all([
      supabase.from('software_subscriptions').select('*').eq('gym_id', gymId).single(),
      supabase
        .from('saas_subscription_orders')
        .select('*')
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false }),
      supabase
        .from('saas_subscription_payments')
        .select('*')
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false }),
    ]);

    rawSub = (subData as SoftwareSubscription) || null;
    orders = (ordersData as SaasSubscriptionOrder[]) || [];
    payments = (paymentsData as SaasSubscriptionPayment[]) || [];
  }

  const evaluated = evaluateSubscription(rawSub);

  return {
    evaluated,
    availablePlans: [SAAS_PLANS.monthly, SAAS_PLANS.annual],
    orders,
    payments,
    isTestMode: isRazorpayTestMode(),
  };
}

/**
 * Initiates a subscription renewal order for the gym workspace.
 * Only gym owners are authorized to create subscription orders.
 */
export async function createSubscriptionOrderAction(
  planId: 'monthly' | 'annual'
): Promise<{ success: boolean; order?: RazorpayOrderResult; error?: string }> {
  try {
    const { gymId, role } = await requireGymAccess();
    if (role !== 'owner') {
      return { success: false, error: 'Only gym owners can initiate subscription renewals.' };
    }

    const user = await getUser();
    const plan = getSaasPlan(planId);
    if (!plan) {
      return { success: false, error: 'Invalid plan selected.' };
    }

    let gymName = 'Gym Workspace';
    if (isLocalPlaceholderMode()) {
      const db = readLocalDb();
      const gym = db.gyms.find((g) => g.id === gymId);
      if (gym) gymName = gym.name;
    } else {
      const supabase = await createClient();
      const { data: gym } = await supabase.from('gyms').select('name').eq('id', gymId).single();
      if (gym) gymName = gym.name;
    }

    const order = await createGatewayOrder({
      gymId,
      planId,
      gymName,
      ownerEmail: user?.email,
    });

    return { success: true, order };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to initialize subscription checkout.' };
  }
}

/**
 * Verifies the client-side checkout signature and fulfills the subscription.
 */
export async function verifyAndFulfillSubscriptionAction(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  planId: 'monthly' | 'annual';
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { gymId, role } = await requireGymAccess();
    if (role !== 'owner') {
      return { success: false, error: 'Only gym owners can confirm subscription payments.' };
    }

    const isValid = verifyPaymentSignature({
      orderId: params.orderId,
      paymentId: params.paymentId,
      signature: params.signature,
    });

    if (!isValid) {
      return {
        success: false,
        error: 'Payment verification failed: Invalid transaction signature.',
      };
    }

    const plan = getSaasPlan(params.planId);
    const amountPaise = plan ? plan.pricePaise : 24900;

    const result = await fulfillSubscriptionPayment({
      gymId,
      gatewayOrderId: params.orderId,
      gatewayPaymentId: params.paymentId,
      amountPaise,
      signature: params.signature,
    });

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    revalidatePath('/members');
    revalidatePath('/plans');
    revalidatePath('/payments');

    return {
      success: true,
      message: result.message,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Payment fulfillment failed.' };
  }
}
