jest.mock('@/app/lib/news', () => ({ getNewsSnapshot: jest.fn(), publicSnapshot: jest.fn(value => value) }));
jest.mock('@/app/lib/signal-briefs/evidence', () => ({ fetchBriefEvidence: jest.fn(), supportsBrief: jest.fn(() => true) }));
jest.mock('@/app/lib/signal-briefs/store', () => ({ readStoredBrief: jest.fn(), readStoredBriefAvailability: jest.fn(), readStoredBriefSummaries: jest.fn(), writeStoredBrief: jest.fn(), readArchivedBriefArticle: jest.fn() }));

import { getNewsSnapshot, publicSnapshot } from '@/app/lib/news';
import { abridgeAbstract, briefFingerprint, composeSignalBrief } from '@/app/lib/signal-briefs/compose';
import { fetchBriefEvidence } from '@/app/lib/signal-briefs/evidence';
import { getBriefArticle, getBriefAvailability, getBriefCollection, getBriefForArticle } from '@/app/lib/signal-briefs';
import { readArchivedBriefArticle, readStoredBrief, readStoredBriefAvailability, readStoredBriefSummaries, writeStoredBrief } from '@/app/lib/signal-briefs/store';
import type { NewsArticle } from '@/app/lib/news/types';
import type { BriefEvidence } from '@/app/lib/signal-briefs/types';
import { createHash } from 'node:crypto';
import { getBriefSummaries } from '@/app/lib/signal-briefs';

const article: NewsArticle = { id: 'a'.repeat(20), title: 'A research record', url: 'https://arxiv.org/abs/2610.12345', sourceId: 'arxiv', category: 'ai', publishedAt: '2026-10-28', kind: 'research' };
const evidence: BriefEvidence = { url: article.url, retrievalUrl: 'https://api.datacite.org/dois/10.48550/arxiv.2610.12345', publisher: 'arXiv via DataCite', title: article.title, publishedAt: article.publishedAt, fetchedAt: '2026-10-28T12:00:00.000Z', license: 'CC0 metadata', scope: 'Abstract only', abstract: 'The authors describe a bounded experiment. They report limitations in the evaluation setting. The paper needs independent assessment.', facts: [{ label: 'DOI', value: '10.48550/arxiv.2610.12345' }], caveats: ['Full paper not reviewed.'], contentHash: 'test-evidence-hash' };

beforeEach(() => {
  jest.clearAllMocks();
  global.__ofrootBriefState = undefined;
  jest.mocked(readStoredBrief).mockResolvedValue(null);
  jest.mocked(readStoredBriefAvailability).mockResolvedValue({});
  jest.mocked(readStoredBriefSummaries).mockResolvedValue({});
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
    expect(brief.summary).toBeUndefined();
  });
  it('does not attach a summary when approved evidence is temporarily unavailable', () => {
    expect(composeSignalBrief(article, { status: 'unavailable', reason: 'Temporary source failure.' }).summary).toBeUndefined();
  });
  it('keeps primary evidence and conditional OfRoot context separate', () => {
    const brief = composeSignalBrief(article, { status: 'available', evidence });
    expect(brief.digest).toBe(evidence.abstract);
    expect(brief.summary).toEqual({ kind: 'excerpt', label: 'Research abstract excerpt', text: evidence.abstract });
    expect(brief.context).toContain('does not establish production readiness');
    expect(brief.perspective?.changed).toContain('10.48550/arxiv.2610.12345');
    expect(brief.perspective?.basis).toContain('Prepared automatically');
    expect(brief.evidence?.retrievalUrl).toBe(evidence.retrievalUrl);
    expect(brief.introduction).toContain('rather than a review of the full paper');
  });
  it('does not treat bibliographic metadata alone as a substantive summary', () => {
    const brief = composeSignalBrief(article, { status: 'available', evidence: { ...evidence, abstract: '', facts: evidence.facts } });
    expect(brief.status).toBe('unavailable');
    expect(brief.summary).toBeUndefined();
  });
  it('keeps a long opening sentence intact, including its final qualification', () => {
    const opening = Array.from({ length: 140 }, (_, index) => `word${index}`).join(' ') + ' but the result does not generalize to production.';
    const brief = composeSignalBrief(article, { status: 'available', evidence: { ...evidence, abstract: `${opening} However, the full paper requires review.` } });
    expect(brief.status).toBe('ready');
    expect(brief.summary).toEqual({ kind: 'excerpt', label: 'Research abstract excerpt', text: opening });
    expect(brief.summary?.text).toContain('does not generalize to production.');
    expect(brief.digest).toBe('');
  });
  it('declines a sentence too long to preserve safely instead of cutting away a qualification', () => {
    const abstract = Array.from({ length: 230 }, () => 'finding').join(' ') + ' but the approach is not suitable for production.';
    const brief = composeSignalBrief(article, { status: 'available', evidence: { ...evidence, abstract } });
    expect(brief.status).toBe('unavailable');
    expect(brief.summary).toBeUndefined();
  });
  it('summarizes the exact CISA product, impact and supplied action with a scoped federal deadline', () => {
    const description = 'Example Gateway permits an unauthenticated attacker to read configured records.';
    const action = 'Apply mitigations according to vendor instructions.';
    const brief = composeSignalBrief({ ...article, sourceId: 'cisa', kind: 'advisory' }, { status: 'available', evidence: { ...evidence, publisher: 'CISA', abstract: description, facts: [{ label: 'CVE', value: 'CVE-2026-12345' }, { label: 'Vendor', value: 'Example' }, { label: 'Product', value: 'Gateway' }, { label: 'CISA required action', value: action }, { label: 'Federal agency due date', value: '2026-12-01' }] } });
    expect(brief.summary?.text).toContain('CVE-2026-12345 for Example / Gateway');
    expect(brief.summary?.text).toContain(description);
    expect(brief.summary?.text).toContain(`CISA required action: ${action}`);
    expect(brief.summary?.text).toContain('2026-12-01 due date applies to covered U.S. federal agencies');
    expect(brief.summary?.text).not.toContain('your organization is compromised');
    expect(brief.summary?.kind).toBe('overview');
  });
  it('does not invent an absent security action or deadline', () => {
    const brief = composeSignalBrief({ ...article, sourceId: 'cisa', kind: 'advisory' }, { status: 'available', evidence: { ...evidence, facts: [{ label: 'CVE', value: 'CVE-2026-12345' }] } });
    expect(brief.summary?.text).not.toMatch(/required action|due date|patch|update immediately/i);
  });
  it('keeps standard vendor-mitigation instructions readable without reproducing federal boilerplate', () => {
    const brief = composeSignalBrief({ ...article, sourceId: 'cisa', kind: 'advisory' }, { status: 'available', evidence: { ...evidence, facts: [{ label: 'CVE', value: 'CVE-2026-12345' }, { label: 'CISA required action', value: 'Apply mitigations in accordance with vendor instructions, ensuring compliance with agency-specific directives.' }] } });
    expect(brief.summary?.text).toContain('CISA calls for vendor-directed mitigation.');
    expect(brief.summary?.text).toContain('Read the linked record for its complete action');
    expect(brief.summary?.text).not.toContain('ensuring compliance');
  });
  it('preserves policy proposal status beside the actual source abstract', () => {
    const brief = composeSignalBrief({ ...article, sourceId: 'federal-register', kind: 'policy' }, { status: 'available', evidence: { ...evidence, facts: [{ label: 'Document type', value: 'Proposed Rule' }, { label: 'Document number', value: '2026-12345' }] } });
    expect(brief.summary?.text).toBe(`Proposed Rule 2026-12345. ${evidence.abstract}`);
    expect(brief.summary?.text).not.toMatch(/now requires|enacted/i);
  });
  it('invalidates older metadata-only cached briefs after the summary policy changes', () => {
    const priorFingerprint = createHash('sha256').update(JSON.stringify(['signal-primary-digest-2', article])).digest('hex');
    expect(briefFingerprint(article)).not.toBe(priorFingerprint);
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
  it('prepares a bounded set of source summaries and omits failed or unsupported evidence', async () => {
    const items = Array.from({ length: 10 }, (_, index) => ({ ...article, id: index.toString(16).padStart(20, '0') }));
    jest.mocked(fetchBriefEvidence)
      .mockResolvedValueOnce({ status: 'available', evidence })
      .mockResolvedValueOnce({ status: 'unsupported', reason: 'Source-only permission.' })
      .mockResolvedValueOnce({ status: 'unavailable', reason: 'Temporary failure.' });
    const summaries = await getBriefSummaries(items, 3);
    expect(Object.keys(summaries)).toEqual([items[0].id]);
    expect(summaries[items[0].id]).toMatchObject({ text: evidence.abstract, publisher: evidence.publisher, url: evidence.url });
    expect(fetchBriefEvidence).toHaveBeenCalledTimes(3);
  });
  it('retains a current stored summary outside the fresh preparation window without an extra source fetch', async () => {
    const newer = { ...article, id: 'b'.repeat(20), title: 'A newer record' };
    const cached = { [article.id]: { text: evidence.abstract, kind: 'excerpt' as const, label: 'Research abstract excerpt', publisher: evidence.publisher, url: evidence.url } };
    jest.mocked(readStoredBriefSummaries).mockResolvedValue(cached);
    const summaries = await getBriefSummaries([newer, article], 1);
    expect(summaries[article.id]).toEqual(cached[article.id]);
    expect(summaries[newer.id]).toBeDefined();
    expect(fetchBriefEvidence).toHaveBeenCalledTimes(1);
    expect(readStoredBriefSummaries).toHaveBeenCalledWith([{ id: article.id, fingerprint: briefFingerprint(article) }]);
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
