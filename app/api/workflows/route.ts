import { NextRequest } from 'next/server';
import { fail, ok } from '@/app/lib/response';
import { createWorkflowDefinition, listWorkflowDefinitions } from '@/app/lib/workflows/store';
import type { CreateWorkflowInput } from '@/app/lib/workflows/types';
import { requireWorkflowUser, userTenant } from '@/app/api/workflows/_helpers';

export async function GET(req: NextRequest) {
  const auth = await requireWorkflowUser(req);
  if (!auth.ok) return auth.response;

  const items = await listWorkflowDefinitions(userTenant(auth.user));
  return ok({ items });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkflowUser(req);
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as Partial<CreateWorkflowInput>;
  const name = String(body.name || '').trim();
  const triggerType = String(body.trigger_type || '').trim();

  if (!name) return fail('name is required', 422);
  if (!['lead.created', 'blog.draft_generated', 'invoice.status_changed'].includes(triggerType)) {
    return fail('trigger_type is invalid', 422);
  }

  const created = await createWorkflowDefinition(
    {
      name,
      trigger_type: triggerType as CreateWorkflowInput['trigger_type'],
      trigger_config: body.trigger_config || {},
      conditions: Array.isArray(body.conditions) ? body.conditions : [],
      steps: Array.isArray(body.steps) ? body.steps : [],
      status: body.status || 'draft',
    },
    userTenant(auth.user),
    auth.user.id
  );

  return ok({ item: created });
}
