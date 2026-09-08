export type Insight = {
  slug: string; title: string; description: string; category: string; updated: string;
  seoTitle?: string; published?: string; modified?: string; introduction?: string[];
  directAnswer: string; outline: Array<{ title: string; body?: string[]; points: string[] }>;
  faq: Array<{ question: string; answer: string }>;
  sources: Array<{ label: string; href: string }>;
  relatedService: { label: string; href: string };
};

export const insights: Insight[] = [
  {
    slug: 'is-your-business-ai-agent-ready',
    title: 'Is Your Business AI-Agent Ready? A Practical Readiness Test',
    seoTitle: 'Is Your Business AI-Agent Ready? A Practical Test',
    category: 'Technical implementation',
    updated: 'September 8, 2026',
    published: '2026-09-08',
    modified: '2026-09-08',
    description: 'Use this practical AI-agent readiness test to evaluate workflows, data, permissions, human approvals, monitoring, ownership, and business value.',
    directAnswer: 'An AI-agent-ready business has at least one defined workflow where an agent can access approved information, use limited tools, follow explicit rules, request human approval, fail safely, and produce evidence that the work completed correctly.',
    introduction: [
      'Most companies asking about AI agents start with the model. The better question is whether the business is ready to let an agent do useful work.',
      'If ownership is unclear, data is unreliable, permissions are broad, or exceptions only exist in someone’s head, adding an agent will not fix the workflow. It may simply make the failure move faster. Agent readiness makes the workflow understandable, controlled, measurable, and safe enough to automate.',
    ],
    outline: [
      { title: 'Define one specific workflow', body: ['“Improve operations with AI” is not a workflow. A strong first use case has a clear trigger, defined outcome, visible owner, known systems, and a manageable exception path. The team should be able to draw the current process before asking an agent to operate inside it.'], points: ['Name what begins the work and what proves completion.', 'Separate rules from decisions that require judgment.', 'Assign an owner for exceptions and recovery.'] },
      { title: 'Measure the business value', body: ['An agent should change a business outcome, not only produce an impressive demo. Record the current baseline before implementation so the team can distinguish activity from value.'], points: ['Measure recurring manual effort, delay, error, or rework.', 'Connect the workflow to revenue, capacity, service, or risk.', 'Choose the smallest use case with a result the business can verify.'] },
      { title: 'Approve the sources of truth', body: ['An agent needs to know where reliable information comes from. For each source, define its owner, freshness, access rules, and what should happen when information is missing or sources disagree.'], points: ['Use only approved sources for the task.', 'Apply the user’s existing permissions before retrieval.', 'Link important answers to the evidence used.'] },
      { title: 'Limit tool permissions', body: ['Reading a record is different from changing it. Give the agent only the systems, records, fields, actions, and frequency limits required for its defined job.'], points: ['Use least-privilege access.', 'Validate inputs before writes.', 'Keep unrelated and destructive actions out of scope.'] },
      { title: 'Set human approval boundaries', body: ['Retrieving a policy or drafting an internal response does not carry the same risk as messaging a customer, changing a financial record, granting access, or making an external commitment. Decide which actions require a person before launch.'], points: ['Separate read-only, reversible, external, and high-impact actions.', 'Ask for approval at the moment it matters.', 'Show the reviewer what the agent proposes and why.'] },
      { title: 'Design safe failure and recovery', body: ['Credentials expire, APIs rate-limit, events duplicate, and inputs arrive malformed. A production workflow defines how those failures are contained, made visible, and recovered.'], points: ['Retry only operations that are safe to repeat.', 'Use validation and deduplication controls.', 'Stop and route an exception when required context is missing.'] },
      { title: 'Evaluate real behavior', body: ['Models, prompts, sources, integrations, and real-world inputs can all change behavior. Build an evaluation set from representative tasks before release and continue using it after launch.'], points: ['Test normal cases, edge cases, missing data, and denied actions.', 'Track completion, accuracy, policy compliance, latency, and cost.', 'Expand scope only after the narrow workflow is reliable.'] },
      { title: 'Make operation observable', body: ['Operators need to see what triggered a run, which sources and tools were used, what changed, whether approval occurred, and where the workflow stopped.'], points: ['Keep useful logs and traceable tool actions.', 'Alert on failures that affect business completion.', 'Maintain a runbook for common recovery paths.'] },
      { title: 'Name the owners', body: ['An agent is not finished when it ships. The business needs owners for workflow policy, source quality, permissions, technical operation, evaluations, and outcome measurement.'], points: ['Name who reviews failed runs.', 'Define who can change permissions or expand scope.', 'Keep a clear pause and rollback path.'] },
    ],
    faq: [
      { question: 'What does AI-agent ready mean?', answer: 'It means a workflow has approved data, limited tool access, explicit rules, human approval boundaries, safe failure handling, evaluations, monitoring, and accountable owners.' },
      { question: 'Does a company need perfect data before using AI agents?', answer: 'No. It needs data that is sufficiently accurate, current, permissioned, and owned for one defined workflow. Begin with a narrow scope and make missing information visible.' },
      { question: 'What is the difference between an AI agent and a chatbot?', answer: 'A chatbot primarily answers questions. An agent can retrieve information and use connected tools to complete defined workflow steps under permission and approval rules.' },
      { question: 'What is a good first AI agent use case?', answer: 'Choose a recurring workflow with clear inputs, a measurable outcome, limited system access, manageable exceptions, and an owner. Avoid starting with a broad mandate to automate an entire department.' },
      { question: 'How do you know whether an AI agent is working?', answer: 'Measure task completion, accuracy, exception rate, latency, cost, policy compliance, and the business outcome the workflow is supposed to improve. Compare results with a pre-launch baseline.' },
    ],
    sources: [
      { label: 'NIST AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' },
      { label: 'OWASP Top 10 for LLM Applications', href: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' },
    ],
    relatedService: { label: 'AI Agent Integration Services', href: '/agent-integrations' },
  },
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
