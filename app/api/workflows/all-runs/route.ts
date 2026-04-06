import { NextRequest } from 'next/server';
import { ok } from '@/app/lib/response';
import { listWorkflowRunsForTenant } from '@/app/lib/workflows/store';
import { requireWorkflowUser, userTenant } from '@/app/api/workflows/_helpers';

export async function GET(req: NextRequest) {
  const auth = await requireWorkflowUser(req);
  if (!auth.ok) return auth.response;
  const items = await listWorkflowRunsForTenant(userTenant(auth.user));
  return ok({ items });
}
