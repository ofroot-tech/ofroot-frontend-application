import { confirmSubscription } from '@/app/lib/signal-subscriptions/service';
import { assertSubscriptionOrigin, readSubscriptionJson, subscriptionFailure, subscriptionResponse, subscriptionToken } from '../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Email scanners may visit a link; confirmation requires this explicit POST. */
export async function POST(request: Request) {
  try {
    assertSubscriptionOrigin(request);
    const body = await readSubscriptionJson(request);
    return subscriptionResponse({ ok: true, ...await confirmSubscription(subscriptionToken(body.token)) });
  } catch (error) { return subscriptionFailure(error); }
}
