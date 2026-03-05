// app/api/auth/register/route.ts

import { NextRequest } from 'next/server';
import { setAuthCookie } from '@/app/lib/cookies';
import { logger } from '@/app/lib/logger';
import { created, fail } from '@/app/lib/response';
import { registerSchema } from '@/types/auth';
import {
  createSessionForUser,
  isSupabaseStoreConfigured,
  registerUser,
} from '@/app/lib/supabase-store';
import {
  AUTOMATION_ONBOARDING_COOKIE,
  decodeAutomationOnboardingSession,
} from '@/app/lib/automation-onboarding';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  let name = '', email = '', password = '', plan: 'free' | 'pro' | 'business' | undefined = undefined, billingCycle: 'monthly' | 'yearly' | undefined = undefined, coupon: string | undefined = undefined;
  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({} as any));
    name = String(body.name || '');
    email = String(body.email || '');
    password = String(body.password || '');
    if (body.plan) plan = String(body.plan) as any;
    if (body.billingCycle) billingCycle = String(body.billingCycle) as any;
    if (body.coupon) coupon = String(body.coupon);
  } else {
    const form = await req.formData();
    name = String(form.get('name') ?? '');
    email = String(form.get('email') ?? '');
    password = String(form.get('password') ?? '');
    const p = form.get('plan');
    const b = form.get('billingCycle');
    const c = form.get('coupon');
    if (p) plan = String(p) as any;
    if (b) billingCycle = String(b) as any;
    if (c) coupon = String(c);
  }

  const parse = registerSchema.safeParse({ name, email, password });
  if (!parse.success) {
    logger.warn('auth.register.validation_failed', { issues: parse.error.issues });
    return fail('Name, email and password are required', 400);
  }

  try {
    if (!isSupabaseStoreConfigured()) {
      return fail('Database is not configured. Please contact support.', 503);
    }
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const ownerEmail = String(process.env.COMPANY_OWNER_EMAIL || 'dimitri.mcdaniel@gmail.com')
      .trim()
      .toLowerCase();
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    const onboardingRaw = req.cookies.get(AUTOMATION_ONBOARDING_COOKIE)?.value;
    const onboarding = decodeAutomationOnboardingSession(onboardingRaw);
    const isOnboardingSignup = onboarding?.business_email?.trim().toLowerCase() === normalizedEmail;

    const roleSlug = normalizedEmail === ownerEmail
      ? 'owner'
      : adminEmails.includes(normalizedEmail)
        ? 'admin'
        : isOnboardingSignup
          ? 'client'
          : 'client';

    const user = await registerUser({ name, email, password, plan, billingCycle, roleSlug });
    const token = await createSessionForUser(user.id);
    const res = created({});
    setAuthCookie(res, token);
    logger.info('auth.register.success', { email, plan, billingCycle, role: roleSlug, isOnboardingSignup });
    return res;
  } catch (err: any) {
    logger.warn('auth.register.failed', { email, err: err?.message, status: err?.status });
    return fail(err?.message || err?.body?.message || 'Registration failed', err?.status ?? 500);
  }
}
