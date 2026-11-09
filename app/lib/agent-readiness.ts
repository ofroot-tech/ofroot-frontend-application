import { CANONICAL_SITE_URL } from '@/app/config/site';
import { AI_PROCESS_GUIDE } from '@/app/lib/ai-process-guide';
import { featurePages, featurePath, type FeatureContent } from '@/app/lib/feature-content';
import { growthPages, type GrowthPageContent } from '@/app/lib/growth-content';
import { insights, type Insight } from '@/app/lib/insights-content';

export const CONTENT_SIGNAL = 'search=yes, ai-input=yes, ai-train=no';

type ContentLink = { label: string; href: string };
type ContentItem = { title: string; body: string };

function link(item: ContentLink, path: string) {
  return `[${item.label}](${new URL(item.href, `${CANONICAL_SITE_URL}${path}`).href})`;
}

function items(values: ContentItem[]) {
  return values.map(item => `### ${item.title}\n\n${item.body}`).join('\n\n');
}

function document(path: string, title: string, body: string) {
  return `# ${title}\n\nSource: ${CANONICAL_SITE_URL}${path}\n\n${body.trim()}\n`;
}

function growthMarkdown(content: GrowthPageContent) {
  const features = featurePages.filter(feature => `/services/${feature.service}` === content.path);
  return document(content.path, content.title, [
    content.eyebrow, content.description, content.summary,
    'Built around measurable outcomes, visible system behavior, and technical ownership.',
    ...(features.length ? [
      '## Each capability has one clear job.',
      ...features.map(feature => `${link({ label: feature.eyebrow, href: featurePath(feature) }, content.path)}\n\n${feature.description}`),
    ] : []),
    ...content.sections.map(section => [
      `## ${section.title}`, section.eyebrow, section.body,
      section.flow?.map((step, index) => `${index + 1}. ${step}`).join('\n'),
      section.items && items(section.items),
    ].filter(Boolean).join('\n\n')),
    '## Next step', link(content.primaryCta, content.path),
    ...content.related.map(item => link(item, content.path)),
  ].join('\n\n'));
}

function featureMarkdown(content: FeatureContent) {
  const path = featurePath(content);
  return document(path, content.title, [
    `${content.serviceName} / ${content.eyebrow}`, content.description,
    '## Direct answer', content.directAnswer,
    '## The question this solves', content.buyerQuestion,
    '## What changes when the system works', items(content.outcomes),
    '## What the implementation covers', items(content.included),
    '## Implementation path', items(content.process),
    '## What we measure', items(content.measures),
    `## ${content.example.title}`, content.example.body,
    content.example.steps.map((step, index) => `${index + 1}. ${step}`).join('\n'),
    '## Frequently asked questions',
    ...content.faqs.map(faq => `### ${faq.question}\n\n${faq.answer}`),
    '## Next step', link({ label: 'Discuss this system', href: `/book?focus=${content.slug}&source=feature-page` }, path),
    link({ label: `Explore ${content.serviceName}`, href: `/services/${content.service}` }, path),
  ].join('\n\n'));
}

function insightMarkdown(content: Insight) {
  const path = `/insights/${content.slug}`;
  return document(path, content.title, [
    `${content.category}\n\nBy OfRoot Technology\n\nUpdated ${content.updated}`,
    '## Direct answer', content.directAnswer,
    ...(content.introduction || []),
    ...content.outline.map(section => [
      `## ${section.title}`, ...(section.body || []),
      section.points.map(point => `- ${point}`).join('\n'),
    ].join('\n\n')),
    '## Evidence and sources', ...content.sources.map(source => link(source, path)),
    ...(content.relatedInsights?.length ? ['## Continue reading', ...content.relatedInsights.map(item => link(item, path))] : []),
    '## Frequently asked questions',
    ...content.faq.map(faq => `### ${faq.question}\n\n${faq.answer}`),
    '## Related service', link(content.relatedService, path),
  ].join('\n\n'));
}

// Homepage editorial copy follows app/page.tsx and its HomeHero/HomeReading sections.
// Service and article documents below use the same content models as their HTML pages.
function homeMarkdown() {
  return document('/', 'Less manual work. More time to grow.', `
Software, automation & practical AI

We connect your tools, automate repetitive tasks, and set up AI around the work your team actually does.

${link({ label: 'Discuss your project', href: '/book?source=homepage-hero' }, '/')}

Tell us where work gets stuck. We’ll review it and reply by email with a practical next step.

One connected system. One accountable partner.

For owners and operations teams at growing businesses.

## Fix what slows your business down.

Start with a task that costs time, creates rework, or holds back growth. We’ll help you choose a useful first fix.

### Stop moving data by hand.

Connect your CRM, forms, reporting, and internal tools so your team spends less time copying records and chasing updates.

${link({ label: 'Discuss integrations and automation', href: '/services/automation-systems' }, '/')}

### Make AI useful to your team.

Build AI around a specific task. Get help with setup, software integrations, approved company knowledge, and getting your team started.

${link({ label: 'Discuss AI setup and integrations', href: '/services/private-company-ai' }, '/')}

### Give customers a clear next step.

Build or improve your website so people understand your offer, trust your business, and know how to get in touch.

${link({ label: 'Discuss your website', href: '/services/ai-discoverability' }, '/')}

## Small changes. A clearer way to work.

Illustrative project scopes. A few examples of work we can scope around your business. Each starts with a real task and a result we can check.

### Give every new inquiry a clear next step.

Connect an inquiry form to your CRM, assign an owner, and flag anything that needs attention.

Inquiry received → CRM updated → Owner notified

### Spend less time rebuilding the same report.

Bring records from different tools into one view, with clear sources and visible discrepancies.

Sources connected → Records checked → Report ready

### Help your team find the answer and its source.

Set up AI to search approved documents and support a defined task, with access rules and human review where needed.

Approved sources → Useful answers → Human review

## One hands-on partner. From first fix onward.

Work directly with Dimitri, a full-stack developer and solutions architect with 11 years in technology. Start with a defined problem, review the work as it develops, and agree on handoff or ongoing support.

1. Define: Agree on the scope
2. Build: Review the work
3. Validate: Launch & hand off

${link({ label: 'Explore a home-services workflow', href: '/solutions/home-services-automation' }, '/')}

## Stay informed. Find something useful.

Understand what’s changing, then see how it could apply to the work you do.

### Signal

Technology news with clear sources and short, evidence-based briefs.

${link({ label: 'Explore Signal', href: '/news' }, '/')}

### From the blog

Practical guides for connecting tools, reducing manual work and making useful AI decisions.

${link({ label: 'Browse the blog', href: '/blog' }, '/')}

### ${AI_PROCESS_GUIDE.title}

${AI_PROCESS_GUIDE.description}

${link({ label: 'Read the guide', href: AI_PROCESS_GUIDE.href }, '/')}

## A few useful answers.

You can bring one specific problem or ask for help finding the right place to start.

### Do we have to replace the tools we use?

We start by reviewing what you already have. Where practical, we connect and improve those tools. Any proposed replacement comes with a clear reason before you commit.

### Can we start with one problem?

Yes. We can scope one priority workflow, website change, or internal tool. We agree on the result and how to check it before the build begins.

### Do we need an AI project to work with you?

No. The right first step may be a better report, a website improvement, or connecting two tools. We recommend AI when it fits a useful task.

### How is the work priced?

Scope, software access, complexity, and support needs shape the price. We agree on the deliverables and cost before implementation.

${link({ label: 'Review current engagement options', href: '/pricing' }, '/')}

### What happens when I get in touch?

Tell us about your business, where work gets stuck, and the outcome you want. We review your request and reply by email with a recommended next step. We arrange a conversation when there is a useful fit.

## Where does the work get stuck?

Share the problem and the outcome you want. We’ll review the fit and recommend a practical next step.

${link({ label: 'Discuss your project', href: '/book?source=homepage-final' }, '/')}
`);
}

const documents = new Map<string, () => string>([
  ['/', homeMarkdown],
  ['/insights', () => document('/insights', 'Clear answers for technical growth decisions.', [
    'Practical guides and decision frameworks for discoverability, conversion, automation, company knowledge, and private AI.',
    ...insights.map(insight => `${link({ label: insight.title, href: `/insights/${insight.slug}` }, '/insights')}\n\n${insight.description}`),
  ].join('\n\n'))],
  ...Object.values(growthPages).map(content => [content.path, () => growthMarkdown(content)] as const),
  ...featurePages.map(content => [featurePath(content), () => featureMarkdown(content)] as const),
  ...insights.map(content => [`/insights/${content.slug}`, () => insightMarkdown(content)] as const),
]);

export function getPublicMarkdown(path: string): string | null {
  return documents.get(path)?.() ?? null;
}

export function isPublicMarkdownPath(path: string): boolean {
  return documents.has(path);
}

/** Only an explicit, acceptable Markdown preference selects the alternate body. */
export function prefersMarkdown(accept: string | null): boolean {
  const qualities = new Map<string, number>();
  for (const range of (accept || '').split(',')) {
    const [media, ...parameters] = range.trim().toLowerCase().split(';').map(value => value.trim());
    const qualityParameter = parameters.find(parameter => /^q\s*=/.test(parameter));
    const value = qualityParameter?.split('=')[1]?.trim();
    const quality = value === undefined ? 1 : /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(value) ? Number(value) : 0;
    qualities.set(media, Math.max(qualities.get(media) ?? 0, quality));
  }
  const markdown = qualities.get('text/markdown') ?? 0;
  const html = qualities.get('text/html') ?? qualities.get('text/*') ?? qualities.get('*/*') ?? 0;
  return markdown > 0 && markdown >= html;
}

export function agentDiscoveryHeaders(path: string): Record<string, string> | null {
  if (!isPublicMarkdownPath(path)) return null;
  return {
    Vary: 'Accept',
    'Content-Signal': CONTENT_SIGNAL,
    Link: `</llms.txt>; rel="describedby"; type="text/plain", <${CANONICAL_SITE_URL}${path}>; rel="alternate"; type="text/markdown"`,
  };
}

export function markdownResponse(method: string, path: string, accept: string | null) {
  if (!['GET', 'HEAD'].includes(method) || !prefersMarkdown(accept)) return null;
  const headers = agentDiscoveryHeaders(path);
  if (!headers) return null;
  return {
    body: method === 'HEAD' ? null : getPublicMarkdown(path),
    headers: {
      ...headers,
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  };
}
