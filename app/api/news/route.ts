import { NextResponse } from 'next/server';
import { getNewsSnapshot } from '@/app/lib/news';
import { getBriefAvailability, getBriefSummaries } from '@/app/lib/signal-briefs';
import { selectHighlights } from '@/app/lib/news/editorial';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const snapshot = await getNewsSnapshot();
  const candidates = [...selectHighlights(snapshot.articles, snapshot.sources, Date.parse(snapshot.checkedAt)), ...snapshot.articles];
  const briefSummaries = await getBriefSummaries(candidates.filter((article, index) => candidates.findIndex(item => item.id === article.id) === index), 3);
  const briefAvailability = await getBriefAvailability(snapshot.articles);
  return NextResponse.json({ ...snapshot, briefAvailability, briefSummaries }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', 'X-Content-Type-Options': 'nosniff' } });
}
