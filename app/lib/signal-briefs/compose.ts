import { createHash } from 'node:crypto';
import type { NewsArticle } from '../news/types';
import type { EvidenceResult, SignalBrief } from './types';
import { composePerspective } from './perspective';

// Changing the evidence policy or wording invalidates both cache layers. The
// digest is deliberately extractive: it cannot invent facts or citation URLs.
export const BRIEF_VERSION = 'signal-primary-digest-2';

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

export function composeSignalBrief(article: NewsArticle, result: EvidenceResult, now = new Date().toISOString()): SignalBrief {
  const base = { version: BRIEF_VERSION, articleId: article.id, fingerprint: briefFingerprint(article), generatedAt: now };
  if (result.status !== 'available') return { ...base, status: result.status, reason: result.reason, introduction: '', digest: '', context: '' };
  const evidence = result.evidence;
  const digest = abridgeAbstract(evidence.abstract);
  // An empty or overlong sentence is not silently transformed into a fabricated
  // summary. Structured catalog/document facts can still support a useful brief.
  if (!digest && !evidence.facts.length) return { ...base, status: 'unavailable', reason: 'The approved record does not contain enough usable detail for a brief.', introduction: '', digest: '', context: '' };
  const introduction = article.kind === 'research'
    ? 'This research brief brings together the registered abstract and publication details. It covers the metadata record, rather than a review of the full paper.'
    : article.kind === 'advisory'
      ? 'This security brief organizes the matching CISA catalog record into a short reading view. The details below describe the catalog entry, not an assessment of your systems.'
      : article.kind === 'policy'
        ? 'This policy brief organizes the matching Federal Register record, including its document type and any dates supplied by the source. Consult the official publication for the complete text.'
        : 'This brief organizes the matching agency announcement and its publication details. The original source remains the authority for its full scope.';
  const perspective = composePerspective(article, evidence);
  return { ...base, status: 'ready', introduction, digest, context: perspective.relevance, perspective, evidence };
}
