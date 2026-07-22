import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ofroot.technology';

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
    openGraph: { title, description, url: `${SITE_URL}${path}`, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export const growthPages: Record<string, GrowthPageContent> = {
  aiDiscoverability: {
    path: '/services/ai-discoverability',
    eyebrow: 'AI Discoverability',
    title: 'Get discovered wherever your customers search.',
    description: 'OfRoot builds technical content and visibility systems for traditional search, AI answers, and modern buyer research.',
    summary: 'One discoverability system makes your expertise easier to find, understand, and trust. SEO improves search visibility. Answer engine optimization structures clear answers. Generative engine optimization strengthens consistency and citation readiness.',
    primaryCta: { label: 'Book a Discoverability Audit', href: '/book?focus=discoverability' },
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
        body: 'The exact plan depends on current visibility, buyer intent, and conversion gaps.',
        items: [
          { title: 'Visibility foundation', body: 'AI visibility assessment, technical SEO, entity consistency, schema markup, and internal linking.' },
          { title: 'Content system', body: 'Search-intent mapping, content architecture, existing-content optimization, FAQ design, and original research planning.' },
          { title: 'Demand capture', body: 'Conversion landing pages, clear next steps, measurement, and third-party authority strategy.' },
        ],
      },
      {
        title: 'What we measure',
        body: 'We measure business visibility and conversion together. No company can guarantee inclusion in a specific AI-generated answer.',
        items: [
          { title: 'Visibility', body: 'Search impressions, target-question visibility, rankings, AI mentions, and cited-source coverage.' },
          { title: 'Demand', body: 'Qualified organic leads, assisted conversions, and landing-page conversion rate.' },
          { title: 'Learning', body: 'Content gaps, source quality, and the questions buyers ask before they convert.' },
        ],
      },
    ],
    related: [
      { label: 'Generate Demand', href: '/solutions/generate-demand' },
      { label: 'Read AI discoverability insights', href: '/insights' },
    ],
  },
  automationSystems: {
    path: '/services/automation-systems',
    eyebrow: 'Automation Systems',
    title: 'Turn disconnected tools into one reliable revenue system.',
    description: 'OfRoot connects lead capture, CRM, qualification, routing, follow-up, and reporting so teams respond faster and lose fewer opportunities.',
    summary: 'A reliable revenue system moves each opportunity to the right owner, records what happened, and makes failures visible before they become lost pipeline.',
    primaryCta: { label: 'Audit Your Revenue Operations', href: '/book?focus=automation' },
    secondaryCta: { label: 'See existing proof', href: '/results' },
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
          { title: 'Revenue operations', body: 'CRM automation, lifecycle automation, lead qualification, lead routing, and sales follow-up.' },
          { title: 'System integration', body: 'API integrations, data synchronization, response automation, and workflow monitoring.' },
          { title: 'Visibility', body: 'Operational dashboards, failure alerts, ownership rules, and reporting teams can explain.' },
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
      { label: 'Existing automation services', href: '/services' },
    ],
  },
  privateCompanyAi: {
    path: '/services/private-company-ai',
    eyebrow: 'Private Company AI',
    title: 'A secure AI system built around your company.',
    description: 'Connect approved documents, software, code, processes, and business tools to a company-specific AI workspace with source-backed answers and controlled access.',
    summary: 'Private company AI helps teams use approved knowledge without turning every answer into a search project. Access follows company permissions, and important answers point back to their sources.',
    primaryCta: { label: 'Plan Your Company AI System', href: '/book?focus=private-ai' },
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
          { title: '3. Deploy', body: 'Use a branded interface, permission-aware access, source citations, audit logs, and usage reporting.' },
          { title: '4. Improve', body: 'Measure adoption, answer acceptance, knowledge gaps, requests completed, and time saved.' },
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
