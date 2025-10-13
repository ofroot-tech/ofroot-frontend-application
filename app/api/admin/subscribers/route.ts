// app/api/admin/subscribers/route.ts
// Proxy to Laravel admin subscribers endpoint, normalized shape.

import { NextRequest } from 'next/server';
import { api as serverApi } from '@/app/lib/api';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { fail, ok } from '@/app/lib/response';

export async function GET(_req: NextRequest) {
  const token = await getAuthTokenFromRequest();
  if (!token) return fail('Unauthorized', 401);

  try {
    const res = await serverApi.adminListSubscribers(token);
    return ok(res);
  } catch (err: any) {
    return fail(err?.body?.message || 'Failed to fetch subscribers', err?.status ?? 500);
  }
}
