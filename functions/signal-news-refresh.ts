import { refreshNews } from '../app/lib/news';

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readJson(body: ReadableStream<Uint8Array> | null, byteLimit: number): Promise<unknown> {
  if (!body) throw new Error('Missing JSON body');
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = '';
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > byteLimit) throw new Error('JSON body exceeds limit');
      text += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode()) as unknown;
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

function timestamp(value: unknown): string | null {
  const time = typeof value === 'string' ? Date.parse(value) : NaN;
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } });
    // Neon strips client-supplied X-Neon-* headers before invoking a function.
    // This check is meaningful only when deployed behind Neon's function runtime.
    if (!request.headers.get('x-neon-trigger-invocation-id')) return Response.json({ error: 'Not a scheduled trigger' }, { status: 403 });

    let scheduledAt: string | null = null;
    try {
      const payload = await readJson(request.body, 4_096);
      if (!record(payload) || !record(payload.data) || !(scheduledAt = timestamp(payload.data.scheduled_at))) {
        return Response.json({ error: 'Invalid scheduled occurrence' }, { status: 400 });
      }
    } catch {
      return Response.json({ error: 'Invalid scheduled occurrence' }, { status: 400 });
    }

    try {
      // Reuse the exact deployed ingestion/lease/archive logic. Neon injects the
      // branch's DATABASE_URL; no Vercel cron secret needs to cross services.
      const refresh = refreshNews({ force: true });
      // The adapter creates its pool synchronously before its first query awaits.
      // pg removes a failed idle client; handling its event keeps this persistent
      // function isolate alive so the next refresh can open a fresh connection.
      const pool = globalThis.__ofrootNewsPool;
      if (pool && pool.listenerCount('error') === 0) {
        pool.on('error', () => console.warn('Signal news idle database connection closed; the next query will reconnect.'));
      }
      const snapshot = await refresh;
      const inProgress = snapshot.refreshState === 'in_progress';
      const completed = snapshot.refreshState === 'completed' && snapshot.storage === 'postgres';
      const result = {
        ok: completed || inProgress, scheduledAt, status: snapshot.status, refreshState: snapshot.refreshState,
        storage: snapshot.storage, articleCount: snapshot.articles.length, checkedAt: timestamp(snapshot.checkedAt),
        lastSuccessfulAt: timestamp(snapshot.lastSuccessfulAt),
      };
      console.log(JSON.stringify({ event: 'signal-news-scheduled-check', ...result }));
      return Response.json(result, { status: inProgress ? 202 : completed ? 200 : 503 });
    } catch {
      const result = { ok: false, scheduledAt, error: 'No fresh persistent news snapshot' };
      console.error(JSON.stringify({ event: 'signal-news-scheduled-check', ...result }));
      return Response.json(result, { status: 503 });
    }
  },
};
