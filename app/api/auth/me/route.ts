// app/api/auth/me/route.ts
// Proxy to backend /auth/me using cookie token

import { NextRequest } from 'next/server';
import { api } from '@/app/lib/api';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { logger } from '@/app/lib/logger';
import { fail, ok } from '@/app/lib/response';

export async function GET(_req: NextRequest) {
  const token = await getAuthTokenFromRequest();
  if (!token) return fail('Unauthorized', 401);

  try {
    const raw = await api.me(token);
    const user = (raw as any)?.data ?? raw; // flatten Laravel { data: user } shape if present
    return ok(user);
  } catch (err: any) {
    logger.warn('auth.me.failed', { status: err?.status, message: err?.message });
    return fail(err?.body?.message || 'Failed to fetch user', err?.status ?? 500);
  }
}
