// app/api/auth/me/route.ts
// Proxy to backend /auth/me using cookie token

import { NextRequest } from 'next/server';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { logger } from '@/app/lib/logger';
import { fail, ok } from '@/app/lib/response';
import { captureRouteException } from '@/app/api/_helpers/sentry';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';

export async function GET(_req: NextRequest) {
  const token = await getAuthTokenFromRequest();
  if (!token) return fail('Unauthorized', 401);

  try {
    const user = await getUserFromSessionToken(token);
    if (!user) return fail('Unauthorized', 401);
    return ok(user);
  } catch (err: any) {
    captureRouteException(err, { route: 'auth/me' });
    logger.warn('auth.me.failed', { status: err?.status, message: err?.message });
    return fail(err?.body?.message || 'Failed to fetch user', err?.status ?? 500);
  }
}
