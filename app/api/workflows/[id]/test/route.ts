import { NextRequest } from 'next/server';
import { fail, ok } from '@/app/lib/response';
import { getWorkflowDefinition } from '@/app/lib/workflows/store';
import { ingestWorkflowEvent } from '@/app/lib/workflows/engine';
import { requireWorkflowUser, userTenant } from '@/app/api/workflows/_helpers';

export async function POST(req: NextRequest, context: { params: Promise<any> }) {
  const auth = await requireWorkflowUser(req);
  if (!auth.ok) return auth.response;

  const params = await context.params;
  const id = Number(params.id);
  if (!id) return fail('Invalid workflow id', 422);

  const workflow = await getWorkflowDefinition(id, userTenant(auth.user));
  if (!workflow) return fail('Workflow not found', 404);

  const body = (await req.json().catch(() => ({}))) as { event_payload?: Record<string, unknown> };
  const eventPayload = body?.event_payload && typeof body.event_payload === 'object' ? body.event_payload : {};

  const result = await ingestWorkflowEvent({
    tenantId: userTenant(auth.user),
    eventType: workflow.trigger_type,
    eventPayload,
  });

  return ok(result);
}
