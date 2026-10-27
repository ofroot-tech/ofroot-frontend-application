import { newsRefreshHttpStatus } from '@/app/lib/news/refresh-status';
import type { NewsSnapshot } from '@/app/lib/news/types';

const snapshot: NewsSnapshot = { articles: [], sources: [], sourceHealth: [], checkedAt: new Date().toISOString(), lastSuccessfulAt: new Date().toISOString(), status: 'live', storage: 'postgres', refreshState: 'completed' };

describe('scheduled refresh result semantics', () => {
  test('accepts a successful durable update, including partial feed availability', () => {
    expect(newsRefreshHttpStatus(snapshot, true)).toBe(200);
    expect(newsRefreshHttpStatus({ ...snapshot, status: 'partial' }, true)).toBe(200);
  });
  test('distinguishes another instance owning the lease from completed work', () => {
    expect(newsRefreshHttpStatus({ ...snapshot, refreshState: 'in_progress' }, true)).toBe(202);
  });
  test('fails scheduled work when sources or configured persistence fail', () => {
    expect(newsRefreshHttpStatus({ ...snapshot, status: 'stale' }, true)).toBe(503);
    expect(newsRefreshHttpStatus({ ...snapshot, refreshState: 'failed' }, true)).toBe(503);
    expect(newsRefreshHttpStatus({ ...snapshot, storage: 'memory' }, true)).toBe(503);
    expect(newsRefreshHttpStatus({ ...snapshot, storage: 'memory' }, false)).toBe(200);
  });
});
