import type { NewsArticle } from './types';

const superscriptDigits = '⁰¹²³⁴⁵⁶⁷⁸⁹';

export function formatNewsTitle(article: Pick<NewsArticle, 'sourceId' | 'title'>, title = article.title): string {
  if (article.sourceId !== 'arxiv' && article.sourceId !== 'arxiv-integrations') return title;
  // Convert simple numeric superscripts in arXiv titles for display only.
  // Keep source metadata and other formulas intact.
  return title.replace(/(?<![\\$])\$\^(?:\{(\d+)\}|(\d))\$(?!\$)/g, (_markup, group: string, digit: string) =>
    Array.from(group ?? digit, value => superscriptDigits[Number(value)]).join(''),
  );
}
