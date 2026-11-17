import { NextResponse } from 'next/server';
import { partnerInquirySchema, PartnerInquiryError } from '@/app/lib/partner-inquiry';
import { savePartnerInquiry } from '@/app/lib/partner-inquiry-store';

export const runtime = 'nodejs';
const MAX_BYTES = 16_384;

function respond(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '3600' } : {}) } });
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    // Next may normalize request.url to an internal localhost origin. Compare
    // the browser origin to Host, never an arbitrary forwarded-host header.
    let sameOrigin = false;
    try {
      const supplied = new URL(origin || '');
      const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(supplied.hostname);
      sameOrigin = supplied.origin === origin && supplied.host === (request.headers.get('host') || new URL(request.url).host)
        && (supplied.protocol === 'https:' || (loopback && supplied.protocol === 'http:'));
    } catch { /* Missing or malformed origins fail closed. */ }
    if (!sameOrigin || request.headers.get('sec-fetch-site') === 'cross-site') {
      return respond({ ok: false, error: 'Please send your inquiry from this website.' }, 403);
    }
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return respond({ ok: false, error: 'Use a JSON request.' }, 415);
    const reader = request.body?.getReader();
    if (!reader) return respond({ ok: false, error: 'Enter your inquiry details.' }, 400);
    let text = '';
    let size = 0;
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BYTES) { await reader.cancel(); return respond({ ok: false, error: 'This inquiry is too long. Please shorten it.' }, 413); }
        text += decoder.decode(value, { stream: true });
      }
      text += decoder.decode();
    } finally { reader.releaseLock(); }
    let body: unknown;
    try { body = JSON.parse(text); } catch { return respond({ ok: false, error: 'Enter valid inquiry details.' }, 400); }
    const parsed = partnerInquirySchema.safeParse(body);
    if (!parsed.success) return respond({ ok: false, error: 'Check the required fields, description length and privacy acknowledgment.' }, 400);
    if (parsed.data.website) return respond({ ok: false, error: 'This inquiry could not be accepted.' }, 400);
    // Trust only the hosting platform's overwritten address header. Else use a
    // shared unknown bucket; never let a caller spoof arbitrary forwarded IPs.
    const address = process.env.VERCEL === '1' ? (request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim().slice(0, 200) || 'unknown') : 'unknown';
    const saved = await savePartnerInquiry(parsed.data, address);
    return respond({ ok: true, requestId: saved.requestId }, 201);
  } catch (error) {
    if (error instanceof PartnerInquiryError) return respond({ ok: false, error: error.message }, error.status);
    // No raw provider errors, connection strings or submitted content in logs.
    console.warn('Partner inquiry could not be saved.');
    return respond({ ok: false, error: 'Your inquiry could not be saved. Your answers are still here; please try again.' }, 503);
  }
}
