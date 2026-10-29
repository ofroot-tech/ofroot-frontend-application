import { briefAction, briefIdentity, initialBriefAvailability } from '@/app/lib/signal-briefs/availability';
import { composePerspective } from '@/app/lib/signal-briefs/perspective';
import type { NewsArticle } from '@/app/lib/news/types';
import type { BriefEvidence } from '@/app/lib/signal-briefs/types';

const article: NewsArticle = { id: 'a'.repeat(20), title: 'Discovery headline', sourceId: 'arxiv', kind: 'research', category: 'ai', url: 'https://arxiv.org/abs/2610.12345', publishedAt: '2026-10-29' };
const evidence: BriefEvidence = { url: article.url, retrievalUrl: 'https://api.datacite.org/dois/10.48550/arxiv.2610.12345', title: 'Retrieval grounded company knowledge', publisher: 'arXiv via DataCite', publishedAt: article.publishedAt, fetchedAt: '2026-10-29T12:00:00.000Z', license: 'CC0', scope: 'Abstract only', abstract: 'A bounded author supplied evaluation.', facts: [{ label: 'DOI', value: '10.48550/arxiv.2610.12345' }], caveats: [], contentHash: 'fixture' };

describe('record-specific OfRoot perspective', () => {
  it('chooses research questions from the evidence title, not the discovery headline', () => {
    const retrieval = composePerspective({ ...article, title: 'Agents are production ready' }, evidence);
    const agent = composePerspective(article, { ...evidence, title: 'Tool-calling agents with bounded access' });
    expect(retrieval.changed).toContain(evidence.title);
    expect(retrieval.changed).not.toContain('Agents are production ready');
    expect(retrieval.nextStep).toContain('source permissions');
    expect(agent.nextStep).toContain('human checkpoints');
    expect(agent.relevance).toContain('does not establish production readiness');
    expect(retrieval.basis).toContain('no human review is represented');
  });

  it('preserves a policy proposal and missing effective date rather than manufacturing a requirement', () => {
    const perspective = composePerspective({ ...article, sourceId: 'federal-register', kind: 'policy', category: 'policy' }, { ...evidence, title: 'Interoperability proposal', publisher: 'Federal Register', facts: [{ label: 'Document type', value: 'Proposed Rule' }, { label: 'Document number', value: '2026-12345' }] });
    expect(perspective.changed).toContain('2026-12345');
    expect(perspective.changed).toContain('proposed rule');
    expect(perspective.changed).toContain('no effective date');
    expect(perspective.relevance).toContain('A proposed rule is a proposal');
    expect(perspective.nextStep).toContain('check affected parties');
  });

  it('binds cyber guidance to the exact CVE/product and keeps federal deadlines scoped', () => {
    const perspective = composePerspective({ ...article, sourceId: 'cisa', kind: 'advisory', category: 'cybersecurity' }, { ...evidence, publisher: 'CISA', facts: [{ label: 'CVE', value: 'CVE-2026-12345' }, { label: 'Vendor', value: 'Example' }, { label: 'Product', value: 'Gateway' }, { label: 'Federal agency due date', value: '2026-11-01' }] });
    expect(perspective.changed).toContain('CVE-2026-12345');
    expect(perspective.audience).toContain('Example / Gateway');
    expect(perspective.relevance).toContain('does not show that your organization has been compromised');
    expect(perspective.nextStep).toContain('not a universal deadline');
  });
});

describe('Signal reading action semantics', () => {
  it('reserves Brief for a checked usable record and labels every other state Sources', () => {
    expect(briefAction('ready').label).toBe('Brief');
    for (const status of ['unsupported', 'unavailable', 'unchecked'] as const) expect(briefAction(status).label).toBe('Sources');
    expect(initialBriefAvailability(article)).toBe('unchecked');
    expect(initialBriefAvailability({ ...article, sourceId: 'techcrunch-ai', kind: 'reporting' })).toBe('unsupported');
  });
  it('does not treat a spoofed origin or another paper version as supported', () => {
    expect(briefIdentity({ ...article, url: 'https://arxiv.org.evil.test/abs/2610.12345' })).toBeNull();
    expect(briefIdentity({ ...article, url: `${article.url}v2` })).toBeNull();
  });
});
