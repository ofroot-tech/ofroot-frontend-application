import type { SecurityArticleDraft } from './application-security-content';

const newsPath = '/news/optimizely-configured-commerce-build-server-incident';
const guidePath = '/blog/retire-build-systems-and-revoke-access';
const sources = [
  { label: 'Optimizely: Configured Commerce incident status record', href: 'https://status.optimizely.com/incidents/qyy4qsvxpp66' },
  { label: 'OWASP CI/CD Security Cheat Sheet', href: 'https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html' },
  { label: 'AWS IAM security best practices', href: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html' },
];

export const CONFIGURED_COMMERCE_NEWS_DRAFT: SecurityArticleDraft = {
  status: 'draft', preparedAt: '2026-11-22', sourcesCheckedAt: '2026-11-22', kind: 'news',
  slug: 'optimizely-configured-commerce-build-server-incident', href: newsPath,
  title: 'Optimizely reports a separate Configured Commerce incident',
  label: 'Signal / Vendor incident update',
  description: 'A dated vendor statement, with practical questions about retiring build systems and their access.',
  summary: 'Optimizely says unauthorized access to a retiring Configured Commerce build server occurred November 10–12, 2026. It reports removing an injected script from two sites and shutting down the server. The vendor describes this as separate from its Web Experimentation incident.',
  summarySourceIds: [1],
  sections: [
    {
      id: 'dates', title: 'Incident and update dates',
      paragraphs: ['The status record’s heading mentions November 19. Its visible posted timestamp is November 21 at 00:35 UTC. The vendor says it detected the activity on November 12 and its investigation is ongoing.'],
      sourceIds: [1],
    },
    {
      id: 'scope', title: 'Affected services and open questions',
      paragraphs: ['The record lists several regional service components, without identifying customers or U.S.-specific impacts. It does not establish whether data was exfiltrated.', 'If you use Configured Commerce, review customer-specific notices with your security team and ask the vendor which sites and exposure periods apply. A regional service label alone cannot determine your organization’s exposure.'],
      sourceIds: [1],
    },
    {
      id: 'engineering-reading', title: 'OfRoot’s reading: include access in the retirement plan',
      paragraphs: ['Build and deployment services can connect private repositories, artifact stores and production environments. When you replace one, map its remaining permissions and dependencies as well as the jobs it runs. This is a preventive review method, not an explanation of how this attacker gained access.', 'OWASP’s CI/CD guidance covers pipeline identities, secrets and least privilege. AWS also recommends temporary credentials for workloads and regular removal of unused identities and permissions. Use the guidance relevant to your own platform.'],
      sourceIds: [2, 3],
    },
    {
      id: 'next-review', title: 'Choose a controlled next check',
      paragraphs: ['The companion guide turns one retiring build system into a small review: identify its owner and dependencies, plan access removal, test the replacement and record the result. Use an authorized environment and synthetic data.', 'For suspected compromise, follow your incident-response process before deleting hosts or evidence. Routine decommissioning and an incident investigation can require different sequencing.'],
    },
  ],
  sourceNote: 'Vendor statement checked November 22. OfRoot’s suggested checks are separate analysis.',
  sources,
};

export const BUILD_SYSTEM_RETIREMENT_GUIDE_DRAFT: SecurityArticleDraft = {
  status: 'draft', preparedAt: '2026-11-22', sourcesCheckedAt: '2026-11-22', kind: 'guide',
  slug: 'retire-build-systems-and-revoke-access', href: guidePath,
  title: 'Retire build systems without leaving access behind',
  label: 'Application security / Practical guide',
  description: 'A focused plan for retiring build runners, deployment servers and the permissions that connect them.',
  summary: 'Retiring a build system includes its credentials, integrations and remaining permissions. Start with one system, identify its owner and dependencies, plan access removal and verify that the supported replacement still works. Keep an evidence trail and an approved rollback path.',
  sections: [
    {
      id: 'context', title: 'What prompted this guide',
      paragraphs: ['This guide accompanies our summary of Optimizely’s Configured Commerce update. The recommendations below are OfRoot’s engineering analysis; the vendor statement does not establish a finding about your systems.'],
      sourceIds: [1],
    },
    {
      id: 'inventory', title: 'Map one system and the access it carries',
      paragraphs: ['Choose an owned build runner or deployment server and record its owner, jobs, repositories, artifact stores and deployment targets. Include webhooks, scheduled jobs and service accounts that still depend on it.', 'Record credential identifiers and issuing services without copying secret values into the worksheet. Agree who can approve each change and which teams would be affected.'],
    },
    {
      id: 'replacement', title: 'Give the replacement only the access it needs',
      paragraphs: ['OWASP applies least privilege to pipeline secrets, connections between jobs and the account that runs them. Review each grant against the replacement’s actual work rather than copying the old system’s entire permission set.', 'For AWS workloads, IAM guidance recommends temporary credentials through roles and regular review of unused identities and access. Other platforms have their own supported identity methods; choose one your team can operate and revoke.'],
      sourceIds: [2, 3],
    },
    {
      id: 'remove-access', title: 'Remove access at the service that grants it',
      paragraphs: ['After the owners approve the sequence, stop obsolete jobs and remove the old system’s repository, storage and deployment grants. Revoke obsolete credentials through their issuing service. Removing a secret from a local file does not revoke the credential itself.', 'Check for shared credentials before changing them so the approved replacement and unrelated jobs continue to work. Preserve the logs and evidence your retention or incident-response process requires.'],
      sourceIds: [2, 3],
    },
    {
      id: 'verify', title: 'Test the intended workflow and the denied paths',
      paragraphs: ['Use an authorized test environment, synthetic data and a harmless test artifact. Confirm that the supported build can produce and deploy the expected artifact to its approved target. Check that the retired identity can no longer read the test repository or use the removed deployment permission.', 'Record the tested environment, identity, version and result. Keep production changes behind the normal review process and define rollback through a supported deployment path and an approved identity.'],
    },
    {
      id: 'evidence', title: 'Keep a clear handoff',
      paragraphs: ['Give the next owner the completed inventory, the evidence of access removal, unresolved dependencies and the rollback instructions. Schedule a follow-up check for unexpected use of the retired identity using the monitoring your team already operates.', 'A repository pattern check can support code review, but it does not establish the state of live cloud permissions, vendor accounts or retired servers. Include those systems in an application security engagement when they are part of the risk you need to assess.'],
    },
  ],
  sources,
};
