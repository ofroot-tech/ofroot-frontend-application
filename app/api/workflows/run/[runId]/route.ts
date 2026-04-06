import { NextRequest } from 'next/server';
import { fail, ok } from '@/app/lib/response';
import { getWorkflowRunDetail } from '@/app/lib/workflows/store';
import { requireWorkflowUser, userTenant } from '@/app/api/workflows/_helpers';

export async function GET(req: NextRequest, context: { params: Promise<any> }) {
  const auth = await requireWorkflowUser(req);
  if (!auth.ok) return auth.response;
  const params = await context.params;
  const runId = Number(params.runId);
  if (!runId) return fail('Invalid run id', 422);
  const detail = await getWorkflowRunDetail(runId, userTenant(auth.user));
  if (!detail) return fail('Run not found', 404);
  return ok(detail);
}
