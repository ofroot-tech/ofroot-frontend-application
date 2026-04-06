import { NextRequest } from 'next/server';
import { fail, ok } from '@/app/lib/response';
import { drainWorkflowQueue } from '@/app/lib/workflows/engine';

function isAuthorized(req: NextRequest) {
  const expected = process.env.WORKFLOW_WORKER_SECRET || '';
  if (!expected) return true;
  const header = req.headers.get('x-workflow-worker-secret') || '';
  return header === expected;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return fail('Unauthorized worker drain request', 401);
  const body = (await req.json().catch(() => ({}))) as { max_jobs?: number };
  const maxJobs = Number(body.max_jobs || 20);
  const result = await drainWorkflowQueue(Number.isFinite(maxJobs) ? Math.max(1, Math.min(200, maxJobs)) : 20);
  return ok(result);
}
