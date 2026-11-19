export type SecurityArticleContent = {
  kind: 'guide' | 'news';
  slug: string;
  href: string;
  title: string;
  description: string;
  label: string;
  publishedAt: string;
  modifiedAt?: string;
  sourcesCheckedAt?: string;
  sourceNote?: string;
  summary: string;
  summarySourceIds?: number[];
  sections: Array<{ id: string; title: string; paragraphs: string[]; points?: string[]; sourceIds?: number[] }>;
  sources: Array<{ label: string; href: string }>;
};

export type SecurityArticleDraft = Omit<SecurityArticleContent, 'publishedAt' | 'modifiedAt'> & {
  status: 'draft';
  preparedAt: string;
};

export const SECURITY_SERVICE_PATH = '/services/application-security';

export const SECURITY_GUIDE: SecurityArticleContent = {
  kind: 'guide',
  slug: 'application-security-review-and-penetration-testing',
  href: '/blog/application-security-review-and-penetration-testing',
  title: 'Application security: from review to penetration test to verified fix',
  description: 'How to scope a web application or API security engagement, distinguish a review from a penetration test, and turn findings into checked fixes.',
  label: 'Application security guide',
  publishedAt: '2026-11-17',
  summary: 'Start by agreeing which applications, APIs, accounts and environments are in scope. Review how the software handles access, data and dependencies, then use an authorized penetration test to investigate realistic attack paths. Rank findings by evidence and business impact, assign fixes, and retest the affected behavior. A clean report describes the checks performed and their limits; it cannot guarantee that an application has no vulnerabilities.',
  sections: [
    {
      id: 'different-jobs', title: 'A review, a scan and a penetration test do different jobs.',
      paragraphs: [
        'A security review examines the application’s design, code and configuration. A vulnerability scan automates checks for known weaknesses. A penetration test uses a defined testing method to investigate whether weaknesses can be combined into an attack against an authorized target. Each contributes evidence, but none replaces the others.',
        'For example, a dependency scan may identify an outdated package. A code review can establish where it is used. A tester can investigate whether the affected behavior is reachable within the agreed scope. Engineering work then removes the weakness and checks that the fix preserves the application’s intended behavior.',
      ],
      points: ['Choose the question before choosing a tool.', 'Record what was tested, what was excluded and what remains uncertain.', 'Include remediation and retesting in the plan.'],
    },
    {
      id: 'scope', title: 'Agree on permission and boundaries first.',
      paragraphs: [
        'Testing starts with written permission from the system owner. List the domains, APIs, environments, user roles, testing window and permitted methods. Confirm any hosting-provider or third-party restrictions before a specialist begins work.',
        'Use representative test accounts and synthetic data where practical. If production testing is necessary, agree separately on safeguards, monitoring, stop conditions and an escalation contact. Destructive testing, social engineering and work against third-party systems need their own explicit authorization.',
        'OfRoot coordinates formal penetration testing with client-approved security specialists. The tester, availability, scope, confidentiality and data access are agreed before an engagement is committed. OfRoot owns the engineering follow-through and client communication.',
      ],
    },
    {
      id: 'review', title: 'Review the paths where trust changes.',
      paragraphs: [
        'Start where a request crosses a boundary: a visitor signs in, a user accesses a record, an uploaded file reaches a processor, or an integration receives permission to act. The important question is whether the server enforces the intended rule on every path.',
        'OWASP’s Application Security Verification Standard provides security requirements for web applications and services. Its Web Security Testing Guide provides testing guidance. Select relevant checks and record the standard version rather than presenting a checklist as a certification.',
      ],
      points: ['Authentication, sessions and account recovery.', 'Authorization across users, roles and tenant boundaries.', 'Input handling, uploads, APIs, webhooks and business rules.', 'Dependencies, secrets, logging and deployment configuration.', 'For AI features: source permissions, tool access and human approval.'],
      sourceIds: [1, 2],
    },
    {
      id: 'findings', title: 'Make every finding useful to the people fixing it.',
      paragraphs: [
        'A useful finding explains the affected component, the conditions needed, the observed behavior and the potential impact. Include enough evidence to reproduce it safely without circulating customer records or live credentials. Separate a demonstrated issue from a hypothesis that still needs investigation.',
        'Prioritize with the application’s actual exposure and business use in view. An internet-facing access-control failure may need immediate containment. An unused component may call for a different response. Record the owner and decision for each finding, including any accepted risk.',
      ],
    },
    {
      id: 'retest', title: 'Verify the fix and keep the evidence.',
      paragraphs: [
        'Retest the original failure and the neighboring permission or input rules. Check that the authorized workflow still works. A change to account recovery, for example, should prevent the reported abuse while still allowing the legitimate account owner to recover access.',
        'The closing report should show which findings were fixed, retested, deferred or left open. Keep deployment and rollback instructions with the engineering handoff. A test is a view of a defined system at a defined time; later releases and newly disclosed vulnerabilities can change the picture.',
      ],
      points: ['Record the tested version and environment.', 'Keep evidence of the original issue and the retest.', 'Set an owner for future dependency and security updates.'],
    },
  ],
  sources: [
    { label: 'OWASP Application Security Verification Standard 5.0.0', href: 'https://asvs.owasp.org/' },
    { label: 'OWASP Web Security Testing Guide', href: 'https://owasp.org/projects/web-security-testing-guide' },
  ],
};

export const SECURITY_NEWS: SecurityArticleContent = {
  kind: 'news',
  sourcesCheckedAt: '2026-11-17',
  slug: 'security-briefing-november-2026',
  href: '/news/security-briefing-november-2026',
  title: 'Security briefing: exploited vulnerabilities and web application updates',
  description: 'A November 17, 2026 reading of recent CISA, Next.js and PHP security records, with short summaries, source dates and practical questions for application owners.',
  label: 'Signal / Security briefing',
  publishedAt: '2026-11-17',
  summary: 'Recent security records give application owners three useful checks: compare exposed systems with CISA’s exploited-vulnerability catalog, verify framework and runtime updates, and keep evidence of the deployed fix. The items below distinguish new November catalog entries from October vendor advisories that remain relevant. Each summary links to its primary source; applicability depends on the software and versions you actually run.',
  sections: [
    {
      id: 'cisa', title: 'November 17: CISA adds a Puppet Enterprise vulnerability.',
      paragraphs: [
        'CISA’s November 17 catalog adds CVE-2026-115731 in Perforce Puppet Enterprise. The entry describes report processing that can allow a client with a CA-signed agent certificate to execute code as the Puppet Server service user. If certificate requests are automatically signed without strong verification, a network attacker can obtain such a certificate. Recent November 13 additions also cover Check Point and UnrealIRCd. Catalog inclusion signals evidence of exploitation, not proof that a particular organization is compromised.',
        'OfRoot’s reading: match the exact products and versions to your inventory, then consult current vendor instructions. Keep infrastructure dependencies in an application review even when the application code itself is unchanged. Federal remediation dates are scoped to covered agencies; they are not universal customer deadlines.',
      ],
      sourceIds: [4, 1],
    },
    {
      id: 'nextjs', title: 'October 14: Next.js fixes upstream security issues.',
      paragraphs: [
        'Next.js’s October 14 advisory addresses two remote-code-execution issues and a denial-of-service issue involving specific App Router and image-processing paths. It identifies 15.5.28 and 16.4.1 as patched releases for the supported branches at that time. The exact conditions differ across the issues, so the advisory’s impact sections matter.',
        'OfRoot’s reading: inspect the deployed dependency tree and hosting configuration, check for newer security releases, and verify the rebuilt application. A patched version in a local package file does not establish which version is serving production traffic.',
      ],
      sourceIds: [2],
    },
    {
      id: 'php', title: 'October 21: PHP publishes critical runtime fixes.',
      paragraphs: [
        'PHP’s October 21 advisory describes CVE-2026-109618 and CVE-2026-109619, two critical issues that can permit unauthenticated remote code execution. It names fixes in PHP 8.5.12, 8.4.27, 8.3.36 and 8.2.35, and directs users of distribution-managed packages to their vendors. The advisory says mitigations do not replace an update.',
        'OfRoot’s reading: confirm the running web-worker version and the hosting vendor’s patch status, rather than relying only on a command-line version check. Review newer advisories and package rebuilds before choosing an update target; the versions named here describe the October release, not a permanent recommendation.',
      ],
      sourceIds: [3],
    },
    {
      id: 'next-check', title: 'Turn the news into a bounded engineering task.',
      paragraphs: ['For each relevant advisory, identify an owner, check affected versions and exposure, choose a tested change, and record the release and rollback path. If compromise is suspected, involve an incident-response specialist before treating patching as the complete response. A penetration test answers a separately scoped question about attack paths; it does not replace routine patching.'],
      points: ['Identify the asset and its actual deployed version.', 'Separate source facts from assumptions about your environment.', 'Retest the affected behavior and keep release evidence.'],
    },
  ],
  sources: [
    { label: 'CISA official KEV data mirror, catalog edition 2026.11.13', href: 'https://github.com/cisagov/kev-data/blob/574763c593fe6b0ba0fadd1805caa01cdc73deff/known_exploited_vulnerabilities.json' },
    { label: 'Next.js security update, October 14, 2026', href: 'https://nextjs.org/blog/nextjs-security-update-october-14-2026' },
    { label: 'PHP security advisory, October 21, 2026', href: 'https://www.php.net/archive/2026.php#2026-10-21-5' },
    { label: 'CISA Known Exploited Vulnerabilities catalog, edition 2026.11.17 checked November 17', href: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog' },
  ],
};
