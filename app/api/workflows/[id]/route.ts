import { NextRequest } from 'next/server';
import { fail, ok } from '@/app/lib/response';
import { deleteWorkflowDefinition, getWorkflowDefinition, updateWorkflowDefinition } from '@/app/lib/workflows/store';
import type { UpdateWorkflowInput } from '@/app/lib/workflows/types';
import { requireWorkflowUser, userTenant } from '@/app/api/workflows/_helpers';

function parseId(input: string) {
  const id = Number(input);
  return Number.isFinite(id) && id > 0 ? id : 0;
}

export async function GET(req: NextRequest, context: { params: Promise<any> }) {
  const auth = await requireWorkflowUser(req);
  if (!auth.ok) return auth.response;

  const params = await context.params;
  const id = parseId(params.id);
  if (!id) return fail('Invalid workflow id', 422);

  const item = await getWorkflowDefinition(id, userTenant(auth.user));
  if (!item) return fail('Workflow not found', 404);
  return ok({ item });
}

export async function PUT(req: NextRequest, context: { params: Promise<any> }) {
  const auth = await requireWorkflowUser(req);
  if (!auth.ok) return auth.response;

  const params = await context.params;
  const id = parseId(params.id);
  if (!id) return fail('Invalid workflow id', 422);

  const body = (await req.json().catch(() => ({}))) as UpdateWorkflowInput;
  const item = await updateWorkflowDefinition(id, body, userTenant(auth.user));
  if (!item) return fail('Workflow not found', 404);
  return ok({ item });
}

export async function DELETE(req: NextRequest, context: { params: Promise<any> }) {
  const auth = await requireWorkflowUser(req);
  if (!auth.ok) return auth.response;

  const params = await context.params;
  const id = parseId(params.id);
  if (!id) return fail('Invalid workflow id', 422);

  const deleted = await deleteWorkflowDefinition(id, userTenant(auth.user));
  if (!deleted) return fail('Workflow not found', 404);
  return ok({ deleted: true });
}
