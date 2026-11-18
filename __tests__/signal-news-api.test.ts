jest.mock('@/app/lib/news', () => ({ getNewsSnapshot: jest.fn() }));
jest.mock('@/app/lib/signal-briefs', () => ({ getBriefAvailability: jest.fn(), getBriefSummaries: jest.fn() }));

import { GET } from '@/app/api/news/route';
import { getNewsSnapshot } from '@/app/lib/news';
import { getBriefAvailability, getBriefSummaries } from '@/app/lib/signal-briefs';
import type { NewsSnapshot } from '@/app/lib/news/types';

test('the polling API returns prepared summaries with checked availability', async () => {
  const article = { id: 'a'.repeat(20), title: 'CVE-2026-12345: Example Gateway', sourceId: 'cisa', category: 'cybersecurity' as const, kind: 'advisory' as const, url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog?search_api_fulltext=CVE-2026-12345', publishedAt: '2026-11-17' };
  const snapshot: NewsSnapshot = { articles: [article], sources: [], checkedAt: '2026-11-17T12:00:00Z', lastSuccessfulAt: '2026-11-17T12:00:00Z', status: 'live', storage: 'memory', sourceHealth: [] };
  const summaries = { [article.id]: { text: 'CISA identifies the product and the supplied remediation action.', label: 'CISA record summary', kind: 'overview' as const, publisher: 'CISA', url: article.url } };
  jest.mocked(getNewsSnapshot).mockResolvedValue(snapshot);
  jest.mocked(getBriefSummaries).mockResolvedValue(summaries);
  jest.mocked(getBriefAvailability).mockResolvedValue({ [article.id]: 'ready' });
  const response = await GET();
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ briefSummaries: summaries, briefAvailability: { [article.id]: 'ready' } });
  expect(getBriefSummaries).toHaveBeenCalledWith([article], 3);
  expect(response.headers.get('Cache-Control')).toContain('s-maxage=60');
});
