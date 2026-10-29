import type { NewsCategory } from '@/app/lib/news/types';
import type { SignalContent } from '@/app/lib/signal-subscriptions/types';

/** The preview explains the product before a reader shares their mailbox.
 * These are explicitly illustrative scenarios, never invented current news.
 * It receives reading preferences only and has no transport or storage. */
const examples: Record<NewsCategory, { title: string; detail: string }> = {
  ai: { title: 'A closer look at an AI research release', detail: 'A short source digest, the limits of the evidence, and questions to consider before testing a model.' },
  integrations: { title: 'An API change worth checking', detail: 'What the primary release record changes, which versions it names, and what to check in your connected systems.' },
  healthcare: { title: 'A healthcare announcement, in context', detail: 'The agency record, its stated scope, and a clear distinction between an announcement and clinical evidence.' },
  policy: { title: 'A technology rule with dates to watch', detail: 'The official document type, jurisdiction, named dates, and a direct path to the complete publication.' },
  cybersecurity: { title: 'A security advisory to compare with your inventory', detail: 'The named product and vulnerability, the agency guidance, and the source to consult for next steps.' },
};

export type DigestPreviewItem = { topic: NewsCategory; kind: 'brief' | 'insight'; title: string; detail: string };

export function buildDigestPreview(topics: NewsCategory[], content: SignalContent): DigestPreviewItem[] {
  const selected = Array.from(new Set(topics)).filter(topic => topic in examples);
  const items: DigestPreviewItem[] = [];
  if (content !== 'insights') {
    for (const topic of selected.slice(0, content === 'both' ? 2 : 3)) items.push({ topic, kind: 'brief', ...examples[topic] });
  }
  if (content !== 'briefs' && selected.length) {
    const topic = selected[0];
    items.push({ topic, kind: 'insight', title: `An OfRoot guide for your ${topic === 'ai' ? 'AI' : topic} decisions`, detail: 'Original practical writing, with useful questions, clear sources, and a link to read the complete article.' });
  }
  return items;
}
