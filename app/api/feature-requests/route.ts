import { NextRequest } from 'next/server';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { fail, ok } from '@/app/lib/response';
import { captureRouteException } from '@/app/api/_helpers/sentry';
import { logger } from '@/app/lib/logger';
import { createFeatureRequest, getUserFromSessionToken } from '@/app/lib/supabase-store';

const FEATURE_PRICE_CENTS = 500;

export async function POST(req: NextRequest) {
  const token = await getAuthTokenFromRequest();
  if (!token) return fail('Unauthorized', 401);

  try {
    const user = await getUserFromSessionToken(token);
    if (!user) return fail('Unauthorized', 401);

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const featureKey = String(body?.feature_key || '').trim();
    if (!featureKey) return fail('feature_key is required', 400);

    const request = await createFeatureRequest({
      user_id: user.id,
      email: user.email,
      feature_key: featureKey,
      add_on_price_cents: FEATURE_PRICE_CENTS,
    });

    return ok({
      request,
      price: {
        amount_cents: FEATURE_PRICE_CENTS,
        label: '$5/mo add-on',
      },
      enrollment: {
        auto_enrolled: true,
        trial_days: 7,
        trial_ends_at: request.trial_ends_at,
        review_status: request.review_status,
      },
    });
  } catch (err: any) {
    captureRouteException(err, { route: 'feature-requests' });
    logger.warn('feature_requests.create.failed', { message: err?.message, status: err?.status });
    return fail(err?.message || 'Failed to create feature request', err?.status ?? 500);
  }
}
