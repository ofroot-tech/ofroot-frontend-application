// app/api/auth/register/route.ts

import { NextRequest } from 'next/server';
import { api } from '@/app/lib/api';
import { setAuthCookie } from '@/app/lib/cookies';
import { logger } from '@/app/lib/logger';
import { created, fail } from '@/app/lib/response';
import { registerSchema } from '@/types/auth';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  let name = '', email = '', password = '';
  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({} as any));
    name = String(body.name || '');
    email = String(body.email || '');
    password = String(body.password || '');
  } else {
    const form = await req.formData();
    name = String(form.get('name') ?? '');
    email = String(form.get('email') ?? '');
    password = String(form.get('password') ?? '');
  }

  const parse = registerSchema.safeParse({ name, email, password });
  if (!parse.success) {
    logger.warn('auth.register.validation_failed', { issues: parse.error.issues });
    return fail('Name, email and password are required', 400);
  }

  try {
    const { token } = await api.register(name, email, password);
    const res = created({});
    setAuthCookie(res, token);
    logger.info('auth.register.success', { email });
    return res;
  } catch (err: any) {
    logger.warn('auth.register.failed', { email, err: err?.message, status: err?.status });
    return fail(err?.body?.message || 'Registration failed', err?.status ?? 500);
  }
}
