import { createHash } from 'node:crypto';
import type { NewsArticle } from '../news/types';
import type { BriefEvidence, BriefSummary, EvidenceResult, SignalBrief } from './types';
import { composePerspective } from './perspective';

// Changing the evidence policy or wording invalidates both cache layers. The
// digest is deliberately extractive: it cannot invent facts or citation URLs.
export const BRIEF_VERSION = 'signal-source-summary-3';

export function briefFingerprint(article: NewsArticle): string {
  return createHash('sha256').update(JSON.stringify([BRIEF_VERSION, article])).digest('hex');
}

/** Keep complete sentences inside a short reading budget, never splice claims. */
export function abridgeAbstract(text: string, maxWords = 110): string {
  const sentences = Array.from(new Intl.Segmenter('en', { granularity: 'sentence' }).segment(text), part => part.segment);
  const selected: string[] = [];
  let words = 0;
  for (const sentence of sentences) {
    const count = sentence.trim().split(/\s+/).length;
    if (words + count > maxWords) break;
    selected.push(sentence.trim());
    words += count;
    if (selected.length >= 3) break;
  }
  return selected.join(' ');
}

/** Keep an unusually long opening sentence intact so a later qualifier or
 * negation is not cut away. The exceptional budget stays bounded; an even
 * longer sentence needs the original source, not a claim fragment. */
function sourceExcerpt(text: string, maxWords = 110, maxOpeningWords = 220): string {
  const complete = abridgeAbstract(text, maxWords);
  if (complete) return complete;
  const first = Array.from(new Intl.Segmenter('en', { granularity: 'sentence' }).segment(text), part => part.segment)[0]?.trim() || '';
  return first && first.split(/\s+/).length <= maxOpeningWords ? first : '';
}

export function composeBriefSummary(article: NewsArticle, evidence: BriefEvidence): BriefSummary | undefined {
  const fact = (label: string) => evidence.facts.find(item => item.label === label)?.value;
  if (article.sourceId === 'cisa') {
    const cve = fact('CVE');
    if (!cve || !evidence.abstract.trim()) return undefined;
    const product = [fact('Vendor'), fact('Product')].filter(Boolean).join(' / ');
    const description = sourceExcerpt(evidence.abstract, 65, 110);
    if (!description) return undefined;
    const action = fact('CISA required action');
    const actionExcerpt = action ? sourceExcerpt(action, 45, 100) : '';
    const vendorAction = action && /^Apply mitigations in accordance with vendor instructions\b/i.test(action);
    const due = fact('Federal agency due date');
    return {
      kind: 'overview',
      label: 'CISA record summary',
      text: [`CISA lists ${cve}${product ? ` for ${product}` : ''} as a known exploited vulnerability.`, description,
        ...(vendorAction ? ['CISA calls for vendor-directed mitigation. Read the linked record for its complete action and any federal-agency requirements.'] : actionExcerpt ? [`CISA required action: ${actionExcerpt}`] : action ? ['Read the full CISA required action in the linked catalog record.'] : []),
        ...(due ? [`The recorded ${due} due date applies to covered U.S. federal agencies.`] : []),
      ].join(' '),
    };
  }
  const excerpt = sourceExcerpt(evidence.abstract);
  if (!excerpt) return undefined;
  if (article.kind === 'research') return { kind: 'excerpt', label: 'Research abstract excerpt', text: excerpt };
  if (article.sourceId === 'federal-register') {
    const kind = fact('Document type');
    const identifier = fact('Document number');
    return { kind: 'overview', label: 'Policy record summary', text: `${kind && identifier ? `${kind} ${identifier}. ` : ''}${excerpt}` };
  }
  return { kind: 'excerpt', label: 'Agency summary excerpt', text: excerpt };
}

export function composeSignalBrief(article: NewsArticle, result: EvidenceResult, now = new Date().toISOString()): SignalBrief {
  const base = { version: BRIEF_VERSION, articleId: article.id, fingerprint: briefFingerprint(article), generatedAt: now };
  if (result.status !== 'available') return { ...base, status: result.status, reason: result.reason, introduction: '', digest: '', context: '' };
  const evidence = result.evidence;
  const digest = abridgeAbstract(evidence.abstract);
  const summary = composeBriefSummary(article, evidence);
  // Bibliographic facts alone do not give readers a substantive summary.
  if (!summary) return { ...base, status: 'unavailable', reason: 'The approved record does not contain enough usable detail for a brief.', introduction: '', digest: '', context: '' };
  const introduction = article.kind === 'research'
    ? 'This research brief brings together the registered abstract and publication details. It covers the metadata record, rather than a review of the full paper.'
    : article.kind === 'advisory'
      ? 'This security brief organizes the matching CISA catalog record into a short reading view. The details below describe the catalog entry, not an assessment of your systems.'
      : article.kind === 'policy'
        ? 'This policy brief organizes the matching Federal Register record, including its document type and any dates supplied by the source. Consult the official publication for the complete text.'
        : 'This brief organizes the matching agency announcement and its publication details. The original source remains the authority for its full scope.';
  const perspective = composePerspective(article, evidence);
  return { ...base, status: 'ready', introduction, digest, summary, context: perspective.relevance, perspective, evidence };
}
