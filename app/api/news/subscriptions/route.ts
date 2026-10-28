import { beginSubscription } from '@/app/lib/signal-subscriptions/service';
import { assertSubscriptionOrigin, readSubscriptionJson, subscriptionFailure, subscriptionIp, subscriptionResponse } from './_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** A public response never discloses whether this address already subscribes. */
export async function POST(request: Request) {
  try {
    assertSubscriptionOrigin(request);
    await beginSubscription(await readSubscriptionJson(request), subscriptionIp(request));
    return subscriptionResponse({ ok: true, message: 'Check your inbox for a confirmation link. Your choices take effect after you confirm.' });
  } catch (error) { return subscriptionFailure(error); }
}
