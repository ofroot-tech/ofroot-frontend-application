// app/api/leads/route.ts
// Proxy to backend /leads using axios-style expectations

import { NextRequest } from 'next/server';
import { api } from '@/app/lib/api';
import { created, fail } from '@/app/lib/response';
import { logger } from '@/app/lib/logger';

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
    const lead = await api.createLead(payload);
    return created(lead);
  } catch (err: any) {
    logger.warn('leads.create.failed', { status: err?.status, message: err?.message });
    return fail(err?.body?.message || 'Failed to create lead', err?.status ?? 500);
  }
}
