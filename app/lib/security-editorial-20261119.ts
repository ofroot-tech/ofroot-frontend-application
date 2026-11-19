import type { SecurityArticleContent } from './application-security-content';

const newsPath = '/news/optimizely-web-experimentation-incident-update';
const guidePath = '/blog/review-third-party-javascript-on-sensitive-pages';
const sources = [
  { label: 'Optimizely incident report, November 17; corrected November 18, 2026', href: 'https://pages.optimizely.com/rs/947-RKE-048/images/Security%20Incident%20Report%20-%20Optimizely%20Web%20Experimentation%20-%20Nov%2017%202026.pdf' },
  { label: 'OWASP Third Party JavaScript Management Cheat Sheet', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html' },
  { label: 'MDN: Content Security Policy', href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP' },
];

export const OPTIMIZELY_NEWS: SecurityArticleContent = {
  publishedAt: '2026-11-19', sourcesCheckedAt: '2026-11-19', kind: 'news',
  slug: 'optimizely-web-experimentation-incident-update', href: newsPath,
  title: 'Optimizely updates its Web Experimentation incident report',
  label: 'Signal / Vendor incident update',
  description: 'What the corrected November 18 report confirms, and which customer-specific questions remain open.',
  summary: 'Optimizely’s report says a November 16, 2026 signup-flow flaw enabled user impersonation and malicious JavaScript changes in some Web Experimentation projects. The original report is dated November 17 and was corrected November 18.',
  summarySourceIds: [1],
  sections: [
    {
      id: 'confirmed', title: 'What the vendor confirms',
      paragraphs: ['According to the vendor, injected code ran in visitors’ browsers on affected pages. It says the vulnerable path was closed and injected code removed on November 16. The correction revises investigation indicators and clarifies a blocking action.'],
      sourceIds: [1],
    },
    {
      id: 'scope', title: 'What remains uncertain',
      paragraphs: ['The report does not confirm data exfiltration or identify U.S.-specific victims. A customer’s exposure must be checked with Optimizely; using its software alone does not prove compromise.'],
      sourceIds: [1],
    },
    {
      id: 'engineering-reading', title: 'OfRoot’s reading: include browser-delivered code in the review',
      paragraphs: ['A repository is only part of a web application’s working code. Review which outside services can add scripts to sensitive pages, who can change their configuration and how your team would notice an unexpected change. These are OfRoot’s suggested checks, not findings about a reader’s application.', 'A Content Security Policy, or CSP, tells browsers which resources and behaviors a page permits. Its protection depends on the policy and the trust it grants. Allowing a supplier’s script does not establish that every future change from that supplier is safe.'],
      sourceIds: [2, 3],
    },
    {
      id: 'next-check', title: 'Start with the page and the evidence you actually have',
      paragraphs: ['If you use Web Experimentation, check your customer-specific notice and the current corrected report with your security team. Preserve relevant change history and follow your incident-response process when investigating suspected exposure.', 'For a preventive review, choose one sensitive page and use the companion guide to inventory its scripts, review permissions and test a policy without breaking the normal user journey.'],
    },
  ],
  sourceNote: 'Incident facts are the vendor’s account. OfRoot’s review suggestions are separate analysis.',
  sources,
};

export const THIRD_PARTY_SCRIPT_GUIDE: SecurityArticleContent = {
  publishedAt: '2026-11-19', sourcesCheckedAt: '2026-11-19', kind: 'guide',
  slug: 'review-third-party-javascript-on-sensitive-pages', href: guidePath,
  title: 'Review third-party JavaScript on your sensitive pages',
  label: 'Application security / Practical guide',
  description: 'A focused review of browser scripts, supplier permissions and a safe Content Security Policy rollout.',
  summary: 'Start with one important user journey. Identify the scripts it loads, who can change them and the controls that limit their behavior. Test changes with synthetic data and keep a rollback ready. A passing repository scan cannot answer all of these browser and supplier questions.',
  sections: [
    {
      id: 'context', title: 'Use the incident as context, not a diagnosis',
      paragraphs: ['Optimizely’s corrected incident report is context for this guide. It is not evidence that your site is affected. The review below is OfRoot’s engineering advice.'],
      sourceIds: [1],
    },
    {
      id: 'inventory', title: 'List the code your visitors actually receive',
      paragraphs: ['Choose an authorized test environment and trace one journey, such as checkout or account recovery. Record each script, its purpose and owner, including code introduced by tag managers and embedded services. Check the browser’s loaded resources as well as the repository.', 'Ask whether each script needs to run on that page. Record who can publish supplier-side changes and whether your team can review that history. OWASP’s guidance treats third-party JavaScript as part of the application’s security risk.'],
      sourceIds: [2],
    },
    {
      id: 'policy', title: 'Test a browser policy before enforcing it',
      paragraphs: ['A Content Security Policy restricts what a page may load or execute. MDN describes a report-only mode that reports policy violations without blocking them. Use it to observe compatibility before deciding what to enforce; report-only mode itself does not prevent execution.', 'Keep any existing enforced policy in place while evaluating a candidate. Test approved scripts and expected rejection cases. Do not treat a broad domain allowlist as proof that code served by an allowed supplier is trustworthy.'],
      sourceIds: [3],
    },
    {
      id: 'evidence', title: 'Keep the test useful and reversible',
      paragraphs: ['Use synthetic accounts and payment test modes. Confirm the legitimate journey still works, capture only the evidence needed and assign an owner to unresolved findings. Review what policy reports contain before sending them to another service; page addresses can carry private information.', 'Record the tested version, policy, exclusions and rollback. Have a person review the result before changing production. A quiet report can reflect limited test coverage, so write down what you exercised.'],
    },
    {
      id: 'review', title: 'Combine repository checks with application testing',
      paragraphs: ['OfRoot Repository Check reports selected patterns in staged Git content. It does not inspect a vendor account, monitor a live browser or establish whether an incident occurred.', 'OfRoot can help map these dependencies, fix findings and retest the workflow. Where a penetration test is useful, we arrange the authorized scope with approved security specialists.'],
    },
  ],
  sources,
};
