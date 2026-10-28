import { requestPreferencesLink } from '@/app/lib/signal-subscriptions/service';
import { assertSubscriptionOrigin, readSubscriptionJson, subscriptionFailure, subscriptionIp, subscriptionResponse } from '../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    assertSubscriptionOrigin(request);
    const body = await readSubscriptionJson(request);
    if (!body.website || typeof body.website !== 'string' || !body.website.trim()) await requestPreferencesLink(body.email, subscriptionIp(request));
    return subscriptionResponse({ ok: true, message: 'If this address has a confirmed subscription, a private preferences link will arrive by email.' });
  } catch (error) { return subscriptionFailure(error); }
}
