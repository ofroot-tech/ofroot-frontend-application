// app/api/auth/register/route.ts

import { NextRequest } from 'next/server';
import { api } from '@/app/lib/api';
import { setAuthCookie } from '@/app/lib/cookies';
import { logger } from '@/app/lib/logger';
import { created, fail } from '@/app/lib/response';
import { registerSchema } from '@/types/auth';

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
    const { token } = await api.register(name, email, password, { plan, billingCycle, coupon });
    const res = created({});
    setAuthCookie(res, token);
    logger.info('auth.register.success', { email, plan, billingCycle });
    return res;
  } catch (err: any) {
    logger.warn('auth.register.failed', { email, err: err?.message, status: err?.status });
    return fail(err?.body?.message || 'Registration failed', err?.status ?? 500);
  }
}
