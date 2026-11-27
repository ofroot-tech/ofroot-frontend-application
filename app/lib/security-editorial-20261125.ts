import type { SecurityArticleContent } from './application-security-content';

const newsPath = '/news/drupal-installer-exploited-vulnerability-update';
const guidePath = '/blog/close-setup-routes-after-installation';
const sources = [
  { label: 'CISA Known Exploited Vulnerabilities catalog: Drupal core, added November 24', href: 'https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json' },
  { label: 'Drupal security advisory SA-CORE-2026-017', href: 'https://www.drupal.org/sa-core-2026-017' },
  { label: 'Drupal: Securing the installer, updated November 27', href: 'https://www.drupal.org/docs/administering-a-drupal-site/security-in-drupal/securing-the-installer-installphp' },
  { label: 'OWASP Authorization Cheat Sheet', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html' },
];

export const DRUPAL_INSTALLER_NEWS: SecurityArticleContent = {
  publishedAt: '2026-11-27', sourcesCheckedAt: '2026-11-27', kind: 'news',
  slug: 'drupal-installer-exploited-vulnerability-update', href: newsPath,
  title: 'CISA lists Drupal installer flaw as exploited',
  label: 'Signal / Advisory update',
  description: 'The November 24 catalog addition, the earlier Drupal advisory and practical checks for application owners.',
  summary: 'CISA added Drupal core vulnerability CVE-2026-132165 to its Known Exploited Vulnerabilities catalog on November 24. Drupal says that, under specific conditions, an attacker can use the installer to attempt reinstallation, potentially taking over a site or executing code. Its advisory already reports exploitation on live sites.',
  summarySourceIds: [1, 2],
  sections: [
    {
      id: 'dates', title: 'The catalog update is new; the advisory is earlier',
      paragraphs: ['Drupal published its advisory on November 18. Its updated text reports exploitation as early as November 19 at 19:00 UTC. CISA’s November 24 listing is a later exploitation signal, rather than a claim that the attack first happened that day.', 'CISA’s entry shows a November 27 remediation date and a forensic-triage flag under its referenced federal directive. Covered federal teams should consult those requirements. That date is not a universal deadline for every Drupal customer.'],
      sourceIds: [1, 2],
    },
    {
      id: 'updates', title: 'Check the supported release and installer protection',
      paragraphs: ['The advisory names fixes in Drupal 10.6.22, 11.3.22 and 11.4.13 for their respective release lines. Older unsupported branches need a supported upgrade path. Restrictive settings.php permissions mitigate some attack paths, not all of them.', 'Drupal also recommends securing the installer after setup. Its separate guide explains route blocking and verification, including preserving ordinary site and database-update functions. Check the current vendor instructions for your hosting configuration.'],
      sourceIds: [2, 3],
    },
    {
      id: 'scope', title: 'What these sources do not establish',
      paragraphs: ['The catalog and advisory do not identify affected U.S. organizations, quantify stolen data or establish exposure of health information. The phrase “under specific conditions” matters: finding Drupal in an inventory does not prove that a particular site was compromised.', 'If the advisory applies to your deployment, use your security team’s response process and vendor guidance to assess it. Preserve relevant evidence before routine cleanup when compromise is suspected.'],
      sourceIds: [1, 2],
    },
    {
      id: 'engineering-reading', title: 'OfRoot’s reading: setup is a separate access boundary',
      paragraphs: ['The broader engineering question is whether an application keeps setup closed after it is configured, including when a dependency fails. The companion guide proposes a small, isolated check of that boundary. This is OfRoot’s general review method, not a reproduction of the Drupal exploit.', 'OWASP recommends denying access by default, checking permission on every request and handling authorization failures safely. Those principles also help frame a review of installation and initial-setup paths.'],
      sourceIds: [4],
    },
  ],
  sourceNote: 'Sources checked November 27. Advisory, exploitation-report and catalog dates are distinct. OfRoot’s review method is separate analysis.',
  sources,
};

export const SETUP_ROUTE_GUIDE: SecurityArticleContent = {
  publishedAt: '2026-11-27', sourcesCheckedAt: '2026-11-27', kind: 'guide',
  slug: 'close-setup-routes-after-installation', href: guidePath,
  title: 'Close setup routes after installation',
  label: 'Application security / Practical guide',
  description: 'A practical check for setup endpoints that should stay closed once your application is running.',
  summary: 'Map the routes that can initialize an application, write its configuration or create its first administrator. After setup is complete, verify that unauthorized requests cannot reopen those paths. Use an isolated copy and synthetic data, check expected failures as well as normal operation, and confirm the protection survives deployment.',
  sections: [
    {
      id: 'context', title: 'Find the paths that can initialize the application',
      paragraphs: ['Drupal’s installer advisory is one reason to review this boundary. The method below is OfRoot’s broader engineering guidance; it does not claim that other frameworks have the same vulnerability.', 'Choose one application and list its browser installer, initialization API, configuration writer and first-administrator flow. Record which paths are needed only during provisioning and which maintenance tasks must remain available. Include aliases, redirects and any alternate route to the same handler.'],
      sourceIds: [2],
    },
    {
      id: 'safe-environment', title: 'Use an isolated copy before changing anything',
      paragraphs: ['Setup checks can alter databases, configuration and accounts. Agree on the test scope and use an isolated environment with synthetic data, test credentials and a recoverable starting point. Keep production services and customer records out of the experiment.', 'Define the expected result before each check: setup is complete, an unauthorized request is denied, configuration stays unchanged and the normal application still works. Record any check that cannot safely be performed as unverified.'],
    },
    {
      id: 'server-boundary', title: 'Enforce the boundary on the server',
      paragraphs: ['A hidden setup link does not prevent a direct request. Check the server or gateway rule and the application’s own decision about who may initialize it. OWASP’s guidance is to deny access by default and validate permission on every request.', 'For Drupal, use its current installer guide rather than a broad rule that also blocks required maintenance. The guide checks /core/install.php, the /install.php redirect and suffix paths such as /core/install.php/foo. These should end in a 403 or 404 response while the site and approved database updates still work.'],
      sourceIds: [3, 4],
    },
    {
      id: 'failure-states', title: 'Check what happens when a dependency fails',
      paragraphs: ['In the isolated copy, use the test environment’s controls to simulate an unavailable database or configuration service. Confirm the application returns an appropriate failure and keeps setup closed. A lookup error should not be treated as proof that a new installation is permitted.', 'Repeat the check for the relevant roles and entry paths, then restore the dependency and verify normal use. This is a general test of safe failure behavior, not a statement about the specific conditions behind the Drupal vulnerability.'],
      sourceIds: [4],
    },
    {
      id: 'deployment', title: 'Make the protection survive the next release',
      paragraphs: ['Check the deployed artifact and hosting configuration, not only a developer’s local rule. Drupal’s current guide recommends removing the installer file and blocking it at the web server because the two controls cover different failure modes. It warns that dependency or scaffold operations can restore installer files or replace manual configuration edits.', 'Repeat the narrow checks after an ordinary deployment in the test environment. Confirm that the intended installer restrictions remain and that authorized maintenance still succeeds. Keep a rollback path that restores service without reopening public setup.'],
      sourceIds: [3],
    },
    {
      id: 'handoff', title: 'Leave a clear result for the application owner',
      paragraphs: ['Record the tested version, environment, routes, roles, expected responses and observed result. Note whether configuration or account state changed and keep evidence free of live secrets and customer data.', 'Give each unresolved path an owner and next action. Passing this review supports one access-control decision; it does not establish that the entire application is secure. Include setup and maintenance boundaries in a wider application-security engagement when they affect the risk you need to assess.'],
    },
  ],
  sources,
};
