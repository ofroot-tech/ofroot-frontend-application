import { AI_PROCESS_GUIDE } from './ai-process-guide';
import { insights } from './insights-content';
import { SECURITY_GUIDE } from './application-security-content';
import { ACCOUNT_RECOVERY_GUIDE } from './security-editorial-20261118';
import { THIRD_PARTY_SCRIPT_GUIDE } from './security-editorial-20261119';
import { BUILD_SYSTEM_RETIREMENT_GUIDE } from './security-editorial-20261122';
import { SETUP_ROUTE_GUIDE } from './security-editorial-20261125';
import type { PilotArticle } from './signal-pilot';
import { INBOUND_EMAIL_GUIDE } from './signal-weekly-20261126';

/** Short versions use the published guide itself, never a title-only rewrite.
 * Keep existing narration transcripts stable while adding readable takeaways. */
export function ofrootArticleTakeaways(article: PilotArticle): string[] {
  if (article.sourcePath === SETUP_ROUTE_GUIDE.href) {
    return [
      'Map installation, configuration and first-administrator routes, including alternate entry paths.',
      'Use an isolated environment and synthetic data to test denied requests and dependency failures.',
      'Keep setup restrictions in place through deployment while preserving authorized maintenance.',
      'Record the tested version, observed results, unresolved paths and rollback plan.',
    ];
  }
  if (article.sourcePath === INBOUND_EMAIL_GUIDE.href) return INBOUND_EMAIL_GUIDE.steps.map(step => step.takeaway);
  if (article.sourcePath === BUILD_SYSTEM_RETIREMENT_GUIDE.href) {
    return [
      'Inventory the jobs, identities, repositories and deployment targets before retiring a build system.',
      'Give the supported replacement only the permissions it needs, using temporary workload credentials where the platform supports them.',
      'Revoke obsolete credentials at their issuing service and verify removed access in an authorized test environment.',
      'Preserve required logs and record rollback through an approved deployment path and identity.',
    ];
  }
  if (article.sourcePath === ACCOUNT_RECOVERY_GUIDE.href) {
    return [
      'Map password resets, lost-factor recovery, phone-number changes and support-assisted recovery.',
      'Evaluate phishing-resistant authentication together with its fallback and recovery behavior.',
      'Protect factor replacement with existing-factor reauthentication and risk checks.',
      'Test an authorized transition with synthetic accounts and record exclusions and rollback.',
    ];
  }
  if (article.sourcePath === THIRD_PARTY_SCRIPT_GUIDE.href) {
    return [
      'Inventory the scripts loaded by one sensitive journey, including tag managers and embedded services.',
      'Review supplier-side publishing access and change history.',
      'Test a report-only Content Security Policy while retaining existing enforced protection; report-only does not block execution.',
      'Use synthetic data, verify the legitimate journey and keep a rollback ready.',
    ];
  }
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
