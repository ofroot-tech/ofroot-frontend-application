/**
 * # Telephony webhook ingress
 *
 * This route is the single entry point for provider callbacks. It keeps body
 * parsing, signature verification, and event normalization in one place so the
 * rest of the app can enqueue jobs or update state without caring about vendor
 * formats. Start with Twilio; the adapter registry can add more providers over
 * time.
 */
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/lib/logger';
import { resolveAdapter, type TelephonyProvider } from '@/app/lib/telephony/adapter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const params = await context.params;
  const provider = (params.provider ?? 'twilio') as TelephonyProvider;
  const rawBody = await req.text();
  const contentType = req.headers.get('content-type') ?? 'application/json';
  const headers = Object.fromEntries(req.headers.entries());
  const body = parseBody(rawBody, contentType);

  try {
    const adapter = await resolveAdapter({ provider });
    const verified = await adapter.webhooks.verifySignature({ url: req.url, rawBody, headers, body, contentType });

    if (!verified) {
      logger.warn('telephony.webhook.signature_failed', { provider });
      return NextResponse.json({ ok: false, error: { message: 'Invalid signature' } }, { status: 401 });
    }

    const event = await adapter.webhooks.normalizeEvent({ url: req.url, rawBody, headers, body, contentType });
    logger.info('telephony.webhook.received', { provider, event });

    return NextResponse.json({ ok: true, data: { received: true, provider, type: event?.type } });
  } catch (error: unknown) {
    logger.error('telephony.webhook.error', { provider, error });
    return NextResponse.json({ ok: false, error: { message: 'Webhook handling failed' } }, { status: 500 });
  }
}

function parseBody(rawBody: string, contentType: string): Record<string, any> {
  if (!rawBody) return {};

  if (contentType.toLowerCase().includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(rawBody));
  }

  try {
    return JSON.parse(rawBody);
  } catch (error) {
    // Fall back to an empty object if the payload is not JSON; we already
    // verified signatures using the raw body, so parsing failures are non-fatal.
    logger.warn('telephony.webhook.parse_body_failed', { error: (error as Error).message });
    return {};
  }
}
