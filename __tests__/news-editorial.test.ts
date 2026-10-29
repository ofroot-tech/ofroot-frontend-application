import { groupStories, isRelevantArticle, selectHighlights, selectionReason } from '@/app/lib/news/editorial';
import type { NewsArticle } from '@/app/lib/news/types';
import { NEWS_SOURCES } from '@/app/lib/news/sources';

const now = Date.parse('2026-10-29T14:00:00Z');
const article = (id: string, overrides: Partial<NewsArticle> = {}): NewsArticle => ({ id, title: 'A useful technology development', url: `https://example.test/${id}`, sourceId: 'techcrunch', category: 'ai', kind: 'reporting', publishedAt: '2026-10-28T12:00:00Z', ...overrides });

describe('Signal editorial selection and conservative story grouping', () => {
  test('omits overt ticket promotions while retaining reporting about event announcements', () => {
    expect(isRelevantArticle(article('a', { title: '7 days until TechCrunch Founder Summit: Save up to $100 on your pass' }))).toBe(false);
    expect(isRelevantArticle(article('b', { title: 'Last chance to register: get your tickets' }))).toBe(false);
    expect(isRelevantArticle(article('c', { title: 'A healthcare startup announces an AI diagnostic tool at a summit' }))).toBe(true);
    expect(isRelevantArticle(article('d', { url: 'https://www.nist.gov/news-events/events/2026/10/workshop' }))).toBe(false);
  });

  test('retains policy and remediation countdowns while omitting explicit event promotions', () => {
    expect(isRelevantArticle(article('policy', { title: '30 days until AI policy compliance deadline', category: 'policy', kind: 'policy', sourceId: 'federal-register' }))).toBe(true);
    expect(isRelevantArticle(article('security', { title: 'CISA: 30 days left until the remediation due date', category: 'cybersecurity', kind: 'advisory', sourceId: 'cisa' }))).toBe(true);
    expect(isRelevantArticle(article('event', { title: '7 days until TechCrunch Founder Summit' }))).toBe(false);
  });

  test('balances feeds by publisher organization and categories rather than rewarding volume', () => {
    const input = [article('a'), article('b', { sourceId: 'techcrunch-healthcare', category: 'healthcare' }), article('c', { sourceId: 'techcrunch-integrations', category: 'integrations' }), article('d', { sourceId: 'cisa', category: 'cybersecurity', kind: 'advisory' }), article('e', { sourceId: 'fda', category: 'healthcare', kind: 'release' }), article('f', { sourceId: 'federal-register', category: 'policy', kind: 'policy' })];
    const selected = selectHighlights(input, NEWS_SOURCES, now);
    expect(selected).toHaveLength(4);
    expect(selected.filter(item => item.sourceId.startsWith('techcrunch'))).toHaveLength(1);
    expect(new Set(selected.map(item => item.category)).size).toBe(4);
    expect(input[0].id).toBe('a');
  });

  test('does not fill highlights with undated, stale, future or promotional records', () => {
    expect(selectHighlights([article('a', { publishedAt: null }), article('b', { publishedAt: '2026-09-01' }), article('c', { publishedAt: '2027-01-01' }), article('d', { title: 'Save $100 on early-bird tickets' })], NEWS_SOURCES, now)).toEqual([]);
    expect(selectHighlights([article('a'), article('b'), article('c'), article('d')], NEWS_SOURCES, now)).toHaveLength(2);
    expect(selectionReason(article('a', { kind: 'research' }))).toMatch(/limitations/);
  });

  test('groups matching CVE references while preserving distinct vulnerabilities', () => {
    const groups = groupStories([article('a', { title: 'CVE-2026-12345: Vendor product vulnerability', category: 'cybersecurity', sourceId: 'cisa' }), article('b', { title: 'Vendor fixes CVE-2026-12345 exploited vulnerability', category: 'cybersecurity' }), article('c', { title: 'Vendor fixes CVE-2026-99999 exploited vulnerability', category: 'cybersecurity' })], NEWS_SOURCES);
    expect(groups).toHaveLength(1);
    expect(groups[0].articles.map(item => item.id).sort()).toEqual(['a', 'b']);
    expect(groups[0].sourceCount).toBe(2);
  });

  test('groups near-identical coverage without treating separate feeds as independent publishers', () => {
    const title = 'Vendor launches new enterprise API connector for secure healthcare data workflows';
    const groups = groupStories([article('a', { title, category: 'integrations' }), article('b', { title: `${title} today`, category: 'integrations', sourceId: 'techcrunch-integrations' })], NEWS_SOURCES);
    expect(groups).toHaveLength(1);
    expect(groups[0].sourceCount).toBe(1);
    expect(groups[0].id).toBe('a');
  });

  test('does not group stories solely by company, category, or undated resemblance', () => {
    expect(groupStories([article('a', { title: 'Microsoft reports record cloud revenue for enterprise AI' }), article('b', { title: 'Microsoft launches new AI connector for enterprise customers' }), article('c', { title: 'Microsoft reports record cloud revenue for enterprise AI', publishedAt: null })], NEWS_SOURCES)).toEqual([]);
  });
});
