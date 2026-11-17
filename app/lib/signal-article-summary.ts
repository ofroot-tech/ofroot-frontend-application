import { AI_PROCESS_GUIDE } from './ai-process-guide';
import { insights } from './insights-content';
import { SECURITY_GUIDE } from './application-security-content';
import type { PilotArticle } from './signal-pilot';

/** Short versions use the published guide itself, never a title-only rewrite.
 * Keep existing narration transcripts stable while adding readable takeaways. */
export function ofrootArticleTakeaways(article: PilotArticle): string[] {
  if (article.sourcePath === SECURITY_GUIDE.href) {
    return [
      'Agree the targets, methods, tester and written authorization before active testing.',
      'Use a review and an authorized penetration test to answer different security questions.',
      'Rank findings by evidence and impact, assign fixes, and retest the affected behavior.',
      'Record the tested version, exclusions and unresolved findings; a report is not a security guarantee.',
    ];
  }
  if (article.sourcePath === AI_PROCESS_GUIDE.href) {
    return [
      'Map one unit of work from its trigger to its outcome, including owners, delays and exceptions.',
      'Count labor, delay, rework and error exposure using approved assumptions.',
      'Compare value, feasibility, risk and adoption before choosing the first automation.',
      'Build the smallest reversible change and compare the same measurements after launch.',
    ];
  }
  const insight = insights.find(item => `/insights/${item.slug}` === article.sourcePath);
  return insight?.outline.flatMap(section => section.points.slice(0, 1)).slice(0, 4) ?? [];
}
