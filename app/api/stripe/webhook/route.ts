// ============================================================
// File: app/api/stripe/webhook/route.ts
// Purpose: Handle incoming Stripe webhook events for payment processing
// Reason: Stripe sends events (payment success, refunds, etc.) to this endpoint
//         which we verify and process to update payment/invoice status
// ============================================================

import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/app/lib/supabase-server';

// ------------------------------------------------------------
// Initialize Stripe with secret key (lazily to avoid build-time errors)
// ------------------------------------------------------------
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  });
}

// ------------------------------------------------------------
// Webhook signing secret for verifying events are from Stripe
// ------------------------------------------------------------
function getWebhookSecret() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return process.env.STRIPE_WEBHOOK_SECRET;
}

// ------------------------------------------------------------
// POST Handler: Receive and process webhook events
// Purpose: Verify webhook signature and handle payment events
// Reason: Updates backend when payments succeed, fail, or are refunded
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = getWebhookSecret();
  
  try {
    // Get raw body (required for signature verification)
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

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

    await markPaymentVerified({
      metadata: session.metadata,
      email: session.customer_email || session.customer_details?.email,
    });
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
            latest_charge: paymentIntent.latest_charge,
          },
        }),
      }
    );

    console.log('[Webhook] Payment status updated');

    await markPaymentVerified({
      metadata: paymentIntent.metadata,
      email: paymentIntent.receipt_email,
    });
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

// ------------------------------------------------------------
// Utility: markPaymentVerified
// Purpose: Flip Supabase Auth metadata to verified and mirror plan data into
// the User table so login gating can trust payment state.
// ------------------------------------------------------------
async function markPaymentVerified(payload: { metadata?: Stripe.Metadata | null; email?: string | null | undefined }) {
  try {
    const admin = getSupabaseAdmin();
    const meta = payload?.metadata || {};
    const explicitId = (meta as any)?.supabase_user_id as string | undefined;
    const plan = (meta as any)?.plan as string | undefined;
    const billing_cycle = (meta as any)?.billing_cycle as string | undefined;
    const name = (meta as any)?.user_name as string | undefined;
    const claimedEmail = ((meta as any)?.user_email || payload?.email || '') as string;

    const userId = explicitId || (await findUserIdByEmail(admin, claimedEmail));
    const email = claimedEmail || (await findEmailById(admin, userId));

    if (!userId || !email) {
      console.warn('[Webhook] markPaymentVerified skipped (missing user)', { explicitId, claimedEmail });
      return;
    }

    const current = await admin.auth.admin.getUserById(userId).catch(() => null);
    const existingMeta = current?.data?.user?.user_metadata || {};
    const mergedMeta = {
      ...existingMeta,
      payment_status: 'verified',
      payment_verified: true,
      ...(plan ? { plan } : {}),
      ...(billing_cycle ? { billing_cycle } : {}),
    } as Record<string, any>;

    await admin.auth.admin.updateUserById(userId, { user_metadata: mergedMeta });

    const now = new Date().toISOString();
    await admin
      .from('User')
      .upsert({
        id: userId,
        email,
        name: name || (existingMeta as any)?.name || email,
        plan: plan || (existingMeta as any)?.plan || null,
        billingCycle: billing_cycle || (existingMeta as any)?.billing_cycle || null,
        updatedAt: now,
        createdAt: now,
      }, { onConflict: 'id' });

    console.log('[Webhook] markPaymentVerified applied', { userId, email, plan, billing_cycle });
  } catch (error) {
    console.error('[Webhook] markPaymentVerified failed', error);
  }
}

async function findUserIdByEmail(admin: ReturnType<typeof getSupabaseAdmin>, email?: string | null) {
  if (!email) return undefined;
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw error;
  const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return match?.id;
}

async function findEmailById(admin: ReturnType<typeof getSupabaseAdmin>, id?: string | null) {
  if (!id) return undefined;
  const res = await admin.auth.admin.getUserById(id).catch(() => null);
  return res?.data?.user?.email ?? undefined;
}
