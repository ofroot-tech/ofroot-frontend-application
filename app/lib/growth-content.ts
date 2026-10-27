import type { Metadata } from 'next';
import { CANONICAL_SITE_URL } from '@/app/config/site';

export const SITE_URL = CANONICAL_SITE_URL;

const SOCIAL_IMAGE = {
  url: `${SITE_URL}/opengraph-image`,
  width: 1200,
  height: 630,
  alt: 'OfRoot — websites, integrations, and AI systems',
};

export type GrowthPageContent = {
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  summary: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  sections: Array<{
    eyebrow?: string;
    title: string;
    body: string;
    items?: Array<{ title: string; body: string }>;
    flow?: string[];
  }>;
  related: Array<{ label: string; href: string }>;
};

export function growthMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      type: 'website',
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SOCIAL_IMAGE.url],
    },
  };
}

export const growthPages: Record<string, GrowthPageContent> = {
  aiDiscoverability: {
    path: '/services/ai-discoverability',
    eyebrow: 'Marketing Websites & Growth',
    title: 'A stronger website. A clearer path to your customers.',
    description: 'OfRoot builds marketing websites, SEO, AEO, GEO, and ad campaign foundations with connected landing pages and measurement.',
    summary: 'Bring your website, content, search visibility, and advertising into one practical plan. Start with a clear offer and useful pages, then connect the channels and measurement that fit your audience.',
    primaryCta: { label: 'Discuss Your Website & Growth', href: '/book?focus=discoverability' },
    secondaryCta: { label: 'Explore the system', href: '#system' },
    sections: [
      {
        eyebrow: 'One system',
        title: 'Search, answers, and authority work together.',
        body: 'We do not split SEO, AEO, and GEO into disconnected retainers. We align the technical site, useful content, and third-party authority around the questions buyers actually ask.',
        items: [
          { title: 'SEO', body: 'Help search engines find, understand, and rank useful company content.' },
          { title: 'AEO', body: 'Structure content so search systems can extract accurate, direct answers.' },
          { title: 'GEO', body: 'Improve authority, consistency, and citation readiness across generative AI experiences.' },
        ],
      },
      {
        title: 'What we build',
        body: 'The exact scope depends on your audience, current website, content, and campaign needs.',
        items: [
          { title: 'Marketing websites', body: 'Responsive website design and development, clear service pages, focused landing pages, and accessible inquiry flows.' },
          { title: 'Search and answer foundations', body: 'Technical SEO, structured data, content architecture, direct answers, and consistent business information for SEO, AEO, and GEO.' },
          { title: 'Ads and measurement', body: 'Campaign setup and management, dedicated landing pages, conversion tracking, and reporting against the budget and goals you approve.' },
        ],
      },
      {
        title: 'What we measure',
        body: 'We measure business visibility and conversion together. Search rankings, AI citations, ad performance, and lead volume are not guaranteed. We agree on the measurement plan and learn from actual results.',
        items: [
          { title: 'Visibility', body: 'Search impressions, target-question visibility, rankings, AI mentions, and cited-source coverage.' },
          { title: 'Demand', body: 'Qualified organic leads, assisted conversions, and landing-page conversion rate.' },
          { title: 'Learning', body: 'Content gaps, source quality, and the questions buyers ask before they convert.' },
        ],
      },
    ],
    related: [
      { label: 'Generate Demand', href: '/solutions/generate-demand' },
      { label: 'Scan your website readiness', href: '/services/ai-audit' },
      { label: 'Read AI discoverability insights', href: '/insights' },
    ],
  },
  automationSystems: {
    path: '/services/automation-systems',
    eyebrow: 'Integrations & Internal Tools',
    title: 'Software that fits the way your team works.',
    description: 'OfRoot builds API integrations, internal applications, reporting, reconciliation, and workflow automation around your business.',
    summary: 'Connect useful tools and build what is missing. From operational case and job applications to multi-source reporting, the goal is clear records, visible ownership, and a workflow people can use.',
    primaryCta: { label: 'Discuss Your Workflow', href: '/book?focus=automation' },
    secondaryCta: { label: 'Explore capability examples', href: '/results' },
    sections: [
      {
        eyebrow: 'Example workflow',
        title: 'Every handoff has an owner and a signal.',
        body: 'We trace the full path, then strengthen the smallest points where leads, context, or accountability disappear.',
        flow: ['Ad or landing page', 'Lead captured', 'Lead qualified', 'CRM updated', 'Owner assigned', 'Follow-up sent', 'Performance measured'],
      },
      {
        title: 'What we connect',
        body: 'We preserve useful automation and improve the contracts between tools.',
        items: [
          { title: 'Internal applications', body: 'Case, job, and service workflows; document and task interfaces; role-aware records and operational views.' },
          { title: 'System integration', body: 'API integrations, data synchronization, response automation, and workflow monitoring.' },
          { title: 'Reporting and reconciliation', body: 'Multi-source dashboards, metric definitions, record reconciliation, source freshness, and explainable exceptions.' },
        ],
      },
      {
        title: 'Designed to stay understandable',
        body: 'An automation is only reliable when operators can see its state, understand its rules, and recover from failure.',
        items: [
          { title: 'Observable', body: 'Clear events, errors, and operational status replace silent failure.' },
          { title: 'Reversible', body: 'Small releases and explicit rollback paths limit production risk.' },
          { title: 'Owned', body: 'Each decision and exception has a visible rule and responsible team.' },
        ],
      },
    ],
    related: [
      { label: 'Convert More Leads', href: '/solutions/convert-more-leads' },
      { label: 'AI Process Audit', href: '/ai-process' },
      { label: 'Find what to automate first', href: '/blog/find-expensive-manual-work-before-automating' },
    ],
  },
  privateCompanyAi: {
    path: '/services/private-company-ai',
    eyebrow: 'AI Systems & Deployment',
    title: 'Useful AI, built into the way you work.',
    description: 'Build task-specific AI tools, connect approved knowledge and APIs, evaluate behavior, and plan deployment and operations.',
    summary: 'Private company AI helps teams use approved knowledge without turning every answer into a search project. Access follows company permissions, and important answers point back to their sources.',
    primaryCta: { label: 'Plan Your AI System', href: '/book?focus=private-ai' },
    secondaryCta: { label: 'Open the fictional demo', href: '/demo/private-ai' },
    sections: [
      {
        title: 'Three useful starting points',
        body: 'Start where missing context creates the most repeated work.',
        items: [
          { title: 'Company Knowledge AI', body: 'Turn SOPs, policies, documentation, proposals, and internal files into a searchable assistant.' },
          { title: 'Developer AI', body: 'Help teams understand repositories, architecture, components, documentation, and engineering standards.' },
          { title: 'Sales and Operations AI', body: 'Prepare proposals, summarize accounts, answer internal questions, and complete repetitive work from approved sources.' },
        ],
      },
      {
        eyebrow: 'Process',
        title: 'Connect. Organize. Deploy. Improve.',
        body: 'The system begins with approved sources and ends with measurable use.',
        items: [
          { title: '1. Connect', body: 'GitHub, Google Drive, HubSpot, internal APIs, Notion, and Slack.' },
          { title: '2. Organize', body: 'Group knowledge by brand, customer, department, product, project, and security level.' },
          { title: '3. Deploy', body: 'Plan hosting, CI/CD, access controls, monitoring, and rollback alongside the branded interface and source-backed workflow.' },
          { title: '4. Evaluate', body: 'Review answer quality, source grounding, failures, latency, and operating cost against agreed acceptance checks.' },
        ],
      },
      {
        title: 'Control is part of the product.',
        body: 'The right design depends on source sensitivity, user roles, model choices, and the actions the system may take.',
        items: [
          { title: 'Approved knowledge', body: 'Customer-controlled sources define what the system can retrieve.' },
          { title: 'Permission-aware answers', body: 'Users only retrieve content their role is allowed to access.' },
          { title: 'Human approval', body: 'Sensitive actions stay behind explicit review and authorization.' },
        ],
      },
    ],
    related: [
      { label: 'Unlock Company Knowledge', href: '/solutions/unlock-company-knowledge' },
      { label: 'Review security approach', href: '/security' },
    ],
  },
  generateDemand: {
    path: '/solutions/generate-demand', eyebrow: 'Generate Demand',
    title: 'Turn useful expertise into qualified demand.',
    description: 'Connect discoverability, landing pages, content systems, and conversion measurement around the questions your buyers already ask.',
    summary: 'Visibility is useful when the right audience understands your value and has a clear next step.',
    primaryCta: { label: 'Find Your Visibility Gaps', href: '/book?focus=generate-demand' },
    secondaryCta: { label: 'Explore AI Discoverability', href: '/services/ai-discoverability' },
    sections: [
      { title: 'From question to qualified conversation', body: 'Map buyer questions to authoritative answers, focused pages, and measurable conversion paths.', flow: ['Buyer question', 'Useful answer', 'Trusted source', 'Conversion page', 'Qualified inquiry'] },
      { title: 'What changes', body: 'Your site becomes easier to interpret and easier to act on.', items: [
        { title: 'Be found', body: 'Technical discovery and content structure help the right pages surface.' },
        { title: 'Be understood', body: 'Direct answers and consistent entities reduce ambiguity.' },
        { title: 'Be chosen', body: 'Focused landing pages connect research to a useful next step.' },
      ] },
    ],
    related: [{ label: 'AI Discoverability', href: '/services/ai-discoverability' }, { label: 'Insights', href: '/insights' }],
  },
  convertMoreLeads: {
    path: '/solutions/convert-more-leads', eyebrow: 'Convert More Leads',
    title: 'Stop losing opportunities between systems.',
    description: 'Connect lead capture, qualification, CRM routing, follow-up, and reporting into one visible conversion path.',
    summary: 'The goal is simple: respond quickly, route accurately, preserve context, and know where each opportunity went.',
    primaryCta: { label: 'Audit Your Conversion Path', href: '/book?focus=lead-conversion' },
    secondaryCta: { label: 'Explore Automation Systems', href: '/services/automation-systems' },
    sections: [
      { title: 'One traceable lead path', body: 'We follow the lead from first action to owner response and measured outcome.', flow: ['Capture', 'Qualify', 'Route', 'Follow up', 'Measure'] },
      { title: 'Remove conversion friction', body: 'Fix the handoffs with the greatest revenue risk first.', items: [
        { title: 'Faster response', body: 'Trigger the next useful action as soon as a lead qualifies.' },
        { title: 'Fewer handoffs', body: 'Keep ownership and context explicit across tools.' },
        { title: 'Trusted reporting', body: 'Record the events needed to explain what converted and what did not.' },
      ] },
    ],
    related: [{ label: 'Automation Systems', href: '/services/automation-systems' }, { label: 'Results', href: '/results' }],
  },
  homeServicesAutomation: {
    path: '/solutions/home-services-automation', eyebrow: 'Home-Services Automation',
    title: 'Connect home-service intake to payment in one reliable workflow.',
    description: 'OfRoot helps HVAC, plumbing, and other home-service operators connect lead capture, qualification, scheduling, estimates, invoicing, payment, and follow-up without losing ownership between tools.',
    summary: 'The goal is not another dashboard. It is one operating path that shows what happened, who owns the next step, and where a failure needs attention.',
    primaryCta: { label: 'Book a Home-Services Workflow Audit', href: '/book?focus=home-services-automation' },
    secondaryCta: { label: 'Explore the workflow example', href: '/case-studies/home-services-mvp' },
    sections: [
      { eyebrow: 'Illustrative scope', title: 'Connect the steps that keep work moving.', body: 'A scoped home-services workflow can connect intake, scheduling, estimates, invoices, payments, and reminders. A delivery plan can include role controls, observability, deployment checks, recovery documentation, and operator handoff. This is a capability example, not a claim of a completed client engagement.', items: [
        { title: 'Start with the leak', body: 'Map after-hours demand, calls, forms, spreadsheets, scheduling, estimates, and payments before choosing the next tool.' },
        { title: 'Ship the narrow path', body: 'Release the smallest workflow that can create a measurable operating improvement without forcing a full platform replacement.' },
        { title: 'Keep ownership visible', body: 'Give every handoff a rule, owner, signal, and recovery path so missed work does not stay invisible.' },
      ] },
      { eyebrow: 'The workflow', title: 'Every lead should move from request to revenue with context intact.', body: 'The exact tools vary by operator. The operating contract stays clear: capture the request, qualify the work, assign ownership, schedule the next action, collect payment, and measure completion.', flow: ['Request captured', 'Lead qualified', 'Owner assigned', 'Visit scheduled', 'Estimate approved', 'Invoice paid', 'Outcome measured'] },
      { title: 'What OfRoot can connect', body: 'We work around the existing stack when it is useful, then improve the contracts between systems.', items: [
        { title: 'Demand and intake', body: 'Website forms, Meta lead flows, phone or after-hours intake, qualification, and response automation.' },
        { title: 'Operations', body: 'CRM records, technician or team ownership, scheduling, estimates, invoices, payment, and reminders.' },
        { title: 'Control and reporting', body: 'Validation, retries, failure alerts, dashboards, runbooks, and reporting that operators can explain.' },
      ] },
      { title: 'A practical first engagement', body: 'Begin with a paid audit of one revenue-critical workflow. The request form is a fit check, not a payment or engagement commitment; a qualified operator leaves the audit with the current-state map, ownership boundaries, failure points, measurement plan, and smallest useful implementation scope.', items: [
        { title: 'Audit', body: 'Trace the current flow and identify where leads, context, or accountability disappear.' },
        { title: 'Build', body: 'Implement one priority path with explicit validation, monitoring, and rollback considerations.' },
        { title: 'Improve', body: 'Review completion, response time, exceptions, and conversion signals before expanding the system.' },
      ] },
    ],
    related: [{ label: 'Automation Systems', href: '/services/automation-systems' }, { label: 'Convert More Leads', href: '/solutions/convert-more-leads' }, { label: 'AI Process Audit', href: '/ai-process' }, { label: 'Pricing and starting ranges', href: '/pricing' }],
  },
  hvacLeadFollowUp: {
    path: '/solutions/hvac-lead-follow-up-automation', eyebrow: 'HVAC Lead Follow-Up Automation',
    title: 'Turn missed HVAC calls into a visible follow-up path.',
    description: 'Connect HVAC lead capture, missed-call response, qualification, scheduling, estimate follow-up, and payment status so opportunities do not disappear between tools.',
    summary: 'The first improvement is not a chatbot. It is a reliable path that records every request, assigns the next owner, sends the right follow-up, and shows what still needs attention.',
    primaryCta: { label: 'Book an HVAC Workflow Audit', href: '/book?focus=home-services-automation' },
    secondaryCta: { label: 'Explore the workflow example', href: '/case-studies/home-services-mvp' },
    sections: [
      { eyebrow: 'Common leakage points', title: 'The revenue risk is usually between steps.', body: 'A lead can be captured correctly and still be lost when the next action is unclear or unowned.', items: [
        { title: 'Missed calls', body: 'After-hours or busy-period requests need a recorded response path and a clear owner.' },
        { title: 'Unworked estimates', body: 'An estimate is not a closed loop until follow-up, decision status, and next action are visible.' },
        { title: 'Unfinished payment', body: 'Invoices, reminders, and payment status should connect back to the job and customer context.' },
      ] },
      { eyebrow: 'The operating path', title: 'Every request should have context and a next action.', body: 'The exact software depends on the operator. The workflow contract stays stable.', flow: ['Call or form', 'Request recorded', 'Work qualified', 'Owner assigned', 'Visit booked', 'Estimate followed up', 'Payment measured'] },
      { title: 'What OfRoot can improve', body: 'We work around the existing field-service and CRM stack when it is useful, then strengthen the handoffs between systems.', items: [
        { title: 'Response', body: 'Route new and missed requests into a consistent response and qualification process.' },
        { title: 'Conversion', body: 'Make booking, estimate follow-up, and customer status visible to the responsible team.' },
        { title: 'Control', body: 'Add validation, failure signals, runbooks, and reporting before expanding automation.' },
      ] },
      { title: 'Start with one measurable bottleneck.', body: 'A paid workflow audit maps one revenue-critical path, identifies the highest-value gap, and produces a prioritized build scope with an agreed timeline. The request form checks fit before any payment or engagement commitment. No full-platform replacement is required to begin.', items: [
        { title: 'Bring the evidence', body: 'Review calls, forms, statuses, schedules, estimates, invoices, and payment handoffs.' },
        { title: 'Choose the narrow path', body: 'Select one intervention with a named owner, success measure, and recovery plan.' },
        { title: 'Prove completion', body: 'Track response time, booking, estimate movement, payment completion, and exceptions.' },
      ] },
    ],
    related: [{ label: 'Home-Services Automation', href: '/solutions/home-services-automation' }, { label: 'Automation Systems', href: '/services/automation-systems' }, { label: 'Pricing and starting ranges', href: '/pricing' }],
  },
  unlockKnowledge: {
    path: '/solutions/unlock-company-knowledge', eyebrow: 'Unlock Company Knowledge',
    title: 'Make approved company knowledge easier to use.',
    description: 'Connect internal documents, code, processes, and company workflows through a permission-aware AI workspace.',
    summary: 'Teams move faster when answers are source-backed, access-controlled, and available inside the work they already do.',
    primaryCta: { label: 'Map Your Knowledge System', href: '/book?focus=company-knowledge' },
    secondaryCta: { label: 'Explore Private Company AI', href: '/services/private-company-ai' },
    sections: [
      { title: 'From scattered sources to usable answers', body: 'The system retrieves approved context and returns an answer with evidence.', flow: ['Approved sources', 'Access rules', 'Relevant context', 'Source-backed answer', 'Measured use'] },
      { title: 'Useful across the company', body: 'A shared foundation can support different teams without flattening permissions.', items: [
        { title: 'Operations', body: 'Find SOPs, policies, and process answers without chasing document owners.' },
        { title: 'Engineering', body: 'Navigate code, architecture, and standards with linked source context.' },
        { title: 'Sales', body: 'Prepare accurate account work from approved product and customer knowledge.' },
      ] },
    ],
    related: [{ label: 'Private Company AI', href: '/services/private-company-ai' }, { label: 'Security', href: '/security' }],
  },
};
