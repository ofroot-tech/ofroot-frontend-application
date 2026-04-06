// app/api/leads/route.ts
// Persist inbound leads through the local store and emit a workflow event.

import { NextRequest } from 'next/server';
import { created, fail } from '@/app/lib/response';
import { logger } from '@/app/lib/logger';
import { captureRouteException } from '@/app/api/_helpers/sentry';
import { createLeadRecord } from '@/app/lib/supabase-store';
import { ingestWorkflowEvent } from '@/app/lib/workflows/engine';

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
    await ingestWorkflowEvent({
      tenantId: lead.tenant_id ?? null,
      eventType: 'lead.created',
      eventPayload: {
        id: lead.id,
        tenant_id: lead.tenant_id,
        email: lead.email,
        status: lead.status,
        source: lead.source,
        service: lead.service,
        zip: lead.zip,
      },
    }).catch(() => {});
    return created(lead);
  } catch (err: any) {
    captureRouteException(err, { route: 'leads' });
    logger.warn('leads.create.failed', { status: err?.status, message: err?.message });
    return fail(err?.body?.message || 'Failed to create lead', err?.status ?? 500);
  }
}
