// ---------------------------------------------------------------------------
// POST /api/subscribe/checkout
//
// Purpose: Start a paid subscription checkout and create a Supabase Auth user
// with a pending payment flag. Payment confirmation is handled via the Stripe
// webhook which flips `payment_status` to `verified` for the matching user.
//
// Why now: We are moving away from the $1 trial to charge the full plan price
// up front and gate sign-in until payment is verified (except for the operator
// email). This endpoint is the single entry for the Subscribe form.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { logger } from '@/app/lib/logger';
import { fail, ok } from '@/app/lib/response';
import { getSupabaseAdmin } from '@/app/lib/supabase-server';
import { registerSchema } from '@/types/auth';

const stripeVersion = '2025-11-17.clover';

function requireStripeSecret(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return key;
}

function resolvePriceId(plan: 'pro' | 'business', billing: 'monthly' | 'yearly'): string {
  const map: Record<string, string | undefined> = {
    pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
    business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    business_yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY,
  };
  const price = map[`${plan}_${billing}`];
  if (!price) throw new Error(`Missing Stripe price ID for ${plan} ${billing}`);
  return price;
}

async function findUserByEmail(admin: ReturnType<typeof getSupabaseAdmin>, email: string) {
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw error;
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

async function ensureSupabaseUser(params: {
  email: string;
  password: string;
  name: string;
  plan: 'pro' | 'business';
  billingCycle: 'monthly' | 'yearly';
}) {
  const admin = getSupabaseAdmin();
  const metadata = {
    name: params.name,
    plan: params.plan,
    billing_cycle: params.billingCycle,
    payment_status: 'pending',
    payment_verified: false,
  } as const;

  const { data, error } = await admin.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (!error && data?.user) return data.user;

  const alreadyExists = error?.message?.toLowerCase().includes('already') || error?.status === 422;
  if (!alreadyExists) throw error ?? new Error('Failed to create auth user');

  const existing = await findUserByEmail(admin, params.email);
  if (!existing?.id) throw new Error('User exists but could not be located');

  // Refresh metadata to carry the latest plan + pending payment flag.
  await admin.auth.admin.updateUserById(existing.id, { user_metadata: { ...existing.user_metadata, ...metadata } });
  return existing;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let name = '', email = '', password = '', plan: 'pro' | 'business' = 'pro', billingCycle: 'monthly' | 'yearly' = 'monthly';
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({} as any));
      name = String(body.name || '');
      email = String(body.email || '');
      password = String(body.password || '');
      if (body.plan === 'business') plan = 'business';
      if (body.billingCycle === 'yearly') billingCycle = 'yearly';
    } else {
      const form = await req.formData();
      name = String(form.get('name') ?? '');
      email = String(form.get('email') ?? '');
      password = String(form.get('password') ?? '');
      const planField = String(form.get('plan') ?? '');
      const billField = String(form.get('billingCycle') ?? '');
      if (planField === 'business') plan = 'business';
      if (billField === 'yearly') billingCycle = 'yearly';
    }

    const baseParse = registerSchema.safeParse({ name, email, password });
    if (!baseParse.success) {
      logger.warn('subscribe.checkout.validation_failed', { issues: baseParse.error.issues });
      return fail('Name, email, and password are required', 400);
    }

    const priceId = resolvePriceId(plan, billingCycle);
    const supabaseUser = await ensureSupabaseUser({ email, password, name, plan, billingCycle });

    const origin = req.nextUrl?.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const stripe = new Stripe(requireStripeSecret(), { apiVersion: stripeVersion });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      allow_promotion_codes: false,
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/auth/login?flash=subscription-success`,
      cancel_url: `${origin}/subscribe?canceled=1`,
      metadata: {
        supabase_user_id: supabaseUser.id,
        user_email: email,
        user_name: name,
        plan,
        billing_cycle: billingCycle,
      },
    });

    logger.info('subscribe.checkout.started', { email, plan, billingCycle, session: session.id });
    return ok({ url: session.url });
  } catch (err: any) {
    logger.error('subscribe.checkout.failed', { message: err?.message });
    return NextResponse.json({ error: { message: err?.message || 'Checkout failed' } }, { status: 500 });
  }
}
