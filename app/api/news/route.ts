import { NextResponse } from 'next/server';
import { getNewsSnapshot } from '@/app/lib/news';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  const snapshot = await getNewsSnapshot();
  return NextResponse.json(snapshot, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', 'X-Content-Type-Options': 'nosniff' } });
}
