import { NextRequest, NextResponse } from 'next/server';
import { refreshNews } from '@/app/lib/news';
import { authorizedRefresh } from '@/app/lib/news/auth';
import { hasNewsDatabase } from '@/app/lib/news/store';
import { newsRefreshHttpStatus } from '@/app/lib/news/refresh-status';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!authorizedRefresh(request.headers.get('authorization'))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const snapshot = await refreshNews();
  return NextResponse.json({ status: snapshot.status, refreshState: snapshot.refreshState, checkedAt: snapshot.checkedAt, lastSuccessfulAt: snapshot.lastSuccessfulAt, articleCount: snapshot.articles.length, storage: snapshot.storage, storageMessage: snapshot.storageMessage, sourceHealth: snapshot.sourceHealth }, { status: newsRefreshHttpStatus(snapshot, hasNewsDatabase()), headers: { 'Cache-Control': 'no-store' } });
}

export const GET = POST;
