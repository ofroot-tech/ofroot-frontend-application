import { createHash } from 'node:crypto';
import type { NewsArticle } from '../news/types';
import { getReviewedSummary } from './reviewed-summaries';
import type { BriefEvidence, BriefSummary, EvidenceResult, SignalBrief } from './types';

export const BRIEF_VERSION = 'signal-source-summary-4';

const sentenceSegmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
const outcome = /\b(?:we (?:find|found|show|report|prove|demonstrate)|(?:results|experiments|findings) (?:show|suggest|indicate|demonstrate)|achieves?|outperforms?)\b/i;
const contribution = /\b(?:we|this (?:paper|work|study)) (?:present|presents|introduce|introduces|propose|proposes|describe|describes|develop|develops|argues?|evaluates?)\b/i;
const qualifier = /^(?:however|but|although|yet|nevertheless|despite|one limitation|a limitation)\b/i;
const referringBack = /^(?:this|these|such|it|they|the (?:method|model|approach|system))\b/i;

export function briefFingerprint(article: NewsArticle): string {
  return createHash('sha256').update(JSON.stringify([BRIEF_VERSION, article])).digest('hex');
}

function sentences(text: string): string[] {
  return Array.from(sentenceSegmenter.segment(text.trim()), part => part.segment.trim());
}

function wordCount(text: string): number {
  return text.split(/\s+/).length;
}

/** Quote adjacent, complete sentences so the source's claim and any immediately
 * following qualification stay together. */
function sourceExcerpt(parts: string[], start = 0, minEnd = start, maxWords = 75, maxExtendedWords = 220): string {
  if (!parts.length) return '';

  let end = minEnd;
  // Keep an immediately following caveat even when it takes the quote past its normal budget.
  while (parts[end + 1] && qualifier.test(parts[end + 1])) end++;
  let excerpt = parts.slice(start, end + 1).join(' ');
  if (wordCount(excerpt) > maxExtendedWords) return '';

  if (end === start && parts[end + 1]) {
    let followingEnd = end + 1;
    while (parts[followingEnd + 1] && qualifier.test(parts[followingEnd + 1])) followingEnd++;
    const longer = parts.slice(start, followingEnd + 1).join(' ');
    if (wordCount(longer) <= maxWords) excerpt = longer;
  }
  return excerpt;
}

function researchExcerpt(parts: string[]): string {
  const findings = parts.findIndex(sentence => outcome.test(sentence));
  const study = parts.findIndex(sentence => contribution.test(sentence));
  const anchor = findings >= 0 ? findings : study;
  if (anchor > 0) {
    const previous = parts[anchor - 1];
    const needsContext = referringBack.test(parts[anchor]) || qualifier.test(parts[anchor]);
    const start = needsContext || contribution.test(previous) || qualifier.test(previous) ? anchor - 1 : anchor;
    const excerpt = sourceExcerpt(parts, start, anchor);
    if (excerpt) return excerpt;
  }
  return sourceExcerpt(parts);
}

export function composeBriefSummary(article: NewsArticle, evidence: BriefEvidence): BriefSummary | undefined {
  if (!evidence.abstract.trim()) return undefined;
  const reviewed = getReviewedSummary(evidence);
  if (reviewed) return { kind: 'overview', label: 'Plain-language summary', text: reviewed };

  const fact = (label: string) => evidence.facts.find(item => item.label === label)?.value;
  const parts = sentences(evidence.abstract);
  if (article.sourceId === 'cisa') {
    const cve = fact('CVE');
    const description = sourceExcerpt(parts, 0, 0, 50, 110);
    if (!cve || !description) return undefined;
    const vendor = fact('Vendor');
    const product = fact('Product');
    const name = vendor && product?.toLowerCase().startsWith(vendor.toLowerCase()) ? product : [vendor, product].filter(Boolean).join(' ');
    const action = fact('CISA required action');
    const actionExcerpt = action ? sourceExcerpt(sentences(action), 0, 0, 35, 100) : '';
    const vendorAction = action && /^Apply mitigations in accordance with vendor instructions\b/i.test(action);
    const due = fact('Federal agency due date');
    return {
      kind: 'overview',
      label: 'CISA record summary',
      text: [
        `CISA lists ${cve}${name ? ` in ${name}` : ''} as a known exploited vulnerability.`,
        description,
        vendorAction ? 'Follow the vendor’s mitigation instructions and check CISA’s full requirements.' :
          actionExcerpt ? `CISA’s instructions: ${actionExcerpt}` :
          action ? 'See the linked CISA record for the required action.' : '',
        due ? `Covered U.S. federal agencies have a ${due} remediation deadline.` : '',
      ].filter(Boolean).join(' '),
    };
  }

  const excerpt = article.kind === 'research' ? researchExcerpt(parts) : sourceExcerpt(parts);
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
  if (result.status !== 'available') return { ...base, status: result.status, reason: result.reason };
  const evidence = result.evidence;
  const summary = composeBriefSummary(article, evidence);
  if (!summary) return { ...base, status: 'unavailable', reason: 'The approved record does not contain enough usable detail for a brief.' };
  return { ...base, status: 'ready', summary, evidence };
}
