import { NextRequest } from 'next/server';
import { fail, ok } from '@/app/lib/response';
import { ingestWorkflowEvent } from '@/app/lib/workflows/engine';
import { requireInternalSignature, requireWorkflowUser, userTenant } from '@/app/api/workflows/_helpers';

export async function POST(req: NextRequest) {
  const auth = await requireWorkflowUser(req);
  if (!auth.ok) return auth.response;

  if (!requireInternalSignature(req)) return fail('Invalid workflow signature', 401);

  const body = (await req.json().catch(() => ({}))) as {
    event_type?: string;
    event_payload?: Record<string, unknown>;
    tenant_id?: number;
  };

  const eventType = String(body.event_type || '').trim();
  if (!['lead.created', 'blog.draft_generated', 'invoice.status_changed'].includes(eventType)) {
    return fail('event_type is invalid', 422);
  }

  const result = await ingestWorkflowEvent({
    tenantId: body.tenant_id ?? userTenant(auth.user),
    eventType: eventType as any,
    eventPayload: typeof body.event_payload === 'object' && body.event_payload ? body.event_payload : {},
  });

  return ok(result);
}
