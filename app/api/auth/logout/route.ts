// app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/app/lib/api';
import { clearAuthCookie, getAuthTokenFromRequest } from '@/app/lib/cookies';
import { logger } from '@/app/lib/logger';
import { ok } from '@/app/lib/response';

export async function POST(req: NextRequest) {
  const token = await getAuthTokenFromRequest();
  if (token) {
    try {
      await api.logout(token);
    } catch (err: any) {
      logger.warn('auth.logout.backend_failed', { status: err?.status, message: err?.message });
    }
  }

  // If this is a browser form submit (document navigation), redirect to login
  const accept = req.headers.get('accept') || '';
  const url = new URL(req.url);
  const redirectTo = url.searchParams.get('redirect') || '/auth/login';

  if (accept.includes('text/html')) {
    const to = new URL(redirectTo, url);
    // add flash param for client-side toast
    to.searchParams.set('flash', 'signed-out');
    const res = NextResponse.redirect(to, 303);
    await clearAuthCookie(res);
    logger.info('auth.logout.redirect', { to: to.toString() });
    return res;
  }

  const res = ok({});
  await clearAuthCookie(res);
  logger.info('auth.logout.success');
  return res;
}
