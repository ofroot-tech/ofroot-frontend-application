import { unsubscribeSignal } from '@/app/lib/signal-subscriptions/service';
import { readSubscriptionJson, readSubscriptionText, subscriptionFailure, subscriptionResponse, subscriptionToken } from '../_shared';
import { SubscriptionError } from '@/app/lib/signal-subscriptions/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** RFC 8058 mailbox POSTs intentionally do not require a browser Origin. Their
 * narrowly scoped signature authorizes opt-out only; GET performs no mutation. */
export async function POST(request: Request) {
  try {
    let token: unknown;
    if (request.headers.get('content-type')?.includes('application/json')) token = (await readSubscriptionJson(request)).token;
    else {
      const body = new URLSearchParams(await readSubscriptionText(request));
      if (body.get('List-Unsubscribe') !== 'One-Click') throw new SubscriptionError('Use the unsubscribe control from your Signal email.', 400);
      token = new URL(request.url).searchParams.get('token');
    }
    await unsubscribeSignal(subscriptionToken(token));
    return subscriptionResponse({ ok: true, message: 'You are unsubscribed from Signal email.' });
  } catch (error) { return subscriptionFailure(error); }
}
