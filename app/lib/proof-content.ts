/**
 * Public capability examples. These describe engineering approaches, not
 * attributed client deliveries, measured business results, or commitments.
 * Legacy slugs remain available so existing links continue to work.
 */
export type CaseStudyContent = {
  slug: string;
  category: string;
  title: string;
  description: string;
  evidenceLabel: string;
  featuredResult: string;
  featuredResultLabel: string;
  summary: string;
  context: string;
  problem: string;
  constraints: string;
  approach: string[];
  outcomes: string[];
  delivered: string[];
  relatedService: { label: string; href: string };
};

export const caseStudies: CaseStudyContent[] = [
  {
    slug: 'reporting-reconciliation',
    category: 'Reporting & data',
    title: 'Make numbers from different systems explainable.',
    description: 'A capability example for multi-source reporting, data reconciliation, and operational dashboards.',
    evidenceLabel: 'Capability example',
    featuredResult: 'Traceable reporting',
    featuredResultLabel: 'from source records to the dashboard',
    summary: 'Connect the sources, define what each metric means, and make discrepancies visible before people rely on the totals.',
    context: 'Useful when marketing, sales, and operational systems describe the same activity in different ways.',
    problem: 'Conflicting totals, duplicate records, and different time windows can make a dashboard difficult to trust.',
    constraints: 'Access, source coverage, refresh timing, and metric definitions need to be agreed before interpreting results.',
    approach: ['Map source records and stable identifiers.', 'Define metric boundaries, ownership, and time windows.', 'Add reconciliation checks and visible freshness or coverage signals.'],
    outcomes: ['Compare dashboard totals with source records.', 'Test duplicates, missing data, and time-window boundaries.', 'Review discrepancies and source freshness with the people using the reports.'],
    delivered: ['Source and metric definitions.', 'Reporting interfaces and reconciliation checks.', 'Monitoring and release documentation.'],
    relatedService: { label: 'Integrations & Internal Tools', href: '/services/automation-systems' },
  },
  {
    slug: 'home-services-mvp',
    category: 'Operational software',
    title: 'Give complex work a clear place to move forward.',
    description: 'A capability example for case, job, and service workflows with connected records, documents, and task ownership.',
    evidenceLabel: 'Capability example',
    featuredResult: 'Connected workflows',
    featuredResultLabel: 'from intake to an accountable next step',
    summary: 'Build internal applications around the work a team actually does: intake, records, scheduling, documents, and follow-through.',
    context: 'Useful for service businesses and operations teams coordinating work across people and tools.',
    problem: 'Scattered records and manual handoffs can leave operators without a clear status or next action.',
    constraints: 'User roles, record ownership, data sensitivity, and the boundaries of the first release shape the application.',
    approach: ['Map the workflow, states, and responsible roles.', 'Connect records, documents, and task views through explicit data contracts.', 'Test repeated actions, interrupted flows, and recovery before release.'],
    outcomes: ['Verify each role can see and act on the right records.', 'Check that updates persist and remain traceable.', 'Walk through the complete workflow with representative test data.'],
    delivered: ['Workflow and data model.', 'Role-aware operational interfaces.', 'Tests, deployment plan, and handoff documentation.'],
    relatedService: { label: 'Integrations & Internal Tools', href: '/services/automation-systems' },
  },
  {
    slug: 'crm-erp-sync',
    category: 'Integrations & automation',
    title: 'Connect tools without hiding the exceptions.',
    description: 'A capability example for API integrations, synchronization, background jobs, and recoverable automation.',
    evidenceLabel: 'Capability example',
    featuredResult: 'Visible handoffs',
    featuredResultLabel: 'with explicit ownership and recovery paths',
    summary: 'Connect business applications with clear field ownership, observable processing, and a way to recover when a service fails.',
    context: 'Useful when teams copy data between applications or depend on fragile scripts and manual follow-up.',
    problem: 'Duplicate updates, missed events, and unclear ownership can turn a simple integration into ongoing cleanup.',
    constraints: 'API limits, permissions, business rules, and existing workflows must be understood before changing data flows.',
    approach: ['Define the source of truth for shared records and fields.', 'Design validation, queues, retries, and duplicate protection.', 'Make errors visible and document safe recovery steps.'],
    outcomes: ['Test duplicate, delayed, and out-of-order events.', 'Check failure recovery without repeating external actions.', 'Confirm the destination data matches the agreed contract.'],
    delivered: ['Integration and ownership map.', 'API adapters and background processing.', 'Operational checks and recovery guidance.'],
    relatedService: { label: 'Integrations & Internal Tools', href: '/services/automation-systems' },
  },
  {
    slug: 'healthcare-ai-automation',
    category: 'AI-assisted tools',
    title: 'Put useful AI inside a controlled workflow.',
    description: 'A capability example for AI-assisted search, summarization, and operational tools using approved information.',
    evidenceLabel: 'Capability example',
    featuredResult: 'AI with context',
    featuredResultLabel: 'and human review where it matters',
    summary: 'Build AI assistance around a defined task, approved sources, and clear limits on what the system may do.',
    context: 'Useful for teams that need help finding information, summarizing context, or preparing routine work.',
    problem: 'A generic chat interface may lack the sources, permissions, or checks a real business workflow requires.',
    constraints: 'Source access, data handling, model behavior, cost, and human approval requirements are part of the design.',
    approach: ['Choose a bounded use case and approved knowledge sources.', 'Connect retrieval and tools with explicit access and action rules.', 'Evaluate representative questions and failure cases before deployment.'],
    outcomes: ['Review answer quality, source grounding, and uncertain responses.', 'Test access boundaries and approval steps.', 'Measure reliability, latency, and operating cost against agreed criteria.'],
    delivered: ['Task-specific AI interface or integration.', 'Evaluation cases and permission design.', 'Deployment, monitoring, and operating documentation.'],
    relatedService: { label: 'AI Systems & Deployment', href: '/services/private-company-ai' },
  },
  {
    slug: 'marketing-websites',
    category: 'Websites & discoverability',
    title: 'Make the next step clear for your customers.',
    description: 'A capability example for marketing websites, search-ready content, campaign landing pages, and measurement.',
    evidenceLabel: 'Capability example',
    featuredResult: 'A clear digital front door',
    featuredResultLabel: 'built for visitors, search, and campaigns',
    summary: 'Connect thoughtful website design with clear content, technical foundations, and a measurable inquiry path.',
    context: 'Useful for businesses with an unclear offer, an aging website, or campaigns that need focused landing pages.',
    problem: 'Visitors can struggle to understand a service or complete the next step, even when traffic is reaching the site.',
    constraints: 'Audience, content ownership, analytics consent, campaign budget, and existing URLs shape the work.',
    approach: ['Define the audience, offer, content, and primary action.', 'Build responsive pages with technical SEO, structured answers, and clear navigation.', 'Connect campaign landing pages and analytics to the inquiry path.'],
    outcomes: ['Test navigation and forms across desktop and mobile.', 'Check crawlability, metadata, structured data, and accessibility.', 'Review actual campaign and inquiry data before making performance claims.'],
    delivered: ['Responsive marketing website or landing pages.', 'SEO, AEO, and GEO foundations.', 'Campaign measurement and content handoff.'],
    relatedService: { label: 'Marketing Websites & Growth', href: '/services/ai-discoverability' },
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}
