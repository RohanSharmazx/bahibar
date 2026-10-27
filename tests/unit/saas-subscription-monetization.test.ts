import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { addDays, subDays, format, parseISO, startOfDay } from 'date-fns';
import { DATE_FORMAT } from '@/lib/constants';
import { SAAS_PLANS, getSaasPlan } from '@/lib/subscription-plans';
import { evaluateSubscription, assertActiveSubscription } from '@/lib/subscription';
import {
  verifyPaymentSignature,
  verifyWebhookSignature,
  fulfillSubscriptionPayment,
  createGatewayOrder,
} from '@/lib/razorpay';
import { readLocalDb, writeLocalDb } from '@/lib/local-db';
import type { SoftwareSubscription } from '@/types';

describe('SaaS Subscription & Trial Monetization Tests', () => {
  const dummyGymId = '11111111-2222-3333-4444-555555555555';
  const otherGymId = '99999999-8888-7777-6666-555555555555';
  const today = startOfDay(new Date());

  beforeEach(() => {
    // Reset local db fixture for deterministic tests
    const db = readLocalDb();
    db.software_subscriptions = db.software_subscriptions.filter(
      (s) => s.gym_id !== dummyGymId && s.gym_id !== otherGymId
    );
    if (!db.saas_subscription_orders) db.saas_subscription_orders = [];
    if (!db.saas_subscription_payments) db.saas_subscription_payments = [];
    db.saas_subscription_orders = db.saas_subscription_orders.filter(
      (o) => o.gym_id !== dummyGymId && o.gym_id !== otherGymId
    );
    db.saas_subscription_payments = db.saas_subscription_payments.filter(
      (p) => p.gym_id !== dummyGymId && p.gym_id !== otherGymId
    );
    writeLocalDb(db);
  });

  describe('1. Authoritative Trial Lifecycle & Expiration Logic', () => {
    it('evaluates active 30-day trial with positive days left', () => {
      const trialSub: SoftwareSubscription = {
        id: 'sub-1',
        gym_id: dummyGymId,
        plan_name: 'trial',
        status: 'trial',
        start_date: format(subDays(today, 10), DATE_FORMAT.input),
        end_date: format(addDays(today, 20), DATE_FORMAT.input),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = evaluateSubscription(trialSub, today);
      expect(result.effectiveStatus).toBe('trial');
      expect(result.isReadOnly).toBe(false);
      expect(result.canMutate).toBe(true);
      expect(result.daysLeft).toBe(20);
      expect(result.isExpiringSoon).toBe(false);
    });

    it('flags trial as expiring soon when <= 7 days remain', () => {
      const expiringSub: SoftwareSubscription = {
        id: 'sub-2',
        gym_id: dummyGymId,
        plan_name: 'trial',
        status: 'trial',
        start_date: format(subDays(today, 25), DATE_FORMAT.input),
        end_date: format(addDays(today, 5), DATE_FORMAT.input),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = evaluateSubscription(expiringSub, today);
      expect(result.effectiveStatus).toBe('trial');
      expect(result.isExpiringSoon).toBe(true);
      expect(result.daysLeft).toBe(5);
      expect(result.canMutate).toBe(true);
    });

    it('authoritatively locks trial into read-only mode once end_date has elapsed, even if status is not updated in DB', () => {
      // Simulate trial whose end_date was yesterday, but DB status field is still 'trial'
      const expiredSub: SoftwareSubscription = {
        id: 'sub-3',
        gym_id: dummyGymId,
        plan_name: 'trial',
        status: 'trial',
        start_date: format(subDays(today, 32), DATE_FORMAT.input),
        end_date: format(subDays(today, 2), DATE_FORMAT.input),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = evaluateSubscription(expiredSub, today);
      expect(result.effectiveStatus).toBe('expired');
      expect(result.isReadOnly).toBe(true);
      expect(result.canMutate).toBe(false);
      expect(result.daysLeft).toBe(0);

      // Assert that write operations throw an informative error
      expect(() => assertActiveSubscription(expiredSub, today)).toThrow(
        /Read-Only mode/i
      );
    });

    it('grants a 3-day grace period for past-due active paid subscriptions before locking', () => {
      const pastDueSub: SoftwareSubscription = {
        id: 'sub-4',
        gym_id: dummyGymId,
        plan_name: 'Standard Monthly',
        status: 'active',
        start_date: format(subDays(today, 32), DATE_FORMAT.input),
        end_date: format(subDays(today, 1), DATE_FORMAT.input), // 1 day overdue
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = evaluateSubscription(pastDueSub, today);
      expect(result.effectiveStatus).toBe('past_due');
      expect(result.inGracePeriod).toBe(true);
      expect(result.canMutate).toBe(true);
      expect(result.graceDaysLeft).toBeGreaterThanOrEqual(1);

      // After grace period (> 3 days overdue)
      const overdueSub: SoftwareSubscription = {
        ...pastDueSub,
        end_date: format(subDays(today, 5), DATE_FORMAT.input),
      };
      const overdueResult = evaluateSubscription(overdueSub, today);
      expect(overdueResult.effectiveStatus).toBe('expired');
      expect(overdueResult.isReadOnly).toBe(true);
      expect(overdueResult.canMutate).toBe(false);
    });
  });

  describe('2. Plan Pricing & Order Creation', () => {
    it('provides server-configured monthly and annual plans in paise and rupees', () => {
      const monthly = getSaasPlan('monthly');
      expect(monthly).toBeDefined();
      expect(monthly?.priceRupees).toBe(249);
      expect(monthly?.pricePaise).toBe(24900);
      expect(monthly?.billingInterval).toBe('month');

      const annual = getSaasPlan('annual');
      expect(annual).toBeDefined();
      expect(annual?.priceRupees).toBe(2499);
      expect(annual?.pricePaise).toBe(249900);
      expect(annual?.billingInterval).toBe('year');
      expect(annual?.savingsPercent).toBe(17);
    });

    it('creates an order tied strictly to the requesting gym workspace', async () => {
      const orderResult = await createGatewayOrder({
        gymId: dummyGymId,
        planId: 'monthly',
        gymName: 'Alpha Fitness',
        ownerEmail: 'alpha@gym.com',
      });

      expect(orderResult.orderId).toBeDefined();
      expect(orderResult.amount).toBe(24900);
      expect(orderResult.currency).toBe('INR');

      const db = readLocalDb();
      const savedOrder = db.saas_subscription_orders?.find(
        (o) => o.gateway_order_id === orderResult.orderId
      );
      expect(savedOrder).toBeDefined();
      expect(savedOrder?.gym_id).toBe(dummyGymId);
      expect(savedOrder?.status).toBe('created');
    });
  });

  describe('3. Signature Verification & Cryptographic Security', () => {
    const testSecret = 'secret_test_key_1234567890';
    const orderId = 'order_DA28F9B100';
    const paymentId = 'pay_9876543210';

    it('verifies valid HMAC SHA-256 payment signature', () => {
      const validSignature = crypto
        .createHmac('sha256', testSecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = verifyPaymentSignature({
        orderId,
        paymentId,
        signature: validSignature,
        secret: testSecret,
      });

      expect(isValid).toBe(true);
    });

    it('rejects tampered or forged signatures', () => {
      const forgedSignature = 'forged_signature_1234567890abcdef';

      const isValid = verifyPaymentSignature({
        orderId,
        paymentId,
        signature: forgedSignature,
        secret: testSecret,
      });

      expect(isValid).toBe(false);
    });

    it('verifies valid webhook signature and rejects forged webhook payloads', () => {
      const webhookSecret = 'whsec_999888777';
      const payload = JSON.stringify({ event: 'payment.captured', id: 'evt_123' });

      const validWebhookSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      expect(
        verifyWebhookSignature({
          rawBody: payload,
          signature: validWebhookSig,
          secret: webhookSecret,
        })
      ).toBe(true);

      expect(
        verifyWebhookSignature({
          rawBody: payload,
          signature: 'wrong_sig',
          secret: webhookSecret,
        })
      ).toBe(false);
    });
  });

  describe('4. Entitlement Fulfillment, Idempotency, and Tenant Isolation', () => {
    it('fulfills payment, activates active subscription, and sets end date to +1 month', async () => {
      const order = await createGatewayOrder({
        gymId: dummyGymId,
        planId: 'monthly',
        gymName: 'Alpha Fitness',
      });

      const fulfillRes = await fulfillSubscriptionPayment({
        gymId: dummyGymId,
        gatewayOrderId: order.orderId,
        gatewayPaymentId: 'pay_test_001',
        amountPaise: 24900,
        paymentMethod: 'upi',
      });

      expect(fulfillRes.success).toBe(true);

      const db = readLocalDb();
      const sub = db.software_subscriptions.find((s) => s.gym_id === dummyGymId);
      expect(sub).toBeDefined();
      expect(sub?.status).toBe('active');
      expect(sub?.plan_name).toBe('Standard Monthly');

      // Check payment record saved
      const payment = db.saas_subscription_payments?.find(
        (p) => p.gateway_payment_id === 'pay_test_001'
      );
      expect(payment).toBeDefined();
      expect(payment?.gym_id).toBe(dummyGymId);
      expect(payment?.amount).toBe(24900);
    });

    it('processes duplicate webhook notifications idempotently without duplicate extensions', async () => {
      const order = await createGatewayOrder({
        gymId: dummyGymId,
        planId: 'monthly',
        gymName: 'Alpha Fitness',
      });

      // First fulfillment
      const firstRes = await fulfillSubscriptionPayment({
        gymId: dummyGymId,
        gatewayOrderId: order.orderId,
        gatewayPaymentId: 'pay_duplicate_test',
        amountPaise: 24900,
        webhookEventId: 'evt_duplicate_001',
      });
      expect(firstRes.success).toBe(true);
      expect(firstRes.alreadyProcessed).toBeFalsy();

      const dbAfterFirst = readLocalDb();
      const firstEndDate = dbAfterFirst.software_subscriptions.find(
        (s) => s.gym_id === dummyGymId
      )?.end_date;

      // Duplicate delivery with same payment ID / event ID
      const secondRes = await fulfillSubscriptionPayment({
        gymId: dummyGymId,
        gatewayOrderId: order.orderId,
        gatewayPaymentId: 'pay_duplicate_test',
        amountPaise: 24900,
        webhookEventId: 'evt_duplicate_001',
      });
      expect(secondRes.success).toBe(true);
      expect(secondRes.alreadyProcessed).toBe(true);

      const dbAfterSecond = readLocalDb();
      const secondEndDate = dbAfterSecond.software_subscriptions.find(
        (s) => s.gym_id === dummyGymId
      )?.end_date;

      // Expiration date must NOT have been moved forward a second time
      expect(secondEndDate).toBe(firstEndDate);
    });

    it('rejects cross-tenant order fulfillment (gym A cannot fulfill gym B order)', async () => {
      // Order created for gym A
      const orderGymA = await createGatewayOrder({
        gymId: dummyGymId,
        planId: 'annual',
        gymName: 'Alpha Fitness',
      });

      // Attacker tries to fulfill orderGymA for gym B
      await expect(
        fulfillSubscriptionPayment({
          gymId: otherGymId, // Different gym!
          gatewayOrderId: orderGymA.orderId,
          gatewayPaymentId: 'pay_cross_tenant_hacker',
          amountPaise: 249900,
        })
      ).rejects.toThrow(/Tenant security violation/i);

      // Verify gym B's subscription was NOT activated
      const db = readLocalDb();
      const subGymB = db.software_subscriptions.find((s) => s.gym_id === otherGymId);
      expect(subGymB).toBeUndefined();
    });

    it('appends duration smoothly when renewing an active unexpired subscription', async () => {
      // Setup existing active subscription with 15 days remaining
      const existingEnd = addDays(today, 15);
      const db = readLocalDb();
      db.software_subscriptions.push({
        id: 'existing-sub',
        gym_id: dummyGymId,
        plan_name: 'Standard Monthly',
        status: 'active',
        start_date: format(subDays(today, 15), DATE_FORMAT.input),
        end_date: format(existingEnd, DATE_FORMAT.input),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      writeLocalDb(db);

      const order = await createGatewayOrder({
        gymId: dummyGymId,
        planId: 'monthly', // +1 month
        gymName: 'Alpha Fitness',
      });

      await fulfillSubscriptionPayment({
        gymId: dummyGymId,
        gatewayOrderId: order.orderId,
        gatewayPaymentId: 'pay_renewal_extend',
        amountPaise: 24900,
      });

      const updatedDb = readLocalDb();
      const updatedSub = updatedDb.software_subscriptions.find((s) => s.gym_id === dummyGymId);
      expect(updatedSub?.status).toBe('active');

      // The new end date should be existingEnd + 1 month (approx 45 days from today), NOT today + 1 month (30 days)
      const expectedEnd = format(addDays(existingEnd, 30), DATE_FORMAT.input); // roughly 1 month ahead
      expect(parseISO(updatedSub!.end_date).getTime()).toBeGreaterThan(
        addDays(today, 40).getTime()
      );
    });
  });
});
