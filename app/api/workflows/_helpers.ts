import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { fail } from '@/app/lib/response';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';
import { enableWorkflowFeatureForTenant, isWorkflowFeatureEnabledForTenant } from '@/app/lib/workflows/store';
import type { User } from '@/app/lib/api';

export async function requireWorkflowUser(req?: Request) {
  const token = await getAuthTokenFromRequest(req as any);
  if (!token) return { ok: false as const, response: fail('Unauthorized', 401) };
  const user = await getUserFromSessionToken(token);
  if (!user) return { ok: false as const, response: fail('Unauthorized', 401) };

  const role = (user.top_role || '').toLowerCase();
  if (!['owner', 'admin', 'manager'].includes(role)) {
    return { ok: false as const, response: fail('Insufficient permissions', 403) };
  }

  if (process.env.WORKFLOW_ENGINE_DEFAULT_ON === 'true' && user.tenant_id != null) {
    await enableWorkflowFeatureForTenant(user.tenant_id);
  }

  const enabled = await isWorkflowFeatureEnabledForTenant(user.tenant_id ?? null, user.top_role);
  if (!enabled) {
    return { ok: false as const, response: fail('Workflow Engine is not enabled for this tenant', 403) };
  }

  return { ok: true as const, user };
}

export function requireInternalSignature(req: Request) {
  const expected = process.env.WORKFLOW_INGEST_SECRET || '';
  if (!expected) return true;
  const provided = req.headers.get('x-workflow-signature') || '';
  return provided === expected;
}

export function userTenant(user: User): number | null {
  return user.tenant_id ?? null;
}
