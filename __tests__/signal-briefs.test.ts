jest.mock('@/app/lib/news', () => ({ getNewsSnapshot: jest.fn(), publicSnapshot: jest.fn(value => value) }));
jest.mock('@/app/lib/signal-briefs/evidence', () => ({ fetchBriefEvidence: jest.fn(), supportsBrief: jest.fn(() => true) }));
jest.mock('@/app/lib/signal-briefs/store', () => ({ readStoredBrief: jest.fn(), readStoredBriefAvailability: jest.fn(), writeStoredBrief: jest.fn(), readArchivedBriefArticle: jest.fn() }));

import { getNewsSnapshot, publicSnapshot } from '@/app/lib/news';
import { abridgeAbstract, briefFingerprint, composeSignalBrief } from '@/app/lib/signal-briefs/compose';
import { fetchBriefEvidence } from '@/app/lib/signal-briefs/evidence';
import { getBriefArticle, getBriefAvailability, getBriefCollection, getBriefForArticle } from '@/app/lib/signal-briefs';
import { readArchivedBriefArticle, readStoredBrief, readStoredBriefAvailability, writeStoredBrief } from '@/app/lib/signal-briefs/store';
import type { NewsArticle } from '@/app/lib/news/types';
import type { BriefEvidence } from '@/app/lib/signal-briefs/types';

const article: NewsArticle = { id: 'a'.repeat(20), title: 'A research record', url: 'https://arxiv.org/abs/2610.12345', sourceId: 'arxiv', category: 'ai', publishedAt: '2026-10-28', kind: 'research' };
const evidence: BriefEvidence = { url: article.url, retrievalUrl: 'https://api.datacite.org/dois/10.48550/arxiv.2610.12345', publisher: 'arXiv via DataCite', title: article.title, publishedAt: article.publishedAt, fetchedAt: '2026-10-28T12:00:00.000Z', license: 'CC0 metadata', scope: 'Abstract only', abstract: 'The authors describe a bounded experiment. They report limitations in the evaluation setting. The paper needs independent assessment.', facts: [{ label: 'DOI', value: '10.48550/arxiv.2610.12345' }], caveats: ['Full paper not reviewed.'], contentHash: 'test-evidence-hash' };

beforeEach(() => {
  jest.clearAllMocks();
  global.__ofrootBriefState = undefined;
  jest.mocked(readStoredBrief).mockResolvedValue(null);
  jest.mocked(readStoredBriefAvailability).mockResolvedValue({});
  jest.mocked(readArchivedBriefArticle).mockResolvedValue(null);
  jest.mocked(publicSnapshot).mockImplementation(value => value);
  jest.mocked(fetchBriefEvidence).mockResolvedValue({ status: 'available', evidence });
  jest.mocked(writeStoredBrief).mockResolvedValue(undefined);
});

describe('evidence-bound digest composition', () => {
  it('uses complete source sentences inside the reading budget', () => {
    expect(abridgeAbstract('One complete sentence. Another complete sentence. A third sentence.', 7)).toBe('One complete sentence. Another complete sentence.');
    expect(abridgeAbstract('This single sentence exceeds the tiny reading budget.', 2)).toBe('');
  });
  it.each([
    'We evaluate GPT-4.1 models on 40 tasks. Results are limited.',
    'The improvement was 1.5 percent. Larger gains were not established.',
    'The U.S. agency published the record. Its scope remains limited.',
  ])('preserves numbers, model names, and abbreviations verbatim: %s', source => {
    expect(abridgeAbstract(source)).toBe(source);
  });
  it('does not manufacture a summary or OfRoot analysis from a headline alone', () => {
    const brief = composeSignalBrief(article, { status: 'unsupported', reason: 'Primary evidence needed.' });
    expect(brief.status).toBe('unsupported');
    expect([brief.introduction, brief.digest, brief.context]).toEqual(['', '', '']);
    expect(brief.evidence).toBeUndefined();
  });
  it('keeps primary evidence and conditional OfRoot context separate', () => {
    const brief = composeSignalBrief(article, { status: 'available', evidence });
    expect(brief.digest).toBe(evidence.abstract);
    expect(brief.context).toContain('does not establish production readiness');
    expect(brief.perspective?.changed).toContain('10.48550/arxiv.2610.12345');
    expect(brief.perspective?.basis).toContain('Prepared automatically');
    expect(brief.evidence?.retrievalUrl).toBe(evidence.retrievalUrl);
    expect(brief.introduction).toContain('rather than a review of the full paper');
  });
  it('declines unusable text unless structured facts support a brief', () => {
    const unusable = { ...evidence, abstract: 'word '.repeat(150), facts: [] };
    expect(composeSignalBrief(article, { status: 'available', evidence: unusable }).status).toBe('unavailable');
    expect(composeSignalBrief(article, { status: 'available', evidence: { ...unusable, facts: evidence.facts } }).status).toBe('ready');
  });
  it('invalidates a cached brief after a title correction or source change', () => {
    expect(briefFingerprint({ ...article, title: 'Corrected research title' })).not.toBe(briefFingerprint(article));
    expect(briefFingerprint({ ...article, sourceId: 'other-source' })).not.toBe(briefFingerprint(article));
  });
});

describe('brief resolution and caching', () => {
  it('only exposes references still present in the public, suppression-filtered index', async () => {
    jest.mocked(getNewsSnapshot).mockResolvedValue({ articles: [article] } as Awaited<ReturnType<typeof getNewsSnapshot>>);
    expect(await getBriefArticle(article.id)).toEqual(article);
    jest.mocked(getNewsSnapshot).mockResolvedValue({ articles: [] } as unknown as Awaited<ReturnType<typeof getNewsSnapshot>>);
    expect(await getBriefArticle(article.id)).toBeNull();
    expect(await getBriefArticle('../../private')).toBeNull();
  });
  it('coalesces concurrent requests and persists the evidence-bound result', async () => {
    const [one, two] = await Promise.all([getBriefForArticle(article), getBriefForArticle(article)]);
    expect(one).toBe(two);
    expect(fetchBriefEvidence).toHaveBeenCalledTimes(1);
    expect(writeStoredBrief).toHaveBeenCalledWith(expect.objectContaining({ status: 'ready', fingerprint: briefFingerprint(article) }), 3600);
  });
  it('retains archived permalinks while applying the current public source/removal policy', async () => {
    jest.mocked(getNewsSnapshot).mockResolvedValue({ articles: [] } as unknown as Awaited<ReturnType<typeof getNewsSnapshot>>);
    jest.mocked(readArchivedBriefArticle).mockResolvedValue(article);
    expect(await getBriefArticle(article.id)).toEqual(article);
    expect(publicSnapshot).toHaveBeenCalledWith(expect.objectContaining({ articles: [article] }));
    jest.mocked(publicSnapshot).mockReturnValue({ articles: [] } as unknown as ReturnType<typeof publicSnapshot>);
    expect(await getBriefArticle(article.id)).toBeNull();
  });
  it('reads the persistent cache without fetching evidence again', async () => {
    const existing = composeSignalBrief(article, { status: 'available', evidence });
    jest.mocked(readStoredBrief).mockResolvedValue(existing);
    expect(await getBriefForArticle(article)).toEqual(existing);
    expect(fetchBriefEvidence).not.toHaveBeenCalled();
  });
  it('backs off unavailable evidence and omits it from the standalone collection', async () => {
    jest.mocked(fetchBriefEvidence).mockResolvedValue({ status: 'unavailable', reason: 'Temporary source failure.' });
    expect(await getBriefCollection([article])).toEqual([]);
    expect(writeStoredBrief).toHaveBeenCalledWith(expect.objectContaining({ status: 'unavailable' }), 900);
    await getBriefForArticle(article);
    expect(fetchBriefEvidence).toHaveBeenCalledTimes(1);
  });
  it('bounds collection work and preserves the source index ordering', async () => {
    const articles = Array.from({ length: 20 }, (_, n) => ({ ...article, id: n.toString(16).padStart(20, '0'), title: `Record ${n}` }));
    const results = await getBriefCollection(articles, 100);
    expect(results).toHaveLength(12);
    expect(results.map(item => item.article.id)).toEqual(articles.slice(0, 12).map(item => item.id));
  });
});


describe('truthful board availability', () => {
  it('distinguishes unchecked adapter support from unsupported reporting without source fetches', async () => {
    const publisher = { ...article, id: 'b'.repeat(20), sourceId: 'techcrunch-ai', kind: 'reporting' as const, url: 'https://techcrunch.com/story/' };
    const statuses = await getBriefAvailability([article, publisher]);
    expect(statuses).toEqual({ [article.id]: 'unchecked', [publisher.id]: 'unsupported' });
    expect(fetchBriefEvidence).not.toHaveBeenCalled();
    expect(readStoredBriefAvailability).toHaveBeenCalledTimes(1);
    expect(readStoredBriefAvailability).toHaveBeenCalledWith([{ id: article.id, fingerprint: briefFingerprint(article) }]);
  });
  it('uses one stored status lookup and reuses evidence already fetched in this process', async () => {
    jest.mocked(readStoredBriefAvailability).mockResolvedValue({ [article.id]: 'unavailable' });
    expect((await getBriefAvailability([article]))[article.id]).toBe('unavailable');
    await getBriefForArticle(article);
    jest.mocked(readStoredBriefAvailability).mockResolvedValue({});
    expect((await getBriefAvailability([article]))[article.id]).toBe('ready');
    expect(fetchBriefEvidence).toHaveBeenCalledTimes(1);
  });
});
