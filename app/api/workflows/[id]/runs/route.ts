import { NextRequest } from 'next/server';
import { fail, ok } from '@/app/lib/response';
import { listWorkflowRuns } from '@/app/lib/workflows/store';
import { requireWorkflowUser, userTenant } from '@/app/api/workflows/_helpers';

export async function GET(req: NextRequest, context: { params: Promise<any> }) {
  const auth = await requireWorkflowUser(req);
  if (!auth.ok) return auth.response;
  const params = await context.params;
  const id = Number(params.id);
  if (!id) return fail('Invalid workflow id', 422);
  const items = await listWorkflowRuns(id, userTenant(auth.user));
  return ok({ items });
}
