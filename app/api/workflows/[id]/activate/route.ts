import { NextRequest } from 'next/server';
import { fail, ok } from '@/app/lib/response';
import { setWorkflowStatus } from '@/app/lib/workflows/store';
import { requireWorkflowUser, userTenant } from '@/app/api/workflows/_helpers';

export async function POST(req: NextRequest, context: { params: Promise<any> }) {
  const auth = await requireWorkflowUser(req);
  if (!auth.ok) return auth.response;
  const params = await context.params;
  const id = Number(params.id);
  if (!id) return fail('Invalid workflow id', 422);
  const item = await setWorkflowStatus(id, userTenant(auth.user), 'active');
  if (!item) return fail('Workflow not found', 404);
  return ok({ item });
}
