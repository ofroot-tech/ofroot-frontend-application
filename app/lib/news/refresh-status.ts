import type { NewsSnapshot } from './types';

/** Schedulers distinguish completed durable work from an overlap or a failure. */
export function newsRefreshHttpStatus(snapshot: NewsSnapshot, persistentStorageRequired: boolean): 200 | 202 | 503 {
  if (snapshot.refreshState === 'in_progress') return 202;
  if (snapshot.refreshState === 'failed' || snapshot.status === 'stale' || snapshot.status === 'unavailable') return 503;
  if (persistentStorageRequired && snapshot.storage !== 'postgres') return 503;
  return 200;
}
