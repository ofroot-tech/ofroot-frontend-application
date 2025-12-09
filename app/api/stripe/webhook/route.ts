// ============================================================
// File: app/api/stripe/webhook/route.ts
// Purpose: Handle incoming Stripe webhook events for payment processing
// Reason: Stripe sends events (payment success, refunds, etc.) to this endpoint
//         which we verify and process to update payment/invoice status
// ============================================================

import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// ------------------------------------------------------------
// Initialize Stripe with secret key
// ------------------------------------------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// ------------------------------------------------------------
// Webhook signing secret for verifying events are from Stripe
// ------------------------------------------------------------
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ------------------------------------------------------------
// POST Handler: Receive and process webhook events
// Purpose: Verify webhook signature and handle payment events
// Reason: Updates backend when payments succeed, fail, or are refunded
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    // Get raw body (required for signature verification)
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing stripe-signature header');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify the event came from Stripe
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('[Stripe Webhook] Event received:', event.type, event.id);

    // Process event based on type
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    // Log webhook event to backend
    await logWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------
// Handler: Checkout Session Completed
// Purpose: Customer completed payment via Stripe Checkout
// Reason: Mark invoice as paid, record payment in backend
// ------------------------------------------------------------
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('[Webhook] Checkout completed:', session.id);

  const invoiceExternalId = session.metadata?.invoice_external_id;
  if (!invoiceExternalId) {
    console.error('[Webhook] Missing invoice_external_id in session metadata');
    return;
  }

  try {
    // Call backend to record payment and update invoice status
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        invoice_external_id: invoiceExternalId,
        amount: session.amount_total! / 100, // Convert cents to dollars
        currency: session.currency,
        payment_method: 'stripe',
        stripe_payment_intent_id: session.payment_intent,
        stripe_checkout_session_id: session.id,
        status: 'completed',
        metadata: {
          customer_email: session.customer_email,
          customer_name: session.customer_details?.name,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Webhook] Failed to record payment:', error);
    } else {
      console.log('[Webhook] Payment recorded successfully');
    }
  } catch (error) {
    console.error('[Webhook] Error calling backend API:', error);
  }
}

// ------------------------------------------------------------
// Handler: Payment Intent Succeeded
// Purpose: Payment was successfully processed
// Reason: Update payment record status
// ------------------------------------------------------------
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('[Webhook] Payment succeeded:', paymentIntent.id);

  try {
    // Update payment status in backend
    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/stripe/${paymentIntent.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          metadata: {
            amount_received: paymentIntent.amount_received,
            charges: paymentIntent.charges.data.map((c) => c.id),
          },
        }),
      }
    );

    console.log('[Webhook] Payment status updated');
  } catch (error) {
    console.error('[Webhook] Error updating payment status:', error);
  }
}

// ------------------------------------------------------------
// Handler: Payment Intent Failed
// Purpose: Payment failed (card declined, etc.)
// Reason: Update payment status and notify customer
// ------------------------------------------------------------
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('[Webhook] Payment failed:', paymentIntent.id);

  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/stripe/${paymentIntent.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          status: 'failed',
          metadata: {
            last_payment_error: paymentIntent.last_payment_error?.message,
          },
        }),
      }
    );

    console.log('[Webhook] Payment failure recorded');
  } catch (error) {
    console.error('[Webhook] Error recording payment failure:', error);
  }
}

// ------------------------------------------------------------
// Handler: Charge Refunded
// Purpose: A charge was refunded (full or partial)
// Reason: Record refund and update invoice balance
// ------------------------------------------------------------
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('[Webhook] Charge refunded:', charge.id);

  const refunds = charge.refunds?.data || [];
  if (refunds.length === 0) return;

  try {
    // Record each refund in backend
    for (const refund of refunds) {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          payment_stripe_id: charge.payment_intent,
          amount: refund.amount / 100,
          currency: refund.currency,
          stripe_refund_id: refund.id,
          reason: refund.reason || 'requested_by_customer',
          status: refund.status,
          metadata: {
            charge_id: charge.id,
            created: refund.created,
          },
        }),
      });
    }

    console.log('[Webhook] Refunds recorded');
  } catch (error) {
    console.error('[Webhook] Error recording refunds:', error);
  }
}

// ------------------------------------------------------------
// Utility: Log webhook event to backend
// Purpose: Store webhook events for audit trail
// Reason: Helps debug payment issues and track webhook delivery
// ------------------------------------------------------------
async function logWebhookEvent(event: Stripe.Event) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stripe-webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        stripe_event_id: event.id,
        event_type: event.type,
        payload: event,
        processed_at: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('[Webhook] Failed to log event:', error);
  }
}
