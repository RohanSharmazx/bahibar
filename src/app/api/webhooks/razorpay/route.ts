import { NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  fulfillSubscriptionPayment,
  isRazorpayConfigured,
} from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // If Razorpay is configured with a webhook secret, verify signature strictly
    if (isRazorpayConfigured() || process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature({
        rawBody,
        signature,
      });

      if (!isValid) {
        console.error('[Razorpay Webhook] Invalid webhook signature detected.');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const eventId = event.id;

    // Handle payment capture / order paid events
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const payment = event.payload?.payment?.entity;
      const order = event.payload?.order?.entity;

      const gatewayOrderId = payment?.order_id || order?.id;
      const gatewayPaymentId = payment?.id || `pay_${eventId}`;
      const amountPaise = payment?.amount || order?.amount;
      const method = payment?.method || 'upi';

      // Gym ID passed in notes during order creation
      const gymId =
        payment?.notes?.gym_id ||
        order?.notes?.gym_id;

      if (!gymId || !gatewayOrderId) {
        console.warn('[Razorpay Webhook] Missing gym_id or order_id in event payload notes.');
        return NextResponse.json({ received: true, ignored: 'Missing gym_id' }, { status: 200 });
      }

      const result = await fulfillSubscriptionPayment({
        gymId,
        gatewayOrderId,
        gatewayPaymentId,
        amountPaise,
        paymentMethod: method,
        signature,
        webhookEventId: eventId,
        payload: event,
      });

      return NextResponse.json({
        received: true,
        fulfilled: result.success,
        message: result.message,
      });
    }

    // Acknowledge other events (e.g. payment.failed, refund.created)
    return NextResponse.json({ received: true, event: eventType });
  } catch (error: any) {
    console.error('[Razorpay Webhook Error]', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
