// app/api/leads/route.ts
// Proxy to backend /leads using axios-style expectations

import { NextRequest } from 'next/server';
import { created, fail } from '@/app/lib/response';
import { logger } from '@/app/lib/logger';
import { captureRouteException } from '@/app/api/_helpers/sentry';
import { createLeadRecord } from '@/app/lib/supabase-store';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  let payload: any = {};
  if (contentType.includes('application/json')) {
    payload = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData();
    payload = Object.fromEntries(form.entries());
  }

  try {
    const lead = await createLeadRecord(payload);
    return created(lead);
  } catch (err: any) {
    captureRouteException(err, { route: 'leads' });
    logger.warn('leads.create.failed', { status: err?.status, message: err?.message });
    return fail(err?.body?.message || 'Failed to create lead', err?.status ?? 500);
  }
}
