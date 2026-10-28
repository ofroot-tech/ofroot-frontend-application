import { NextRequest, NextResponse } from 'next/server';
import { authorizedRefresh } from '@/app/lib/news/auth';
import { dispatchSignalDigests } from '@/app/lib/signal-subscriptions/digest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Only the protected production schedule can deliver mail. A protected dry
 * run verifies configuration and due counts without touching email recipients. */
export async function POST(request: NextRequest) {
  if (!authorizedRefresh(request.headers.get('authorization'))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (process.env.VERCEL_ENV !== 'production') return NextResponse.json({ error: 'Digest delivery is available only in production.' }, { status: 403 });
  try {
    const result = await dispatchSignalDigests({ dryRun: request.nextUrl.searchParams.get('dryRun') === '1' });
    return NextResponse.json(result, { status: result.ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Signal digest delivery is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
}

export const GET = POST;
