// app/api/auth/me/route.ts
// Proxy to backend /auth/me using cookie token

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/app/lib/logger';
import { fail, ok } from '@/app/lib/response';
import { captureRouteException } from '@/app/api/_helpers/sentry';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('auth.me.missing_supabase_env');
      return fail('Auth not configured', 500);
    }

    // Prefer Bearer token header, else fall back to auth cookie
    const authHeader = req.headers.get('authorization') || '';
    let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!token) {
      token = await getAuthTokenFromRequest();
    }
    if (!token) return fail('Unauthorized', 401);

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      logger.warn('auth.me.supabase_failed', { code: error?.code, message: error?.message });
      return fail('Unauthorized', 401);
    }

    return ok({
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name ?? null,
    });
  } catch (err: any) {
    captureRouteException(err, { route: 'auth/me' });
    logger.warn('auth.me.failed', { message: err?.message });
    return fail('Failed to fetch user', 500);
  }
}
