import type { SecurityArticleDraft } from './application-security-content';

const newsPath = '/news/doj-sms-phishing-sentencing-november-2026';
const guidePath = '/blog/review-account-recovery-and-mfa-changes';
const sources = [
  { label: 'DOJ sentencing release, November 17, 2026', href: 'https://www.justice.gov/usao-cdca/pr/british-national-sentenced-6-years-federal-prison-hacking-companies-and-stealing-least' },
  { label: 'NIST SP 800-63B-4, phishing resistance', href: 'https://pages.nist.gov/800-63-4/sp800-63b.html#phishing' },
  { label: 'OWASP Multifactor Authentication Cheat Sheet, changing factors', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#changing-mfa-factors' },
];

export const SMS_PHISHING_NEWS_DRAFT: SecurityArticleDraft = {
  status: 'draft', preparedAt: '2026-11-18', sourcesCheckedAt: '2026-11-18', kind: 'news',
  slug: 'doj-sms-phishing-sentencing-november-2026', href: newsPath,
  title: 'DOJ sentencing update highlights SMS phishing and account recovery risk',
  label: 'Signal / Security case update',
  description: 'A November 17 court update on older U.S. intrusions, with practical questions for sign-in and recovery reviews.',
  summary: 'The Justice Department reports a 72-month sentence on November 17, 2026 in a case involving SMS phishing and SIM swapping. The underlying conduct ran from September 2021 to April 2023. This is a sentencing update about historical intrusions, not a newly reported November breach.',
  summarySourceIds: [1],
  sections: [
    {
      id: 'confirmed', title: 'What DOJ reports',
      paragraphs: ['The release describes stolen employee credentials and phone-number takeovers used to access accounts. DOJ reports at least $11.6 million in stolen virtual currency from U.S. individual victims.'],
      sourceIds: [1],
    },
    {
      id: 'scope', title: 'What the update does not establish',
      paragraphs: ['The release does not establish that your company is affected or that a new nationwide campaign began this week. Its publication date and the dates of the underlying conduct describe different events.'],
      sourceIds: [1],
    },
    {
      id: 'engineering-reading', title: 'OfRoot’s reading: review the routes around sign-in',
      paragraphs: ['Treat this as a reason to check your own controls, not evidence of compromise. Identify how someone can recover an account, replace an authentication factor or change a trusted phone number. Review each route with the people who operate it.', 'NIST distinguishes phishing-resistant authentication from manually entered one-time codes. OWASP recommends reauthentication with an enrolled factor before factor changes and warns against relying only on an active session. These are engineering references, not findings about a particular customer.'],
      sourceIds: [2, 3],
    },
    {
      id: 'next-review', title: 'Choose a bounded next check',
      paragraphs: ['Use the companion guide to turn one recovery path into a small, authorized review with synthetic accounts, clear expected results and a record of what remains untested. If you suspect an active incident, involve your security or incident-response team before treating a configuration change as the complete response.'],
      points: ['Map the recovery and factor-change paths you actually operate.', 'Keep case facts separate from assumptions about your systems.', 'Record the tested environment and have a person review the evidence.'],
    },
  ],
  sourceNote: 'DOJ supplies the case facts. OfRoot’s suggested checks are separate analysis.',
  sources,
};

export const ACCOUNT_RECOVERY_GUIDE_DRAFT: SecurityArticleDraft = {
  status: 'draft', preparedAt: '2026-11-18', sourcesCheckedAt: '2026-11-18', kind: 'guide',
  slug: 'review-account-recovery-and-mfa-changes', href: guidePath,
  title: 'Review account recovery as carefully as sign-in',
  label: 'Application security / Practical guide',
  description: 'A small review plan for password resets, authentication-factor changes and the support processes around them.',
  summary: 'An account’s protection includes the ways someone can get back in or change its security settings. Map those routes, choose authentication that fits the risk, and test the transitions with synthetic accounts. Keep a clear record of expected behavior, observed results and unresolved questions.',
  sections: [
    {
      id: 'context', title: 'Why review this now?',
      paragraphs: ['Our companion summary covers DOJ’s November 17 sentencing update about intrusions from 2021–2023. The case is context for this guide, not evidence that your application is compromised. The checks below are OfRoot’s engineering recommendations.'],
      sourceIds: [1],
    },
    {
      id: 'map', title: 'Map every way back into an account',
      paragraphs: ['List password resets, lost-factor recovery, phone-number updates, new-device enrollment and support-assisted recovery. For each route, identify the requesting role, the proof required and the access granted after completion.', 'Include the systems your team depends on, such as the identity provider and support console. An application review should identify who owns those controls before proposing changes.'],
    },
    {
      id: 'authentication', title: 'Choose a phishing-resistant option where it fits',
      paragraphs: ['NIST explains that manually entered one-time codes are not phishing-resistant. Its guidance describes cryptographic methods that bind authentication to the legitimate verifier. Evaluate an appropriate passkey or security-key implementation for sensitive roles, including the recovery path that supports it.', 'Do not describe a stronger sign-in method as a complete solution. Record fallback behavior, provider dependencies and the cases your team has not tested. NIST assurance-level requirements have their own scope; citing the guidance does not certify your application.'],
      sourceIds: [2],
    },
    {
      id: 'factor-changes', title: 'Protect changes to authentication factors',
      paragraphs: ['OWASP treats factor replacement as a high-risk action. It recommends reauthentication with an existing enrolled factor and additional risk checks rather than trusting the current session alone.', 'Review how a request reaches support, what evidence an operator checks and who can approve an exception. Agree on an escalation path for cases the normal process cannot safely resolve.'],
      sourceIds: [3],
    },
    {
      id: 'test', title: 'Test one transition with synthetic accounts',
      paragraphs: ['Choose an authorized test environment and a single change, such as replacing an enrolled factor. Write down what an authorized user should be able to do and what a different user or incomplete request must not be able to do. Exercise both paths and preserve only the evidence needed for review.', 'Check that legitimate recovery still works after a fix. Record the version, owner, rollback approach and any excluded provider behavior. Keep real customer records and live recovery secrets out of test fixtures and shared reports.'],
    },
    {
      id: 'scanner-limits', title: 'Use repository checks for the questions they can answer',
      paragraphs: ['OfRoot Repository Check can flag selected credential and code patterns in a staged Git snapshot. It does not test phone-number ownership, a support conversation, an identity-provider configuration or the full recovery workflow. Its report is one input to human review.', 'Use an application security engagement when you need help tracing these paths, fixing findings or arranging an authorized penetration test with approved specialists.'],
    },
  ],
  sources,
};
