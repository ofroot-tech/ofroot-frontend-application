jest.mock('@/app/lib/cookies', () => ({ getAuthTokenFromRequest: jest.fn() }));
jest.mock('@/app/lib/supabase-store', () => ({ getUserFromSessionToken: jest.fn() }));
jest.mock('@/app/lib/news', () => ({ getNewsSnapshot: jest.fn() }));
jest.mock('@/app/lib/signal-subscriptions/store', () => ({ getSubscriptionDatabase: jest.fn() }));

import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';
import { getNewsSnapshot } from '@/app/lib/news';
import { getSubscriptionDatabase } from '@/app/lib/signal-subscriptions/store';
import { briefFingerprint } from '@/app/lib/signal-briefs/compose';
import { canViewSignalOperations } from '@/app/lib/signal-subscriptions/operator-access';
import { getSignalOperations, signalDeliveryLimits, summarizeBriefCoverage } from '@/app/lib/signal-subscriptions/operations';
import { GET } from '@/app/api/admin/signal/route';
import { isPrivateSignalRoute } from '@/app/lib/signal-subscriptions/privacy';
import type { NewsArticle, NewsSnapshot } from '@/app/lib/news/types';

const article: NewsArticle = { id: 'a'.repeat(20), sourceId: 'arxiv', title: 'A research record', url: 'https://arxiv.org/abs/2610.12345', category: 'ai', kind: 'research', publishedAt: '2026-10-29' };
const snapshot = { articles: [article], sources: [], sourceHealth: [], checkedAt: '2026-10-29T13:00:00.000Z', lastSuccessfulAt: '2026-10-29T13:00:00.000Z', status: 'live', storage: 'postgres' } as NewsSnapshot;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.ADMIN_EMAILS = 'operator@example.test';
  delete process.env.COMPANY_OWNER_EMAIL;
  jest.mocked(getNewsSnapshot).mockResolvedValue(snapshot);
});
afterEach(() => { delete process.env.ADMIN_EMAILS; });

describe('Signal owner access and privacy', () => {
  it('requires an explicitly configured owner/admin address, never only a role or cookie', () => {
    expect(canViewSignalOperations(' Owner@Example.Test ', { COMPANY_OWNER_EMAIL: 'owner@example.test' })).toBe(true);
    expect(canViewSignalOperations('admin@example.test', { ADMIN_EMAILS: 'other@example.test, admin@example.test' })).toBe(true);
    expect(canViewSignalOperations('', {})).toBe(false);
    expect(canViewSignalOperations('someone@example.test', {})).toBe(false);
    expect(canViewSignalOperations('owner@example.test', { ADMIN_EMAILS: 'not-owner@example.test' })).toBe(false);
  });
  it('rejects unauthenticated requests before reading operations or source state', async () => {
    jest.mocked(getAuthTokenFromRequest).mockResolvedValue(undefined);
    const response = await GET();
    expect(response.status).toBe(401);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(getUserFromSessionToken).not.toHaveBeenCalled();
    expect(getNewsSnapshot).not.toHaveBeenCalled();
    expect(getSubscriptionDatabase).not.toHaveBeenCalled();
  });
  it('rejects a valid non-operator session before reading protected aggregates', async () => {
    jest.mocked(getAuthTokenFromRequest).mockResolvedValue('test-session');
    jest.mocked(getUserFromSessionToken).mockResolvedValue({ email: 'reader@example.test' } as Awaited<ReturnType<typeof getUserFromSessionToken>>);
    expect((await GET()).status).toBe(403);
    expect(getNewsSnapshot).not.toHaveBeenCalled();
  });
  it('fails closed when cookie or session resolution fails', async () => {
    jest.mocked(getAuthTokenFromRequest).mockRejectedValueOnce(new Error('private cookie failure'));
    const response = await GET();
    expect(response.status).toBe(401);
    expect(JSON.stringify(await response.json())).not.toContain('private cookie failure');
    expect(getNewsSnapshot).not.toHaveBeenCalled();
  });
  it('excludes the private desk and aggregate API from Signal telemetry', () => {
    expect(isPrivateSignalRoute('/dashboard/owner/signal')).toBe(true);
    expect(isPrivateSignalRoute('/api/admin/signal')).toBe(true);
    expect(isPrivateSignalRoute('/news/briefs')).toBe(false);
  });
});

describe('Signal operational figures', () => {
  it('mirrors existing delivery safeguards without expanding their ceiling', () => {
    expect(signalDeliveryLimits({})).toEqual({ batch: 25, daily: 50, transactionalDaily: 40 });
    expect(signalDeliveryLimits({ SIGNAL_DIGEST_BATCH_SIZE: '999', SIGNAL_DIGEST_MAX_PER_DAY: '999', SIGNAL_TRANSACTIONAL_DAILY_LIMIT: '0' })).toEqual({ batch: 50, daily: 50, transactionalDaily: 0 });
    expect(signalDeliveryLimits({ SIGNAL_DIGEST_BATCH_SIZE: '-1', SIGNAL_DIGEST_MAX_PER_DAY: 'broken', SIGNAL_TRANSACTIONAL_DAILY_LIMIT: '-1' })).toEqual({ batch: 25, daily: 50, transactionalDaily: 40 });
  });
  it('distinguishes unsupported discovery, uncached evidence and a current matching brief', () => {
    const reporting = { ...article, id: 'b'.repeat(20), sourceId: 'techcrunch-ai', kind: 'reporting' as const };
    expect(summarizeBriefCoverage({ ...snapshot, articles: [article, reporting] }).unsupported).toBe(1);
    expect(summarizeBriefCoverage(snapshot).unchecked).toBe(1);
    expect(summarizeBriefCoverage(snapshot, [{ article_id: article.id, fingerprint: briefFingerprint(article), status: 'ready', current: true }]).ready).toBe(1);
    expect(summarizeBriefCoverage(snapshot, [{ article_id: article.id, fingerprint: 'old-version', status: 'ready', current: true }]).unchecked).toBe(1);
  });
  it('reports unavailable storage honestly without showing zero delivery or private error details', async () => {
    jest.mocked(getSubscriptionDatabase).mockImplementation(() => { throw new Error('sensitive connection string'); });
    const result = await getSignalOperations();
    expect(result.delivery.available).toBe(false);
    expect(result.delivery.active).toBeNull();
    expect(JSON.stringify(result)).not.toContain('sensitive connection string');
  });
  it('reads aggregate columns only and calculates available budget from recorded attempts', async () => {
    const query = jest.fn(async (sql: string) => {
      if (sql.includes('to_regclass')) return { rows: [{ subscribers: true, issues: true, events: true, briefs: true }] };
      if (sql.includes('FROM ofroot_signal_briefs')) return { rows: [] };
      if (sql.includes('FROM ofroot_signal_subscribers')) return { rows: [{ active: 7, due: 3 }] };
      if (sql.includes('FROM ofroot_signal_digest_issues')) return { rows: [{ accepted: 2, empty: 4, uncertain: 1, preparing_expired: 0, sending_expired: 0, attempted_today: 6 }] };
      return { rows: [{ suppressed: 1 }] };
    });
    jest.mocked(getSubscriptionDatabase).mockReturnValue({ query } as unknown as ReturnType<typeof getSubscriptionDatabase>);
    const result = await getSignalOperations();
    expect(result.delivery).toMatchObject({ available: true, active: 7, due: 3, attemptsToday: 6, remainingToday: 44, uncertain: 1 });
    const statements = query.mock.calls.map(call => call[0]).join('\n');
    expect(statements).not.toMatch(/SELECT \*|SELECT email|provider_id|confirmation_hash|INSERT|UPDATE|DELETE/i);
  });
});
