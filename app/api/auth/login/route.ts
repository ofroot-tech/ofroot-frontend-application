// app/api/auth/login/route.ts
// Server action route to call backend login and set httpOnly cookie

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/app/lib/logger';
import { fail, ok } from '@/app/lib/response';
import { loginSchema } from '@/types/auth';
import { captureRouteException } from '@/app/api/_helpers/sentry';
import { setAuthCookie } from '@/app/lib/cookies';

export const dynamic = 'force-dynamic';

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('auth.login.missing_supabase_env');
      return fail('Auth not configured', 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logger.warn('auth.login.supabase_failed', { email, code: error.code, message: error.message });
      return fail(error.message || 'Login failed', 401);
    }

    const res = ok({
      user: data.user,
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
    });

    if (data.session?.access_token) {
      setAuthCookie(res as NextResponse, data.session.access_token, { maxAge: 60 * 60 }); // 1h to match Supabase default
    }

    logger.info('auth.login.supabase_success', { email });
    return res;
  } catch (err: any) {
    captureRouteException(err, { route: 'auth/login' });
    logger.warn('auth.login.failed', { email, err: err?.message });
    return fail(err?.message || 'Login failed', 500);
  }
}
