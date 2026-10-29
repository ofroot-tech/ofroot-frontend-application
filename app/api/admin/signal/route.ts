import { fail, ok } from '@/app/lib/response';
import { signalOperatorAccess } from '@/app/lib/signal-subscriptions/operator-access';
import { getSignalOperations } from '@/app/lib/signal-subscriptions/operations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

/** Authentication precedes every aggregate read. Public callers cannot infer
 * list size, delivery state, configuration, or editorial backlog. */
export async function GET() {
  const access = await signalOperatorAccess();
  if (access !== 200) return fail(access === 401 ? 'Unauthorized' : 'Forbidden', access, { headers });
  try { return ok(await getSignalOperations(), { headers }); }
  catch { return fail('Signal operations are temporarily unavailable.', 503, { headers }); }
}
