export type NewsCategory = 'ai' | 'integrations' | 'healthcare' | 'policy' | 'cybersecurity';
export type NewsKind = 'reporting' | 'research' | 'release' | 'policy' | 'advisory';

export type NewsArticle = {
  id: string;
  title: string;
  url: string;
  sourceId: string;
  category: NewsCategory;
  publishedAt: string | null;
  kind: NewsKind;
  author?: string;
};

export type NewsSource = {
  id: string;
  name: string;
  homepage: string;
  categories: NewsCategory[];
  enabled: boolean;
  rights: { status: 'approved' | 'pending'; basis: string; termsUrl: string };
  feedUrl?: string;
};

export type NewsSourceHealth = {
  sourceId: string;
  status: 'ok' | 'error' | 'pending';
  checkedAt: string;
  lastSuccessfulAt?: string;
  message?: string;
};

export type NewsSnapshot = {
  articles: NewsArticle[];
  sources: NewsSource[];
  checkedAt: string;
  lastSuccessfulAt: string | null;
  status: 'live' | 'partial' | 'unavailable' | 'stale';
  sourceHealth: NewsSourceHealth[];
  storage: 'postgres' | 'memory';
  storageMessage?: string;
  refreshState?: 'completed' | 'in_progress' | 'failed';
};
