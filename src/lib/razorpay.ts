import crypto from 'crypto';
import { addMonths, format, parseISO, isAfter, startOfDay } from 'date-fns';
import { DATE_FORMAT } from '@/lib/constants';
import { getSaasPlan } from '@/lib/subscription-plans';
import { isLocalPlaceholderMode, readLocalDb, writeLocalDb } from '@/lib/local-db';
import { createClient } from '@/lib/supabase/server';
import type {
  SaasSubscriptionOrder,
  SaasSubscriptionPayment,
  SoftwareSubscription,
} from '@/types';

export const RAZORPAY_ENV = {
  keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
};

export function isRazorpayConfigured(): boolean {
  return Boolean(RAZORPAY_ENV.keyId && RAZORPAY_ENV.keySecret);
}

export function isRazorpayTestMode(): boolean {
  return !RAZORPAY_ENV.keyId || RAZORPAY_ENV.keyId.startsWith('rzp_test_');
}

export interface RazorpayOrderResult {
  orderId: string;
  amount: number; // in paise
  currency: string;
  keyId: string;
  isTestMode: boolean;
}

/**
 * Creates an authoritative order for a SaaS subscription plan.
 * Connects to Razorpay Orders API when credentials exist, or uses a verified test-mode order in dev.
 */
export async function createGatewayOrder(params: {
  gymId: string;
  planId: 'monthly' | 'annual';
  gymName: string;
  ownerEmail?: string;
  ownerPhone?: string;
}): Promise<RazorpayOrderResult> {
  const plan = getSaasPlan(params.planId);
  if (!plan) {
    throw new Error(`Invalid subscription plan: ${params.planId}`);
  }

  const receipt = `rcpt_${params.gymId.slice(0, 8)}_${Date.now()}`;
  let gatewayOrderId = '';

  if (isRazorpayConfigured()) {
    const authHeader = Buffer.from(`${RAZORPAY_ENV.keyId}:${RAZORPAY_ENV.keySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: plan.pricePaise,
        currency: 'INR',
        receipt,
        notes: {
          gym_id: params.gymId,
          gym_name: params.gymName,
          plan_id: plan.id,
          billing_interval: plan.billingInterval,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Razorpay order creation failed: ${errText}`);
    }

    const data = await res.json();
    gatewayOrderId = data.id;
  } else {
    // Sandbox / Test fallback order generator
    gatewayOrderId = `order_test_${crypto.randomBytes(8).toString('hex')}`;
  }

  // Persist order in DB
  const now = new Date().toISOString();
  const orderRecord: SaasSubscriptionOrder = {
    id: crypto.randomUUID(),
    gym_id: params.gymId,
    plan_id: plan.id,
    billing_interval: plan.billingInterval,
    amount: plan.pricePaise,
    currency: 'INR',
    gateway: 'razorpay',
    gateway_order_id: gatewayOrderId,
    status: 'created',
    created_at: now,
    updated_at: now,
  };

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    if (!db.saas_subscription_orders) db.saas_subscription_orders = [];
    db.saas_subscription_orders.push(orderRecord);
    writeLocalDb(db);
  } else {
    const supabase = await createClient();
    await supabase.from('saas_subscription_orders').insert(orderRecord);
  }

  return {
    orderId: gatewayOrderId,
    amount: plan.pricePaise,
    currency: 'INR',
    keyId: RAZORPAY_ENV.keyId || 'rzp_test_placeholder_key',
    isTestMode: isRazorpayTestMode(),
  };
}

/**
 * Verifies Razorpay checkout HMAC SHA-256 signature:
 * hmac_sha256(order_id + "|" + payment_id, secret) == signature
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = params.secret || RAZORPAY_ENV.keySecret;
  if (!secret) {
    // In local sandbox mode with simulated test order, allow verified test signature format
    if (params.orderId.startsWith('order_test_') && params.signature === `sig_test_${params.orderId}`) {
      return true;
    }
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf-8'),
      Buffer.from(params.signature, 'utf-8')
    );
  } catch {
    return false;
  }
}

/**
 * Verifies Razorpay Webhook HMAC SHA-256 signature
 */
export function verifyWebhookSignature(params: {
  rawBody: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = params.secret || RAZORPAY_ENV.webhookSecret;
  if (!secret || !params.signature) return false;

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(params.rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf-8'),
      Buffer.from(params.signature, 'utf-8')
    );
  } catch {
    return false;
  }
}

/**
 * Idempotently fulfills a verified payment for a gym workspace subscription.
 * Extends or activates the workspace software subscription and prevents duplicate extensions.
 */
export async function fulfillSubscriptionPayment(params: {
  gymId: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  amountPaise: number;
  paymentMethod?: string;
  signature?: string;
  webhookEventId?: string;
  payload?: Record<string, unknown>;
}): Promise<{
  success: boolean;
  message: string;
  alreadyProcessed?: boolean;
  newEndDate?: string;
}> {
  const now = new Date();
  const nowIso = now.toISOString();
  const today = startOfDay(now);

  if (isLocalPlaceholderMode()) {
    const db = readLocalDb();
    if (!db.saas_subscription_orders) db.saas_subscription_orders = [];
    if (!db.saas_subscription_payments) db.saas_subscription_payments = [];

    // 1. Idempotency Check: check by gatewayPaymentId or webhookEventId
    const existingPayment = db.saas_subscription_payments.find(
      (p) =>
        p.gateway_payment_id === params.gatewayPaymentId ||
        (params.webhookEventId && p.webhook_event_id === params.webhookEventId)
    );
    if (existingPayment) {
      return {
        success: true,
        message: 'Payment already processed and subscription granted.',
        alreadyProcessed: true,
      };
    }

    // 2. Locate matching order and verify tenant gym isolation
    const order = db.saas_subscription_orders.find(
      (o) => o.gateway_order_id === params.gatewayOrderId
    );
    if (order && order.gym_id !== params.gymId) {
      throw new Error('Tenant security violation: Order belongs to a different gym workspace.');
    }

    const plan = getSaasPlan(order?.plan_id || 'monthly');
    const intervalMonths = plan?.intervalMonths || 1;

    // 3. Update or find current software subscription
    let sub = db.software_subscriptions.find((s) => s.gym_id === params.gymId);
    let startDateStr = format(today, DATE_FORMAT.input);
    let newEndDate: Date;

    if (sub && sub.status === 'active' && sub.end_date) {
      const currentEnd = parseISO(sub.end_date);
      // If currently active and unexpired, append onto existing expiry
      if (isAfter(currentEnd, today)) {
        startDateStr = sub.start_date;
        newEndDate = addMonths(currentEnd, intervalMonths);
      } else {
        newEndDate = addMonths(today, intervalMonths);
      }
    } else {
      newEndDate = addMonths(today, intervalMonths);
    }

    const newEndDateStr = format(newEndDate, DATE_FORMAT.input);

    if (sub) {
      sub.status = 'active';
      sub.plan_name = plan?.name || 'Standard Monthly';
      sub.start_date = startDateStr;
      sub.end_date = newEndDateStr;
      sub.updated_at = nowIso;
    } else {
      sub = {
        id: crypto.randomUUID(),
        gym_id: params.gymId,
        plan_name: plan?.name || 'Standard Monthly',
        status: 'active',
        start_date: startDateStr,
        end_date: newEndDateStr,
        created_at: nowIso,
        updated_at: nowIso,
      };
      db.software_subscriptions.push(sub);
    }

    // 4. Mark order as paid
    if (order) {
      order.status = 'paid';
      order.updated_at = nowIso;
    }

    // 5. Insert payment audit record
    const paymentRecord: SaasSubscriptionPayment = {
      id: crypto.randomUUID(),
      order_id: order?.id || crypto.randomUUID(),
      gym_id: params.gymId,
      gateway_payment_id: params.gatewayPaymentId,
      amount: params.amountPaise,
      currency: 'INR',
      status: 'captured',
      method: params.paymentMethod || 'online',
      signature: params.signature,
      webhook_event_id: params.webhookEventId,
      payload: params.payload,
      created_at: nowIso,
    };
    db.saas_subscription_payments.push(paymentRecord);

    writeLocalDb(db);

    return {
      success: true,
      message: `Subscription successfully activated until ${newEndDateStr}.`,
      newEndDate: newEndDateStr,
    };
  }

  // Cloud Supabase Mode
  const supabase = await createClient();

  // 1. Idempotency check
  const { data: existingPayment } = await supabase
    .from('saas_subscription_payments')
    .select('id')
    .eq('gateway_payment_id', params.gatewayPaymentId)
    .single();

  if (existingPayment) {
    return {
      success: true,
      message: 'Payment already processed and subscription granted.',
      alreadyProcessed: true,
    };
  }

  // 2. Locate order & verify gym isolation
  const { data: order } = await supabase
    .from('saas_subscription_orders')
    .select('*')
    .eq('gateway_order_id', params.gatewayOrderId)
    .single();

  if (order && order.gym_id !== params.gymId) {
    throw new Error('Tenant security violation: Order belongs to a different gym workspace.');
  }

  const plan = getSaasPlan(order?.plan_id || 'monthly');
  const intervalMonths = plan?.intervalMonths || 1;

  // 3. Retrieve current subscription
  const { data: currentSub } = await supabase
    .from('software_subscriptions')
    .select('*')
    .eq('gym_id', params.gymId)
    .single();

  let startDateStr = format(today, DATE_FORMAT.input);
  let newEndDate: Date;

  if (currentSub && currentSub.status === 'active' && currentSub.end_date) {
    const currentEnd = parseISO(currentSub.end_date);
    if (isAfter(currentEnd, today)) {
      startDateStr = currentSub.start_date;
      newEndDate = addMonths(currentEnd, intervalMonths);
    } else {
      newEndDate = addMonths(today, intervalMonths);
    }
  } else {
    newEndDate = addMonths(today, intervalMonths);
  }

  const newEndDateStr = format(newEndDate, DATE_FORMAT.input);

  // Update subscription in Supabase
  if (currentSub) {
    await supabase
      .from('software_subscriptions')
      .update({
        status: 'active',
        plan_name: plan?.name || 'Standard Monthly',
        start_date: startDateStr,
        end_date: newEndDateStr,
        updated_at: nowIso,
      })
      .eq('id', currentSub.id);
  } else {
    await supabase.from('software_subscriptions').insert({
      gym_id: params.gymId,
      plan_name: plan?.name || 'Standard Monthly',
      status: 'active',
      start_date: startDateStr,
      end_date: newEndDateStr,
    });
  }

  if (order) {
    await supabase
      .from('saas_subscription_orders')
      .update({ status: 'paid', updated_at: nowIso })
      .eq('id', order.id);
  }

  await supabase.from('saas_subscription_payments').insert({
    order_id: order?.id,
    gym_id: params.gymId,
    gateway_payment_id: params.gatewayPaymentId,
    amount: params.amountPaise,
    currency: 'INR',
    status: 'captured',
    method: params.paymentMethod || 'online',
    signature: params.signature,
    webhook_event_id: params.webhookEventId,
    payload: params.payload,
  });

  return {
    success: true,
    message: `Subscription successfully activated until ${newEndDateStr}.`,
    newEndDate: newEndDateStr,
  };
}
