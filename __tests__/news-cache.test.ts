jest.mock('@/app/lib/news/store', () => ({ hasNewsDatabase: () => false, loadStoredNews: jest.fn().mockResolvedValue(null), saveStoredNews: jest.fn(), acquireNewsRefreshLease: jest.fn(), releaseNewsRefreshLease: jest.fn(), ensureNewsSchema: jest.fn() }));

import { getNewsSnapshot, publicSnapshot, refreshNews } from '@/app/lib/news';
import { NEWS_SOURCES } from '@/app/lib/news/sources';

describe('news update and failure behavior', () => {
  const originalFetch = global.fetch;
  beforeEach(() => { global.__ofrootNewsState = undefined; });
  afterEach(() => { global.fetch = originalFetch; });

  test('retains indexed metadata during a failed refresh and reports stale health', async () => {
    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.includes('known_exploited')) return new Response(JSON.stringify({ vulnerabilities: [{ cveID: 'CVE-2026-12345', vulnerabilityName: 'A known vulnerability', dateAdded: '2026-01-01' }] }));
      return new Response('', { status: 503 });
    });
    const first = await getNewsSnapshot();
    expect(first.status).toBe('partial');
    expect(first.articles).toHaveLength(1);
    const requestCount = (global.fetch as jest.Mock).mock.calls.length;
    await getNewsSnapshot();
    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(requestCount);
    global.fetch = jest.fn().mockResolvedValue(new Response('', { status: 503 }));
    const failed = await refreshNews();
    expect(failed.status).toBe('stale');
    expect(failed.articles[0].id).toBe(first.articles[0].id);
    expect(failed.lastSuccessfulAt).toBe(first.lastSuccessfulAt);
    expect(failed.sourceHealth.find(health => health.sourceId === 'cisa')).toMatchObject({ status: 'error', lastSuccessfulAt: first.checkedAt });
  });

  test('concurrent readers share one refresh and no unapproved publisher is fetched', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response('', { status: 503 }));
    const results = await Promise.all([getNewsSnapshot(), getNewsSnapshot(), getNewsSnapshot()]);
    expect(results.every(result => result.status === 'unavailable')).toBe(true);
    const enabled = NEWS_SOURCES.filter(source => source.enabled && source.rights.status === 'approved');
    expect(global.fetch).toHaveBeenCalledTimes(enabled.length);
    const urls = (global.fetch as jest.Mock).mock.calls.map(call => call[0]);
    expect(urls.join(' ')).not.toMatch(/theverge|ftc/);
  });

  test('article takedowns filter previously cached metadata immediately', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response('', { status: 503 }));
    const snapshot = await getNewsSnapshot();
    const id = '1234567890abcdefabcd';
    snapshot.articles = [{ id, title: 'Removed item', sourceId: 'fda', url: 'https://www.fda.gov/news/removed', category: 'healthcare', kind: 'release', publishedAt: null }];
    process.env.NEWS_BLOCKED_ARTICLE_IDS = id;
    try { expect(publicSnapshot(snapshot).articles).toEqual([]); } finally { delete process.env.NEWS_BLOCKED_ARTICLE_IDS; }
  });

  test('read-time relevance checks remove old policy false positives and correct broad AI-feed labels', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response('', { status: 503 }));
    const snapshot = await getNewsSnapshot();
    snapshot.articles = [
      { id: '1234567890abcdefabcd', title: 'Notice: Critical Material List; Addition of Helium', sourceId: 'federal-register', url: 'https://www.federalregister.gov/documents/helium', category: 'policy', kind: 'policy', publishedAt: null },
      { id: '1234567890abcdefabce', title: 'Japan internet giant GMO says hackers posted stolen customer data', sourceId: 'techcrunch', url: 'https://techcrunch.com/news/breach', category: 'ai', kind: 'reporting', publishedAt: null },
    ];
    expect(publicSnapshot(snapshot).articles).toHaveLength(1);
    expect(publicSnapshot(snapshot).articles[0].category).toBe('cybersecurity');
  });

  test('a fresh shared index missing a newly enabled source is checked once, even when that source fails', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response('', { status: 503 }));
    const first = await getNewsSnapshot();
    first.sourceHealth = first.sourceHealth.filter(health => health.sourceId !== 'nist');
    const previousCalls = (global.fetch as jest.Mock).mock.calls.length;
    const refreshed = await getNewsSnapshot();
    expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(previousCalls);
    expect(refreshed.sourceHealth.find(health => health.sourceId === 'nist')?.status).toBe('error');
    const afterRefresh = (global.fetch as jest.Mock).mock.calls.length;
    await getNewsSnapshot();
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(afterRefresh);
  });

  test('a changed registry version bypasses both fresh-cache branches and never advertises full coverage', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response('', { status: 503 }));
    const snapshot = await getNewsSnapshot();
    snapshot.registryVersion = 'previous-deployment';
    snapshot.status = 'live';
    expect(publicSnapshot(snapshot).status).toBe('partial');
    const previousCalls = (global.fetch as jest.Mock).mock.calls.length;
    const refreshed = await refreshNews({ force: false });
    expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(previousCalls);
    expect(refreshed.registryVersion).not.toBe('previous-deployment');
  });
});
