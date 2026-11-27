/** A discovery reference and the evidence behind a brief are separate records.
 * Only an exact, approved primary record can support substantive brief text. */
export type BriefEvidence = {
  url: string;
  retrievalUrl: string;
  publisher: string;
  title: string;
  publishedAt: string | null;
  fetchedAt: string;
  license: string;
  scope: string;
  abstract: string;
  facts: { label: string; value: string }[];
  caveats: string[];
  contentHash: string;
};

export type EvidenceResult =
  | { status: 'available'; evidence: BriefEvidence }
  | { status: 'unsupported' | 'unavailable'; reason: string };

/** A source-bound reading preview. Excerpts retain complete source sentences;
 * overviews use structured details or a reviewed summary of the record. */
export type BriefSummary = { text: string; label: string; kind: 'overview' | 'excerpt' };

export type SignalBrief = {
  version: string;
  articleId: string;
  fingerprint: string;
  generatedAt: string;
  status: 'ready' | 'unsupported' | 'unavailable';
  reason?: string;
  summary?: BriefSummary;
  evidence?: BriefEvidence;
};
