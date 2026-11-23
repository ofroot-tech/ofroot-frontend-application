import type { SecurityArticleDraft } from './application-security-content';

const newsPath = '/news/n-able-mail-assure-recovery-update';
const guidePath = '/blog/verify-saas-recovery-beyond-the-status-page';
const sources = [
  { label: 'N-able: Mail Assure incident update, November 22, 2026', href: 'https://www.n-able.com/blog/mail-assure-incident-update' },
  { label: 'OWASP Logging Cheat Sheet', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html' },
];

export const MAIL_ASSURE_NEWS_DRAFT: SecurityArticleDraft = {
  status: 'draft', preparedAt: '2026-11-23', sourcesCheckedAt: '2026-11-23', kind: 'news',
  slug: 'n-able-mail-assure-recovery-update', href: newsPath,
  title: 'N-able reports restored Mail Assure dashboard and API access',
  label: 'Signal / Vendor recovery update',
  description: 'What the November 22 update confirms, what remains open and how to plan a useful recovery check.',
  summary: 'N-able says it restored Mail Assure and SpamExperts dashboard and API access on November 21 at 23:45 UTC after a security incident. Its November 22 update says email delivery and spam filtering continued. The investigation remains open.',
  summarySourceIds: [1],
  sections: [
    {
      id: 'confirmed', title: 'What changed in the vendor update',
      paragraphs: ['The update is dated November 22 at 2:30 p.m. EST. N-able reports fixing a vulnerability, finding no evidence of exploitation beyond one N-able-hosted server and engaging outside forensic investigators. It links CVE-2026-134624 and says a root-cause report is being prepared.'],
      sourceIds: [1],
    },
    {
      id: 'scope', title: 'Which questions still need an answer',
      paragraphs: ['The statement does not identify affected U.S. customers or establish the intrusion dates or entry point. Its limited finding about exploitation does not resolve each tenant’s exposure.', 'If your team uses either service, ask the provider for the notice and next steps that apply to your tenant. A vulnerability record alone cannot establish whether your organization was compromised.'],
      sourceIds: [1],
    },
    {
      id: 'engineering-reading', title: 'OfRoot’s reading: check the work behind the dashboard',
      paragraphs: ['A reachable dashboard answers one recovery question. Your team still needs evidence that the permitted business workflow works and that its access rules hold. Check those separately from the provider’s investigation.', 'The companion guide proposes a small, authorized test using synthetic data, expected outcomes and an owner for open questions. OWASP’s logging guidance supports recording useful event outcomes while protecting sensitive data. These are OfRoot’s engineering recommendations, not additional vendor findings.'],
      sourceIds: [2],
    },
  ],
  sourceNote: 'Source checked November 23. OfRoot’s recovery method is separate engineering analysis.',
  sources,
};

export const SAAS_RECOVERY_GUIDE_DRAFT: SecurityArticleDraft = {
  status: 'draft', preparedAt: '2026-11-23', sourcesCheckedAt: '2026-11-23', kind: 'guide',
  slug: 'verify-saas-recovery-beyond-the-status-page', href: guidePath,
  title: 'Verify SaaS recovery beyond the status page',
  label: 'Application security / Practical guide',
  description: 'A small recovery check for the business workflow, access rules and evidence your team depends on.',
  summary: 'After a software provider restores access, check one important workflow from start to finish. Define its expected result, use an authorized test account and synthetic data, verify both allowed and denied actions, and record the evidence. Track unanswered incident questions separately from the workflows you have actually tested.',
  sections: [
    {
      id: 'context', title: 'Start with the workflow you need back',
      paragraphs: ['N-able reports restored management access while its investigation continues. This general method is OfRoot’s analysis.', 'Choose one important workflow, such as reviewing a test item in an admin console or synchronizing a synthetic record through an API. Name its owner, normal input, expected output and relevant user roles. Keep the check small enough to assess clearly.'],
      sourceIds: [1],
    },
    {
      id: 'boundaries', title: 'Agree on a safe test',
      paragraphs: ['Use a sandbox or test tenant when available. Obtain permission for the environment, accounts, actions and data involved. If a production check is necessary, agree its scope, stop conditions, cleanup and rollback first.', 'Use synthetic records and test destinations. Do not send customer mail, replay real payloads, change live routing or rotate shared credentials as part of an unapproved check. Follow customer-specific vendor instructions through your normal change process.'],
    },
    {
      id: 'workflow', title: 'Check the outcome, not only the response code',
      paragraphs: ['Sign in with the intended role and complete the selected workflow. For an API, compare the stored result and the visible result with the original test request. A successful HTTP response does not establish that the right record was saved or that a downstream step completed.', 'Check relevant retries with harmless test identifiers: one accepted request should produce the intended result without duplicate work. Note missing history, delayed updates or reconciliation needs rather than marking the whole service recovered after one successful screen loads.'],
    },
    {
      id: 'access', title: 'Test an action the account should be denied',
      paragraphs: ['In the same authorized test scope, try a relevant restricted action with a lower-privilege test account. It might be changing a setting reserved for an administrator or reading a synthetic record owned by another test tenant. Confirm the server denies the action, not merely that the interface hides a button.', 'Do not probe unrelated tenants or customer records. Record any test you cannot safely perform as unverified, with the owner who can resolve it.'],
    },
    {
      id: 'evidence', title: 'Keep useful evidence without copying secrets',
      paragraphs: ['Record the environment, tested version or time, role, synthetic request identifier, expected result and observed result. OWASP recommends capturing security-relevant actions and outcomes, checking that logging works and restricting access to logs.', 'Keep passwords, access tokens and sensitive personal data out of ordinary logs and handoff notes. Preserve the records your response and retention policies require; do not delete potential incident evidence as routine test cleanup.'],
      sourceIds: [2],
    },
    {
      id: 'handoff', title: 'Separate a passed check from an open investigation',
      paragraphs: ['Share a short handoff: which workflow passed, which access rule was checked, what remains untested and who owns each next step. Include an approved rollback or escalation path if the workflow fails again.', 'Keep the provider’s incident scope, cause and customer-specific instructions on a separate follow-up list. A successful workflow test supports that particular recovery decision; it does not prove the absence of compromise.'],
    },
  ],
  sources,
};
