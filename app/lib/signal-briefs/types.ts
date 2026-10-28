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

export type SignalBrief = {
  version: string;
  articleId: string;
  fingerprint: string;
  generatedAt: string;
  status: 'ready' | 'unsupported' | 'unavailable';
  reason?: string;
  introduction: string;
  digest: string;
  context: string;
  evidence?: BriefEvidence;
};
