// app/api/auth/login/route.ts
// Server action route to call backend login and set httpOnly cookie

import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/app/lib/api';
import { setAuthCookie } from '@/app/lib/cookies';
import { logger } from '@/app/lib/logger';
import { fail, ok } from '@/app/lib/response';
import { loginSchema } from '@/types/auth';
import { captureRouteException } from '@/app/api/_helpers/sentry';

export async function POST(req: NextRequest) {
  // Support both form-encoded and JSON payloads
  let email = '';
  let password = '';
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({} as any));
    email = String(body.email || '');
    password = String(body.password || '');
  } else {
    const form = await req.formData();
    email = String(form.get('email') ?? '');
    password = String(form.get('password') ?? '');
  }

  const parse = loginSchema.safeParse({ email, password });
  if (!parse.success) {
    logger.warn('auth.login.validation_failed', { issues: parse.error.issues });
    return fail('Email and password are required', 400);
  }

  try {
    const { token } = await api.login(email, password, 'next-web');
    const res = ok({});
    setAuthCookie(res, token);
    logger.info('auth.login.success', { email });
    return res;
  } catch (err: any) {
    captureRouteException(err, { route: 'auth/login' });
    logger.warn('auth.login.failed', { email, err: err?.message, status: err?.status });
    return fail(err?.body?.message || 'Login failed', err?.status ?? 500);
  }
}
