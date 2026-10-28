import { NextRequest, NextResponse } from 'next/server';
import { MAX_SIGNAL_WEBHOOK_BYTES, processSignalWebhook } from '@/app/lib/signal-subscriptions/webhook';
import { SubscriptionError } from '@/app/lib/signal-subscriptions/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Read with a streaming bound while preserving the original signature input. */
export async function POST(request: NextRequest) {
  try {
    if (Number(request.headers.get('content-length') || 0) > MAX_SIGNAL_WEBHOOK_BYTES) throw new SubscriptionError('Email event is too large.', 413);
    if (!request.body) throw new SubscriptionError('Invalid email event.', 400);
    const reader = request.body.getReader();
    const decoder = new TextDecoder();
    let raw = ''; let bytes = 0;
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > MAX_SIGNAL_WEBHOOK_BYTES) throw new SubscriptionError('Email event is too large.', 413);
        raw += decoder.decode(chunk.value, { stream: true });
      }
      raw += decoder.decode();
    } finally { await reader.cancel().catch(() => undefined); }
    const result = await processSignalWebhook(raw, { id: request.headers.get('svix-id'), timestamp: request.headers.get('svix-timestamp'), signature: request.headers.get('svix-signature') });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const known = error instanceof SubscriptionError;
    return NextResponse.json({ error: known ? error.message : 'Email event processing is temporarily unavailable.' }, { status: known ? error.status : 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
