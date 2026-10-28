import { changeSubscriberPreferences, getSubscriberPreferences } from '@/app/lib/signal-subscriptions/service';
import { assertSubscriptionOrigin, readSubscriptionJson, subscriptionFailure, subscriptionResponse, subscriptionToken } from '../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    assertSubscriptionOrigin(request);
    const body = await readSubscriptionJson(request);
    return subscriptionResponse({ ok: true, preferences: await getSubscriberPreferences(subscriptionToken(body.token)) });
  } catch (error) { return subscriptionFailure(error); }
}
export async function PATCH(request: Request) {
  try {
    assertSubscriptionOrigin(request);
    const { token, ...input } = await readSubscriptionJson(request);
    return subscriptionResponse({ ok: true, preferences: await changeSubscriberPreferences(subscriptionToken(token), input) });
  } catch (error) { return subscriptionFailure(error); }
}
