export type Insight = {
  slug: string; title: string; description: string; category: string; updated: string;
  directAnswer: string; outline: Array<{ title: string; points: string[] }>;
  faq: Array<{ question: string; answer: string }>;
  sources: Array<{ label: string; href: string }>;
  relatedService: { label: string; href: string };
};

export const insights: Insight[] = [
  {
    slug: 'what-is-ai-discoverability', title: 'What Is AI Discoverability?', category: 'AI discoverability', updated: 'July 22, 2026',
    description: 'A practical outline for making a company easier to find, understand, and cite across search and AI-generated answers.',
    directAnswer: 'AI discoverability is the work of making a company’s useful knowledge easy for people, search engines, and AI systems to find, interpret, and connect to a trusted source.',
    outline: [
      { title: 'Start with buyer questions', points: ['Map real research questions to clear pages.', 'Separate informational, comparison, and purchase intent.', 'Define a useful next step for each page.'] },
      { title: 'Build machine-readable clarity', points: ['Use descriptive routes and headings.', 'Keep entities and company facts consistent.', 'Add valid structured data only where it matches visible content.'] },
      { title: 'Earn reasons to be cited', points: ['Publish original examples and evidence.', 'Strengthen expert authorship and source attribution.', 'Measure visibility and assisted conversion together.'] },
    ],
    faq: [{ question: 'Can AI visibility be guaranteed?', answer: 'No. A company can improve clarity, authority, and citation readiness, but cannot guarantee inclusion in a specific generated answer.' }, { question: 'Is AI discoverability separate from SEO?', answer: 'It builds on technical SEO and useful content, then extends the work to answer structure, entity consistency, and citation readiness.' }],
    sources: [{ label: 'Google Search Essentials', href: 'https://developers.google.com/search/docs/essentials' }, { label: 'Schema.org documentation', href: 'https://schema.org/docs/documents.html' }],
    relatedService: { label: 'AI Discoverability', href: '/services/ai-discoverability' },
  },
  {
    slug: 'seo-vs-aeo-vs-geo', title: 'SEO vs. AEO vs. GEO: What Companies Actually Need', category: 'Technical implementation', updated: 'July 22, 2026',
    description: 'A decision-oriented outline for treating SEO, answer optimization, and generative visibility as one system.',
    directAnswer: 'Most companies do not need three disconnected programs. They need one discoverability system with a technically sound site, direct and useful answers, consistent company facts, credible sources, and conversion measurement.',
    outline: [
      { title: 'The shared foundation', points: ['Crawlable pages and stable URLs.', 'Useful content matched to buyer intent.', 'Clear authorship, dates, sources, and internal links.'] },
      { title: 'Where the disciplines differ', points: ['SEO emphasizes search discovery and ranking.', 'AEO emphasizes extractable direct answers.', 'GEO emphasizes authority and citation readiness in generative experiences.'] },
      { title: 'Choose work by the bottleneck', points: ['Fix indexing before expanding content.', 'Fix unclear answers before adding schema.', 'Fix conversion paths before celebrating visibility alone.'] },
    ],
    faq: [{ question: 'Should these be separate retainers?', answer: 'Usually not. Separate workstreams can share one strategy, content architecture, measurement model, and conversion path.' }, { question: 'What should be measured first?', answer: 'Start with indexability, target-question visibility, qualified organic demand, assisted conversions, and page conversion rate.' }],
    sources: [{ label: 'Google SEO Starter Guide', href: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' }, { label: 'Google structured data guidelines', href: 'https://developers.google.com/search/docs/appearance/structured-data/sd-policies' }],
    relatedService: { label: 'AI Discoverability', href: '/services/ai-discoverability' },
  },
  {
    slug: 'build-private-company-ai-assistant', title: 'How to Build a Private Company AI Assistant', category: 'Private AI', updated: 'July 22, 2026',
    description: 'A reliability-first outline for designing a company assistant around approved sources, permissions, citations, and measurable use.',
    directAnswer: 'A private company AI assistant connects approved knowledge to a controlled retrieval and answer workflow. The safe starting point is a narrow use case with explicit sources, access rules, source citations, auditability, and a human approval boundary.',
    outline: [
      { title: 'Define the contract', points: ['Choose one user and repeated task.', 'List approved and prohibited sources.', 'Define what a successful answer must include.'] },
      { title: 'Design the controls', points: ['Apply identity and source permissions before retrieval.', 'Cite the evidence used in important answers.', 'Require approval before sensitive external actions.'] },
      { title: 'Measure and improve', points: ['Track adoption and answer acceptance.', 'Review knowledge gaps and rejected answers.', 'Expand only after the narrow workflow is reliable.'] },
    ],
    faq: [{ question: 'Does private AI require a private model?', answer: 'Not always. Privacy depends on the full architecture, data flow, provider terms, access design, and deployment requirements—not the model label alone.' }, { question: 'What should the first use case be?', answer: 'Choose a repeated, bounded question where approved sources exist and a human can evaluate answer quality.' }],
    sources: [{ label: 'NIST AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' }, { label: 'OWASP Top 10 for LLM Applications', href: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' }],
    relatedService: { label: 'Private Company AI', href: '/services/private-company-ai' },
  },
];
