export type ServiceSlug = 'ai-discoverability' | 'automation-systems' | 'private-company-ai';

export type FeatureContent = {
  service: ServiceSlug;
  serviceName: string;
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  directAnswer: string;
  buyerQuestion: string;
  outcomes: Array<{ title: string; body: string }>;
  included: Array<{ title: string; body: string }>;
  process: Array<{ title: string; body: string }>;
  measures: Array<{ title: string; body: string }>;
  example: { title: string; body: string; steps: string[] };
  faqs: Array<{ question: string; answer: string }>;
};

const discoverability = (content: Omit<FeatureContent, 'service' | 'serviceName'>): FeatureContent => ({
  service: 'ai-discoverability',
  serviceName: 'AI Discoverability',
  ...content,
});

const automation = (content: Omit<FeatureContent, 'service' | 'serviceName'>): FeatureContent => ({
  service: 'automation-systems',
  serviceName: 'Automation Systems',
  ...content,
});

const privateAi = (content: Omit<FeatureContent, 'service' | 'serviceName'>): FeatureContent => ({
  service: 'private-company-ai',
  serviceName: 'Private Company AI',
  ...content,
});

export const featurePages: FeatureContent[] = [
  discoverability({
    slug: 'ai-visibility-assessment', eyebrow: 'AI visibility assessment',
    title: 'See how your company appears across search and AI answers.',
    description: 'An AI visibility assessment maps where your company is found, understood, mentioned, and cited across search engines and generative research experiences.',
    directAnswer: 'An AI visibility assessment compares the questions buyers ask with the pages, entities, sources, mentions, and citations that currently represent your company. It creates a measured baseline and a prioritized action plan. It does not promise a particular ranking or AI citation.',
    buyerQuestion: 'Where are buyers finding competitors instead of us, and what should we fix first?',
    outcomes: [
      { title: 'A visible baseline', body: 'Record current rankings, answer coverage, brand mentions, cited sources, and conversion paths for a defined question set.' },
      { title: 'Prioritized gaps', body: 'Separate technical, content, entity, authority, and conversion issues so the highest-impact work is clear.' },
      { title: 'Repeatable measurement', body: 'Create a question and evidence set that can be checked again without changing the definition each month.' },
    ],
    included: [
      { title: 'Question landscape', body: 'Group commercial, comparison, problem, and implementation questions by buyer stage.' },
      { title: 'Search and answer sampling', body: 'Observe traditional results and representative AI answer surfaces using controlled prompts and locations.' },
      { title: 'Source and entity review', body: 'Inspect which pages and third-party sources explain the company consistently.' },
      { title: 'Action backlog', body: 'Rank fixes by buyer value, evidence strength, effort, and dependency.' },
    ],
    process: [
      { title: 'Define', body: 'Agree on markets, audiences, questions, competitors, and the conversion event that matters.' },
      { title: 'Observe', body: 'Capture current visibility and the sources that shape each result.' },
      { title: 'Diagnose', body: 'Trace weak coverage to technical, content, authority, or entity causes.' },
      { title: 'Prioritize', body: 'Turn findings into a sequenced 30-, 60-, and 90-day plan.' },
    ],
    measures: [
      { title: 'Question coverage', body: 'The share of agreed buyer questions with a useful owned answer.' },
      { title: 'Mention and citation presence', body: 'Observed brand mentions and cited-source coverage across the measured sample.' },
      { title: 'Qualified response', body: 'Organic and assisted conversions connected to discoverability pages.' },
    ],
    example: { title: 'A practical assessment trail', body: 'A B2B service company can begin with twenty high-intent questions rather than an undefined promise to “rank everywhere.”', steps: ['Define 20 buyer questions', 'Record current sources and answers', 'Identify missing or weak owned pages', 'Fix the top technical and content gaps', 'Repeat the same sample'] },
    faqs: [
      { question: 'Does an AI visibility assessment guarantee citations?', answer: 'No. Search engines and AI systems control their outputs. The assessment improves the quality, consistency, and availability of the evidence they may use.' },
      { question: 'How is this different from a traditional SEO audit?', answer: 'It includes technical search health, but also reviews direct-answer quality, entity consistency, third-party sources, AI mentions, citation patterns, and the conversion path after discovery.' },
      { question: 'What do we need to provide?', answer: 'Access to current analytics and search data is helpful, plus priority markets, buyer questions, competitors, and the business outcome the visibility work should support.' },
    ],
  }),
  discoverability({
    slug: 'content-architecture', eyebrow: 'Content architecture',
    title: 'Organize expertise around the questions buyers need answered.',
    description: 'Content architecture defines which pages should exist, how they relate, and where each buyer can move next without creating duplicate or competing content.',
    directAnswer: 'A strong content architecture gives every important buyer intent one clear destination. It connects service, solution, feature, evidence, and insight pages through a hierarchy that people, search engines, and AI systems can interpret.',
    buyerQuestion: 'Which pages do we actually need, and how do we prevent them from competing with each other?',
    outcomes: [
      { title: 'Clear ownership', body: 'Each page owns a distinct question, audience, and conversion step.' },
      { title: 'Better retrieval', body: 'Consistent hierarchy and internal relationships make important content easier to find and interpret.' },
      { title: 'Less content waste', body: 'Consolidate overlap before producing more pages that repeat the same claim.' },
    ],
    included: [
      { title: 'Intent inventory', body: 'Map existing URLs and proposed topics to buyer questions and funnel stages.' },
      { title: 'Canonical page map', body: 'Choose the strongest destination for each intent and define redirects or consolidation where needed.' },
      { title: 'Navigation model', body: 'Connect parent services, specific features, proof, insights, and conversion pages.' },
      { title: 'Editorial rules', body: 'Document naming, page purpose, evidence needs, and when a topic deserves a new URL.' },
    ],
    process: [
      { title: 'Inventory', body: 'Collect indexable pages, metadata, performance signals, and known business priorities.' },
      { title: 'Cluster', body: 'Group pages by real user intent rather than keyword similarity alone.' },
      { title: 'Decide', body: 'Keep, improve, combine, redirect, or create based on the evidence.' },
      { title: 'Connect', body: 'Add navigation and contextual links that reflect the buyer journey.' },
    ],
    measures: [
      { title: 'Intent coverage', body: 'Priority buyer questions with one complete and indexable destination.' },
      { title: 'Cannibalization risk', body: 'Overlapping pages competing for the same primary intent.' },
      { title: 'Path completion', body: 'Visitors who progress from an answer to proof, service detail, or a qualified inquiry.' },
    ],
    example: { title: 'From scattered posts to a usable system', body: 'A company with five overlapping automation pages can establish one service hub, distinct feature pages, proof links, and one conversion path.', steps: ['Inventory overlapping pages', 'Choose the service hub', 'Assign unique feature intent', 'Redirect obsolete duplicates', 'Measure discovery and conversion'] },
    faqs: [
      { question: 'Is content architecture the same as a sitemap?', answer: 'No. A sitemap lists URLs. Content architecture defines why each page exists, how it relates to other pages, and what user decision it supports.' },
      { question: 'Will this require changing existing URLs?', answer: 'Not always. Existing URLs with equity should be preserved when they still match the intended topic. When a change is necessary, redirects and canonicals protect continuity.' },
      { question: 'How many pages should a company create?', answer: 'Only enough to cover materially different user intents with useful depth. Repeated keyword variations should not become separate pages.' },
    ],
  }),
  discoverability({
    slug: 'conversion-landing-pages', eyebrow: 'Conversion landing pages',
    title: 'Turn high-intent research into a clear business action.',
    description: 'Conversion landing pages align one buyer problem, one credible solution, supporting evidence, and one useful next step.',
    directAnswer: 'A conversion landing page is a focused destination for a specific audience and decision. It answers the visitor’s immediate question, explains the system in plain language, reduces risk with evidence, and makes the next action obvious.',
    buyerQuestion: 'How do we convert search and AI visibility into qualified conversations instead of passive traffic?',
    outcomes: [
      { title: 'Stronger message match', body: 'The page continues the exact problem or question that brought the visitor in.' },
      { title: 'Lower decision friction', body: 'Clear scope, evidence, process, and FAQs answer objections before the form.' },
      { title: 'Measurable intent', body: 'CTA source, form start, submission, and downstream outcome stay traceable.' },
    ],
    included: [
      { title: 'Intent-specific narrative', body: 'Lead with the user’s problem and desired outcome, not an internal feature list.' },
      { title: 'Evidence design', body: 'Use supported case studies, implementation records, or clear capability labels.' },
      { title: 'Conversion path', body: 'Design primary and secondary actions for different readiness levels.' },
      { title: 'Measurement contract', body: 'Define events, attribution fields, CRM ownership, and the qualified outcome.' },
    ],
    process: [
      { title: 'Choose intent', body: 'Select one audience, problem, and decision for the page.' },
      { title: 'Gather proof', body: 'Match supported evidence and useful objections to that decision.' },
      { title: 'Build', body: 'Create a fast, accessible page with a short path to action.' },
      { title: 'Learn', body: 'Review behavior and lead quality before changing the message.' },
    ],
    measures: [
      { title: 'Qualified conversion rate', body: 'Visitors who become inquiries that match the agreed qualification rules.' },
      { title: 'CTA progression', body: 'Movement from page view to CTA click, form start, and form completion.' },
      { title: 'Lead outcome', body: 'Routed, contacted, accepted, and progressed leads by source page.' },
    ],
    example: { title: 'One page, one decision', body: 'A discoverability page for B2B operators should connect visibility gaps to a focused audit rather than offer five unrelated services.', steps: ['Match the search question', 'State the business cost', 'Show the connected system', 'Answer risk and proof questions', 'Offer one relevant audit'] },
    faqs: [
      { question: 'How is a landing page different from a service page?', answer: 'A service page explains an enduring capability. A landing page is usually narrower and aligns one audience or campaign intent to one conversion action.' },
      { question: 'Should every keyword have a landing page?', answer: 'No. Create a page only when the audience, problem, evidence, or decision is materially different. Thin variations create confusion and indexing risk.' },
      { question: 'What makes a landing page citation-ready?', answer: 'Clear definitions, specific scope, visible authorship, supported claims, structured headings, useful FAQs, and a stable canonical URL all help systems interpret the page.' },
    ],
  }),
  discoverability({
    slug: 'entity-consistency', eyebrow: 'Entity consistency',
    title: 'Make your company easier to identify and understand.',
    description: 'Entity consistency aligns company names, services, people, locations, descriptions, and trusted references across owned and third-party sources.',
    directAnswer: 'Entity consistency means the web presents the same clear facts about who a company is, what it does, and how its products, people, and locations relate. Consistency reduces ambiguity for buyers, search engines, and generative systems.',
    buyerQuestion: 'Do search and AI systems understand that our profiles, services, and content describe the same company?',
    outcomes: [
      { title: 'Clear identity', body: 'Core company facts and service language agree across the most visible sources.' },
      { title: 'Reduced ambiguity', body: 'Names, relationships, and offerings are less likely to be confused with other entities.' },
      { title: 'Stronger source alignment', body: 'Owned pages and reputable external profiles reinforce the same factual picture.' },
    ],
    included: [
      { title: 'Entity inventory', body: 'List company, brand, product, person, and location entities that matter to discovery.' },
      { title: 'Fact reconciliation', body: 'Compare descriptions, names, URLs, contact details, and service categories.' },
      { title: 'Structured relationships', body: 'Express supported organization and service relationships in page content and schema.' },
      { title: 'Correction plan', body: 'Prioritize inaccurate or inconsistent high-authority sources.' },
    ],
    process: [
      { title: 'Define', body: 'Approve a source-of-truth profile for each important entity.' },
      { title: 'Compare', body: 'Inspect owned pages, business profiles, directories, social accounts, and citations.' },
      { title: 'Correct', body: 'Update controllable sources and request fixes where third parties are wrong.' },
      { title: 'Monitor', body: 'Recheck high-impact sources after brand, product, or leadership changes.' },
    ],
    measures: [
      { title: 'Fact agreement', body: 'Priority sources matching approved names, descriptions, URLs, and categories.' },
      { title: 'Entity coverage', body: 'Important entities with a complete owned destination and supported relationships.' },
      { title: 'Correction closure', body: 'Material inconsistencies resolved across controlled and third-party profiles.' },
    ],
    example: { title: 'A consistent company record', body: 'A renamed company should not leave old service descriptions and URLs across major profiles.', steps: ['Approve the current company facts', 'Find conflicting profiles', 'Update owned structured data', 'Correct major third-party records', 'Recheck surfaced descriptions'] },
    faqs: [
      { question: 'Is entity consistency just local citation cleanup?', answer: 'No. Local listings can be part of it, but the work also covers brands, products, people, services, organization relationships, and the pages or profiles that define them.' },
      { question: 'Does schema markup fix inconsistent information?', answer: 'Schema helps express facts on owned pages, but it cannot override contradictory content or inaccurate third-party sources. The visible facts must agree first.' },
      { question: 'Which sources should be corrected first?', answer: 'Start with owned properties and the reputable profiles or publications most likely to shape buyer research and machine understanding.' },
    ],
  }),
  discoverability({
    slug: 'existing-content-optimization', eyebrow: 'Existing-content optimization',
    title: 'Improve useful content before producing more of it.',
    description: 'Existing-content optimization updates strong pages to better satisfy current intent, answer real questions, show evidence, and connect to a measurable next step.',
    directAnswer: 'Existing-content optimization evaluates whether a page is accurate, current, distinct, understandable, discoverable, and useful to the buyer. The goal is not to add keywords mechanically; it is to make the page the best owned answer for its intended question.',
    buyerQuestion: 'Which existing pages can produce more visibility and demand with focused improvement?',
    outcomes: [
      { title: 'More value from current assets', body: 'Strengthen pages that already have links, impressions, recognition, or strategic relevance.' },
      { title: 'Clearer answers', body: 'Add direct definitions, examples, evidence boundaries, and updated details.' },
      { title: 'Better journeys', body: 'Connect information pages to relevant services, proof, and conversion actions.' },
    ],
    included: [
      { title: 'Performance review', body: 'Use impressions, queries, engagement, links, conversions, and business importance.' },
      { title: 'Intent fit', body: 'Compare what visitors need with what the page currently explains.' },
      { title: 'Editorial improvement', body: 'Clarify structure, definitions, examples, authorship, evidence, and FAQs.' },
      { title: 'Technical cleanup', body: 'Review canonical, metadata, headings, schema, internal links, and indexability.' },
    ],
    process: [
      { title: 'Select', body: 'Prioritize pages with evidence of demand or strategic value.' },
      { title: 'Diagnose', body: 'Find the smallest content, technical, or conversion gap.' },
      { title: 'Improve', body: 'Make targeted changes without discarding useful equity.' },
      { title: 'Compare', body: 'Measure the same page and query set after enough time has passed.' },
    ],
    measures: [
      { title: 'Relevant visibility', body: 'Impressions and positions for queries that match the page’s intended audience.' },
      { title: 'Answer completeness', body: 'Priority questions resolved clearly on the page without unsupported claims.' },
      { title: 'Business action', body: 'Qualified CTA progression and assisted conversion from the optimized page.' },
    ],
    example: { title: 'Improve the page with existing demand', body: 'A service guide earning impressions but no qualified action may need a direct answer, clearer proof, and a relevant next step rather than a new article.', steps: ['Choose the existing URL', 'Confirm current intent', 'Close answer and evidence gaps', 'Strengthen internal links and CTA', 'Measure the same query set'] },
    faqs: [
      { question: 'Should old content always be refreshed?', answer: 'No. Update content when it has useful equity, business relevance, or a clear path to improvement. Remove or consolidate content that is obsolete, duplicated, or misleading.' },
      { question: 'Will changing a page hurt rankings?', answer: 'Any material change can affect performance. Preserve the URL and useful content, document the baseline, make evidence-based changes, and monitor the same queries afterward.' },
      { question: 'How often should content be reviewed?', answer: 'Use change risk and business importance. Fast-moving technical or regulatory topics need more frequent review than stable evergreen explanations.' },
    ],
  }),
  discoverability({
    slug: 'faq-answer-design', eyebrow: 'FAQ and answer design',
    title: 'Give buyers direct answers without flattening complex decisions.',
    description: 'FAQ and answer design turns repeated buyer questions into concise, accurate answers supported by deeper explanation, evidence, and a useful next action.',
    directAnswer: 'Answer design starts with a real question, provides a self-contained response immediately, and then adds context, conditions, examples, and evidence. It serves people first while making the information easier for search and AI systems to extract accurately.',
    buyerQuestion: 'How can we answer buyer questions clearly enough to earn trust and support answer-engine visibility?',
    outcomes: [
      { title: 'Faster understanding', body: 'Visitors get the essential answer before reading the deeper detail.' },
      { title: 'Fewer vague claims', body: 'Conditions, limitations, definitions, and evidence stay visible.' },
      { title: 'Reusable expertise', body: 'Sales, support, content, and discoverability teams can align around approved answers.' },
    ],
    included: [
      { title: 'Question research', body: 'Collect recurring questions from search, sales, support, product, and customer conversations.' },
      { title: 'Answer contract', body: 'Define the direct response, necessary conditions, proof, and owner for each answer.' },
      { title: 'Page placement', body: 'Put answers where the relevant decision occurs instead of creating isolated FAQ clutter.' },
      { title: 'Structured data review', body: 'Use FAQ markup only when visible content and eligibility rules support it.' },
    ],
    process: [
      { title: 'Collect', body: 'Start with questions real buyers and operators repeatedly ask.' },
      { title: 'Resolve', body: 'Get the factual answer from the responsible subject-matter owner.' },
      { title: 'Structure', body: 'Write the direct answer first, then nuance, example, and next step.' },
      { title: 'Maintain', body: 'Assign review dates for answers likely to change.' },
    ],
    measures: [
      { title: 'Question coverage', body: 'Priority questions with an approved and discoverable answer.' },
      { title: 'Answer use', body: 'Engagement, assisted conversion, support deflection, or sales reuse where measurable.' },
      { title: 'Freshness', body: 'Time-sensitive answers reviewed by the accountable owner on schedule.' },
    ],
    example: { title: 'Direct answer, then decision context', body: 'A pricing question should explain what is known, what changes the scope, and the next useful step without hiding behind “contact us.”', steps: ['State the direct answer', 'Name the variables', 'Show a grounded example', 'Explain the limit', 'Offer the relevant next step'] },
    faqs: [
      { question: 'Does every page need an FAQ section?', answer: 'No. Add FAQs when they resolve real objections or recurring questions that are not already answered naturally in the page.' },
      { question: 'Does FAQ schema guarantee a rich result?', answer: 'No. Structured data helps systems interpret visible content, but search platforms decide whether and how enhanced results appear.' },
      { question: 'How long should a direct answer be?', answer: 'Long enough to be correct and self-contained. Many definitions fit in two or three sentences, while conditional decisions need a concise answer followed by visible nuance.' },
    ],
  }),
  discoverability({
    slug: 'internal-linking', eyebrow: 'Internal linking',
    title: 'Connect important answers into a useful buyer journey.',
    description: 'Internal linking helps people and retrieval systems move between definitions, capabilities, evidence, decisions, and next steps through descriptive contextual links.',
    directAnswer: 'Internal linking is the deliberate connection of related pages within a website. Good links explain the relationship between pages, reinforce hierarchy, distribute discovery signals, and help visitors continue their task.',
    buyerQuestion: 'Can users and search systems reach our most important pages from the content that already earns attention?',
    outcomes: [
      { title: 'Better discovery', body: 'Important pages are reachable through relevant content instead of depending on the sitemap alone.' },
      { title: 'Clear relationships', body: 'Service hubs, feature pages, proof, and insights reinforce a coherent topic system.' },
      { title: 'Stronger progression', body: 'Informational visitors can move to evidence and a relevant business action.' },
    ],
    included: [
      { title: 'Link graph review', body: 'Find orphaned pages, weak hubs, excessive depth, and high-value pages with little support.' },
      { title: 'Context mapping', body: 'Choose links based on the next user question, not a fixed keyword quota.' },
      { title: 'Anchor improvement', body: 'Use descriptive language that sets an accurate expectation for the destination.' },
      { title: 'Template rules', body: 'Build maintainable related-content patterns without flooding every page with links.' },
    ],
    process: [
      { title: 'Map', body: 'Model the service, feature, insight, proof, and conversion relationships.' },
      { title: 'Prioritize', body: 'Identify pages that matter but receive weak contextual support.' },
      { title: 'Connect', body: 'Add the smallest set of useful links in copy, cards, breadcrumbs, and related sections.' },
      { title: 'Validate', body: 'Check crawl paths, destination accuracy, and user progression.' },
    ],
    measures: [
      { title: 'Orphan rate', body: 'Indexable pages without a meaningful internal path.' },
      { title: 'Click depth', body: 'The number of useful navigation steps required to reach priority pages.' },
      { title: 'Progression', body: 'Visitors moving from an answer page to related proof, service, or conversion content.' },
    ],
    example: { title: 'A complete topic path', body: 'An article defining lead routing should connect to the routing feature, relevant automation service, implementation evidence, and a revenue-operations audit.', steps: ['Answer the concept', 'Link the feature detail', 'Link supported proof', 'Return to the service hub', 'Offer the matching audit'] },
    faqs: [
      { question: 'How many internal links should a page have?', answer: 'There is no useful universal count. Add links when they help the reader answer the next question or understand a meaningful relationship.' },
      { question: 'Should anchor text always match a target keyword?', answer: 'No. Anchor text should describe the destination naturally and accurately. Repetitive exact-match wording can make content less useful.' },
      { question: 'Are breadcrumbs enough for internal linking?', answer: 'Breadcrumbs explain hierarchy, but contextual links explain topic and decision relationships. Most useful content systems need both.' },
    ],
  }),
  discoverability({
    slug: 'original-research-planning', eyebrow: 'Original research planning',
    title: 'Create evidence worth referencing, not another opinion piece.',
    description: 'Original research planning turns proprietary observations, operational data, or structured expert analysis into credible, reusable evidence.',
    directAnswer: 'Original research is a transparent analysis that contributes new evidence, a new dataset, or a defensible synthesis. Planning defines the question, method, source boundaries, limitations, review process, and publication format before conclusions are written.',
    buyerQuestion: 'What can our company publish that buyers and credible sources would genuinely use or cite?',
    outcomes: [
      { title: 'Distinct evidence', body: 'Publish a useful finding competitors cannot reproduce by paraphrasing generic advice.' },
      { title: 'Reusable authority', body: 'Turn one transparent study into data pages, executive summaries, sales material, and expert commentary.' },
      { title: 'Citation readiness', body: 'Make methods, dates, definitions, and limitations visible so others can assess the work.' },
    ],
    included: [
      { title: 'Research question', body: 'Choose a decision-relevant question that available evidence can actually answer.' },
      { title: 'Method and definitions', body: 'Define sample, time window, inclusion rules, calculations, and known limits.' },
      { title: 'Evidence governance', body: 'Confirm permission, privacy, anonymization, and reviewer ownership.' },
      { title: 'Publication system', body: 'Plan the canonical report, summary, visual assets, outreach, and future updates.' },
    ],
    process: [
      { title: 'Frame', body: 'Write the research question and the decision it should inform.' },
      { title: 'Validate', body: 'Confirm source quality, permission, definitions, and sample limits.' },
      { title: 'Analyze', body: 'Use reproducible calculations and preserve contradictory findings.' },
      { title: 'Publish', body: 'Show methods, results, limitations, authorship, and update date.' },
    ],
    measures: [
      { title: 'Qualified references', body: 'Relevant publications, experts, or partners that reference the research.' },
      { title: 'Research-assisted demand', body: 'Qualified visits and conversations influenced by the evidence.' },
      { title: 'Reuse', body: 'Approved teams and assets using the same defined findings without metric drift.' },
    ],
    example: { title: 'Evidence before narrative', body: 'A revenue-operations firm could analyze anonymized response-time patterns only after defining the sample, event timestamps, exclusions, and privacy rules.', steps: ['Choose one operational question', 'Define the exact record set', 'Review privacy and permission', 'Analyze reproducibly', 'Publish results and limits'] },
    faqs: [
      { question: 'Does original research require a large survey?', answer: 'No. It can use proprietary operational data, controlled experiments, structured expert review, or a carefully defined public dataset. Method quality matters more than format.' },
      { question: 'Can customer data be used?', answer: 'Only with appropriate permission, privacy controls, anonymization, and contractual review. Sensitive or identifiable data should not be published by default.' },
      { question: 'Will research guarantee backlinks or AI citations?', answer: 'No. Strong evidence improves reference value, but third parties and AI systems decide what they cite.' },
    ],
  }),
  discoverability({
    slug: 'schema-markup', eyebrow: 'Schema markup',
    title: 'Express page meaning with valid structured data.',
    description: 'Schema markup helps machines interpret organizations, services, articles, breadcrumbs, and visible questions without replacing the underlying content.',
    directAnswer: 'Schema markup is machine-readable data that describes visible page entities and relationships using a shared vocabulary such as Schema.org. It should match the page, use the most specific valid type, and never claim facts the visitor cannot verify.',
    buyerQuestion: 'Which structured data is valid for our pages, and how do we implement it without misleading search systems?',
    outcomes: [
      { title: 'Clear machine meaning', body: 'Important page types and relationships are expressed consistently.' },
      { title: 'Lower validation risk', body: 'Remove unsupported properties, stale values, and markup that does not match visible content.' },
      { title: 'Maintainable implementation', body: 'Generate structured data from the same content contract used to render the page.' },
    ],
    included: [
      { title: 'Type selection', body: 'Choose Organization, WebSite, Service, Article, BreadcrumbList, FAQPage, or other supported types by page purpose.' },
      { title: 'Property mapping', body: 'Connect names, URLs, descriptions, dates, authors, and relationships to visible source values.' },
      { title: 'JSON-LD implementation', body: 'Render stable server-side scripts without adding hidden promotional copy.' },
      { title: 'Validation', body: 'Check syntax, graph relationships, rendered HTML, and current platform eligibility guidance.' },
    ],
    process: [
      { title: 'Inspect', body: 'Identify the visible entities and facts the page already supports.' },
      { title: 'Model', body: 'Select types and relationships that accurately represent those facts.' },
      { title: 'Generate', body: 'Use shared code and content sources to limit drift.' },
      { title: 'Verify', body: 'Validate output in rendered HTML and monitor after template changes.' },
    ],
    measures: [
      { title: 'Validation health', body: 'Priority pages with syntactically valid and factually supported markup.' },
      { title: 'Coverage', body: 'Eligible page types expressing their core entities and hierarchy.' },
      { title: 'Drift', body: 'Structured values that no longer match visible content or approved company facts.' },
    ],
    example: { title: 'One content contract, two outputs', body: 'A feature page can render its title, description, FAQs, and breadcrumb visibly while generating matching Service, FAQPage, and BreadcrumbList JSON-LD.', steps: ['Define page facts', 'Render visible content', 'Generate matching JSON-LD', 'Validate rendered HTML', 'Recheck after releases'] },
    faqs: [
      { question: 'Does schema markup improve rankings?', answer: 'Structured data can improve understanding and eligibility for certain search features, but it does not guarantee rankings or enhanced results.' },
      { question: 'Should every page use FAQPage schema?', answer: 'No. Use it only when the page visibly contains genuine questions and answers and when the markup remains appropriate under current search guidelines.' },
      { question: 'Can structured data include information not shown on the page?', answer: 'Important claims should be visible and supported. Hidden or misleading markup creates trust and eligibility risk.' },
    ],
  }),
  discoverability({
    slug: 'search-intent-mapping', eyebrow: 'Search-intent mapping',
    title: 'Align every important query with the decision behind it.',
    description: 'Search-intent mapping connects buyer questions to the right page type, evidence, message, and next action across the full research journey.',
    directAnswer: 'Search-intent mapping identifies what a person is trying to understand or accomplish, then assigns that need to one useful page. It goes beyond keyword volume by considering audience, problem, stage, required evidence, and business relevance.',
    buyerQuestion: 'What is the buyer actually trying to decide when they use this query?',
    outcomes: [
      { title: 'Useful page choices', body: 'Build service, feature, comparison, guide, or conversion pages based on the real task.' },
      { title: 'Reduced overlap', body: 'Give each material intent one canonical destination.' },
      { title: 'Business alignment', body: 'Prioritize topics that connect expertise to qualified demand, not traffic alone.' },
    ],
    included: [
      { title: 'Query and question set', body: 'Combine search data, customer language, sales objections, and category research.' },
      { title: 'Intent classification', body: 'Separate definitions, problems, comparisons, evaluation, implementation, and action.' },
      { title: 'Page assignment', body: 'Match each cluster to an existing destination, an improvement, or a justified new page.' },
      { title: 'Conversion relationship', body: 'Define the next useful action for each stage without forcing every visitor into a sales form.' },
    ],
    process: [
      { title: 'Collect', body: 'Gather language from search, customers, sales, support, and product teams.' },
      { title: 'Interpret', body: 'Identify the underlying task and evidence needed for a satisfactory answer.' },
      { title: 'Assign', body: 'Choose one canonical page and a relevant next step.' },
      { title: 'Validate', body: 'Compare actual surfaced results and page behavior with the intent hypothesis.' },
    ],
    measures: [
      { title: 'Priority intent coverage', body: 'Business-relevant tasks with a complete canonical destination.' },
      { title: 'Query fit', body: 'Search impressions and engagement that align with the page’s declared purpose.' },
      { title: 'Qualified progression', body: 'Visitors moving to a relevant service, proof, tool, or inquiry.' },
    ],
    example: { title: 'One phrase can hide different decisions', body: '“CRM automation” may represent a definition, vendor comparison, implementation problem, or service search. Each deserves a different answer, not duplicated copy.', steps: ['Collect the phrase variants', 'Inspect the underlying task', 'Separate material intents', 'Assign canonical destinations', 'Measure query and user fit'] },
    faqs: [
      { question: 'Is search intent always informational or transactional?', answer: 'Those labels are useful but broad. Effective mapping also captures audience, problem maturity, required evidence, implementation context, and the next decision.' },
      { question: 'Can one page serve several related queries?', answer: 'Yes. One strong page should cover closely related language that expresses the same underlying task.' },
      { question: 'How does AI search change intent mapping?', answer: 'Buyers may ask longer, comparative, and contextual questions. The core discipline remains the same: understand the task and provide one clear, evidence-supported destination.' },
    ],
  }),
  discoverability({
    slug: 'technical-seo', eyebrow: 'Technical SEO',
    title: 'Build a fast, crawlable, and understandable search foundation.',
    description: 'Technical SEO keeps important pages accessible, indexable, canonical, performant, and observable across releases.',
    directAnswer: 'Technical SEO is the engineering work that helps search engines discover, render, interpret, and index the intended version of a page. It includes crawl controls, status codes, canonicals, rendering, performance, structured metadata, and release monitoring.',
    buyerQuestion: 'Can search systems reliably reach and index the right content without wasting attention on broken or duplicate routes?',
    outcomes: [
      { title: 'Reliable discovery', body: 'Important pages return stable responses and appear in crawl and sitemap paths.' },
      { title: 'Clear index signals', body: 'Canonicals, redirects, robots rules, and status codes agree on the intended URL.' },
      { title: 'Safer releases', body: 'Technical search checks become part of deployment verification rather than an occasional audit.' },
    ],
    included: [
      { title: 'Crawl and index review', body: 'Inspect robots rules, sitemap coverage, status codes, canonicals, and duplicate paths.' },
      { title: 'Rendering review', body: 'Confirm important content and metadata exist in stable rendered output.' },
      { title: 'Performance triage', body: 'Find avoidable client work, asset weight, layout shifts, and unstable dependencies.' },
      { title: 'Release monitoring', body: 'Check priority routes, metadata, schema, and machine-readable endpoints after deployment.' },
    ],
    process: [
      { title: 'Reproduce', body: 'Observe the live response, rendered page, and index signals before reading code.' },
      { title: 'Trace', body: 'Follow route generation, metadata, redirects, and runtime dependencies.' },
      { title: 'Fix narrowly', body: 'Change the smallest responsible layer and preserve working URLs.' },
      { title: 'Verify live', body: 'Recheck production responses and rendered output after deployment.' },
    ],
    measures: [
      { title: 'Indexable route health', body: 'Priority URLs returning the intended status, canonical, metadata, and content.' },
      { title: 'Discovery consistency', body: 'Agreement among navigation, sitemap, robots rules, canonicals, and redirects.' },
      { title: 'Delivery quality', body: 'Performance and stability measures appropriate to the page and framework.' },
    ],
    example: { title: 'The release is not done at build success', body: 'A new page must build, deploy, return the correct status, expose its canonical and schema, appear in discovery files, and render on mobile.', steps: ['Build the route', 'Check generated output', 'Deploy', 'Verify live HTML and status', 'Monitor index signals'] },
    faqs: [
      { question: 'Is technical SEO only about page speed?', answer: 'No. Speed matters, but crawl access, status codes, rendering, canonicals, redirects, sitemap coverage, structured metadata, and release reliability are also core concerns.' },
      { question: 'Does a successful build prove a page is indexable?', answer: 'No. Production routing, access controls, robots directives, canonical values, runtime errors, and rendered content must also be verified.' },
      { question: 'How often should technical SEO be audited?', answer: 'Continuously for critical release checks, with deeper reviews after routing, framework, CMS, domain, or navigation changes.' },
    ],
  }),
  discoverability({
    slug: 'third-party-authority-strategy', eyebrow: 'Third-party authority strategy',
    title: 'Earn consistent references beyond your own website.',
    description: 'Third-party authority strategy identifies the reputable publications, communities, profiles, partners, and data sources that shape buyer and machine understanding.',
    directAnswer: 'Third-party authority is the credible evidence about a company that exists outside its own website. A responsible strategy improves factual profiles, contributes useful expertise, publishes reference-worthy evidence, and earns relevant mentions without manufacturing endorsements.',
    buyerQuestion: 'Which external sources influence trust in our category, and what legitimate contribution can we make?',
    outcomes: [
      { title: 'Broader trust surface', body: 'Relevant external sources describe the company and expertise accurately.' },
      { title: 'Useful participation', body: 'Contribute evidence, tools, expert analysis, and partnerships rather than generic promotion.' },
      { title: 'Consistent references', body: 'High-impact profiles and mentions reinforce approved facts and canonical pages.' },
    ],
    included: [
      { title: 'Authority landscape', body: 'Map sources buyers and retrieval systems use for category research.' },
      { title: 'Profile accuracy', body: 'Correct controllable business, partner, and professional records.' },
      { title: 'Contribution plan', body: 'Match expert commentary, research, tools, events, and partnerships to relevant audiences.' },
      { title: 'Reference monitoring', body: 'Track meaningful mentions, links, factual accuracy, and the destinations they support.' },
    ],
    process: [
      { title: 'Identify', body: 'Find credible sources with real relevance to the buyer and category.' },
      { title: 'Qualify', body: 'Assess editorial quality, audience fit, reputation, and contribution rules.' },
      { title: 'Contribute', body: 'Offer useful expertise or evidence with clear attribution and no fabricated proof.' },
      { title: 'Maintain', body: 'Monitor accuracy and sustain the relationships that produce real value.' },
    ],
    measures: [
      { title: 'Relevant references', body: 'Credible mentions and links from sources that matter to the category.' },
      { title: 'Fact accuracy', body: 'Priority external profiles and descriptions matching approved company information.' },
      { title: 'Assisted demand', body: 'Qualified discovery and conversions influenced by reputable third-party sources.' },
    ],
    example: { title: 'Authority is earned through contribution', body: 'A technical firm can publish a transparent benchmark, brief a specialist publication, and maintain accurate partner profiles without buying low-quality link placements.', steps: ['Map trusted category sources', 'Choose a useful evidence asset', 'Contribute with transparent authorship', 'Link to the canonical evidence', 'Measure relevant referral and reference use'] },
    faqs: [
      { question: 'Is third-party authority strategy link building?', answer: 'Relevant links may result, but the strategy is broader: factual consistency, expert contribution, credible mentions, partnerships, reviews, datasets, and sources buyers actually trust.' },
      { question: 'Do you guarantee placements?', answer: 'No. Editors, communities, and platforms control what they publish. The work improves contribution quality and source relevance without promising coverage.' },
      { question: 'Should we use paid directories?', answer: 'Only when the directory has legitimate audience or operational value and the relationship is represented transparently. Volume alone is not authority.' },
    ],
  }),

  automation({
    slug: 'api-integrations', eyebrow: 'API integrations',
    title: 'Connect business systems through explicit, observable contracts.',
    description: 'API integrations move approved data and actions between tools with defined ownership, validation, retries, and failure visibility.',
    directAnswer: 'An API integration is a controlled software connection between systems. A reliable integration defines what enters, how it is transformed, what leaves, who owns failures, and how operators can safely retry or reconcile incomplete work.',
    buyerQuestion: 'How do we connect these tools without creating a silent, fragile dependency?',
    outcomes: [
      { title: 'Fewer manual transfers', body: 'Move approved records and actions without repeated copy-and-paste work.' },
      { title: 'Visible failures', body: 'Expose validation errors, provider failures, retries, and unresolved records.' },
      { title: 'Controlled change', body: 'Version mappings and test provider changes before they affect production workflows.' },
    ],
    included: [
      { title: 'Contract definition', body: 'Document source, destination, fields, transformations, timing, and ownership.' },
      { title: 'Authentication and access', body: 'Use scoped credentials and server-side secret handling appropriate to each provider.' },
      { title: 'Resilience', body: 'Add validation, idempotency, rate-limit handling, retries, and dead-letter visibility where needed.' },
      { title: 'Operational tooling', body: 'Provide logs, state, replay rules, and reconciliation reports operators can use.' },
    ],
    process: [
      { title: 'Trace', body: 'Follow one real record through the current input, transformation, and output.' },
      { title: 'Specify', body: 'Agree on field ownership, failure behavior, and completion proof.' },
      { title: 'Isolate', body: 'Build and test the smallest safe connection with non-production data.' },
      { title: 'Observe', body: 'Release with monitoring, alerting, and a rollback or disable path.' },
    ],
    measures: [
      { title: 'Completion rate', body: 'Eligible records reaching the intended destination state.' },
      { title: 'Failure age', body: 'Time unresolved integration failures remain without owner action.' },
      { title: 'Reconciliation accuracy', body: 'Agreement between source, integration ledger, and destination records.' },
    ],
    example: { title: 'A lead integration with a visible trail', body: 'A form submission should create one CRM record, preserve attribution, assign an owner, and show any failed step.', steps: ['Validate submission', 'Create idempotency key', 'Transform approved fields', 'Write the CRM record', 'Record outcome and alert failures'] },
    faqs: [
      { question: 'When should we use an API instead of Zapier or Make?', answer: 'Use the simplest tool that meets the required volume, control, security, transformation, recovery, and observability needs. High-risk or complex workflows often benefit from a direct integration.' },
      { question: 'What makes an integration idempotent?', answer: 'Repeating the same request does not create unintended duplicates or repeat a completed action. This usually requires stable identifiers and explicit operation state.' },
      { question: 'How do you handle provider outages?', answer: 'The design can queue eligible work, retry within safe limits, expose failures, and support reconciliation after recovery. Exact behavior depends on business risk and provider limits.' },
    ],
  }),
  automation({
    slug: 'crm-automation', eyebrow: 'CRM automation',
    title: 'Make the CRM reflect what the revenue team actually needs to do.',
    description: 'CRM automation updates records, ownership, tasks, stages, and notifications from explicit business events instead of manual cleanup.',
    directAnswer: 'CRM automation turns agreed revenue rules into visible actions inside the customer relationship system. It should preserve source context, prevent duplicate work, explain why a record changed, and keep people responsible for judgment-heavy decisions.',
    buyerQuestion: 'Which CRM updates should happen automatically, and which decisions still need a person?',
    outcomes: [
      { title: 'Cleaner ownership', body: 'Records reach the right team with the context required to act.' },
      { title: 'Less administrative work', body: 'Routine updates, task creation, notifications, and stage prerequisites happen consistently.' },
      { title: 'More trusted reporting', body: 'Stage and status changes follow defined events instead of inconsistent manual habits.' },
    ],
    included: [
      { title: 'Lifecycle rules', body: 'Define the events, conditions, and owners for each meaningful state change.' },
      { title: 'Record operations', body: 'Create, update, associate, deduplicate, and enrich records using approved fields.' },
      { title: 'Task and alert design', body: 'Trigger useful work without creating notification fatigue.' },
      { title: 'Audit visibility', body: 'Record automation source, time, reason, and outcome where the CRM supports it.' },
    ],
    process: [
      { title: 'Observe', body: 'Review actual records and operator behavior, not only the documented pipeline.' },
      { title: 'Define', body: 'Agree on stages, properties, required evidence, and human decisions.' },
      { title: 'Automate narrowly', body: 'Start with stable rules and preserve a manual exception path.' },
      { title: 'Reconcile', body: 'Compare automation state with the underlying source records and business outcome.' },
    ],
    measures: [
      { title: 'Ownership completeness', body: 'Qualified records with the intended owner and required context.' },
      { title: 'Lifecycle integrity', body: 'Stage changes supported by the defined event or evidence.' },
      { title: 'Manual correction rate', body: 'Automated records requiring operator cleanup or reversal.' },
    ],
    example: { title: 'Qualification becomes a traceable CRM event', body: 'When a lead meets agreed criteria, the system can update status, assign ownership, create a task, and record the rule used.', steps: ['Capture source data', 'Evaluate qualification rule', 'Update CRM fields', 'Assign owner and task', 'Record the automation outcome'] },
    faqs: [
      { question: 'Can CRM automation fix a poorly defined sales process?', answer: 'No. Automation makes rules execute consistently, including bad ones. The lifecycle and ownership contract should be clarified first.' },
      { question: 'How do you prevent duplicate contacts or deals?', answer: 'Use stable identifiers, provider search rules, idempotent operations, and an explicit policy for matching and merging records.' },
      { question: 'Should automation move deal stages?', answer: 'Only when a reliable event proves the stage requirement. Judgment-based changes should remain human-owned or require approval.' },
    ],
  }),
  automation({
    slug: 'data-synchronization', eyebrow: 'Data synchronization',
    title: 'Keep shared business data aligned without hiding conflicts.',
    description: 'Data synchronization defines field ownership, direction, timing, conflict rules, and reconciliation across connected systems.',
    directAnswer: 'Data synchronization keeps agreed records consistent across systems. A safe design names the source of truth for each field, distinguishes one-way from two-way updates, handles conflicts explicitly, and proves that source and destination agree.',
    buyerQuestion: 'Which system owns each field, and what happens when two systems disagree?',
    outcomes: [
      { title: 'Consistent records', body: 'Teams see the same approved facts in the tools where they work.' },
      { title: 'Visible conflicts', body: 'Ownership and resolution rules replace last-write-wins surprises.' },
      { title: 'Recoverable operations', body: 'Failed or delayed records can be reconciled without broad reprocessing.' },
    ],
    included: [
      { title: 'Ownership matrix', body: 'Assign each synchronized field to an authoritative source and update direction.' },
      { title: 'Identity strategy', body: 'Map stable identifiers and duplicate-handling rules across systems.' },
      { title: 'Change processing', body: 'Define event, batch, schedule, retry, and deletion behavior.' },
      { title: 'Reconciliation', body: 'Compare record counts, values, timestamps, and exceptions on a repeatable basis.' },
    ],
    process: [
      { title: 'Inventory', body: 'List records, fields, systems, volumes, and current update paths.' },
      { title: 'Assign', body: 'Name the source of truth and conflict rule for each field.' },
      { title: 'Test', body: 'Run representative creates, updates, duplicates, failures, and deletes.' },
      { title: 'Reconcile', body: 'Measure agreement and investigate exceptions by record identifier.' },
    ],
    measures: [
      { title: 'Record agreement', body: 'Eligible records matching on defined synchronized fields.' },
      { title: 'Synchronization delay', body: 'Time between authoritative change and accepted destination state.' },
      { title: 'Unresolved exceptions', body: 'Conflicts or failures awaiting a defined owner.' },
    ],
    example: { title: 'One owner per field', body: 'Marketing may own consent source while the CRM owns sales stage; synchronization should not let either system overwrite the other field.', steps: ['Map shared identifiers', 'Assign field ownership', 'Process one direction per field', 'Record conflicts', 'Reconcile source and destination'] },
    faqs: [
      { question: 'Is two-way synchronization always better?', answer: 'No. Two-way sync increases conflict and loop risk. Use it only when both systems legitimately author the same data and conflict behavior is explicit.' },
      { question: 'How are deletions handled?', answer: 'Deletion, archival, and suppression behavior must be defined per record type and privacy requirement. A deletion should not propagate implicitly without review.' },
      { question: 'Can spreadsheets be part of a synchronization system?', answer: 'Yes, when ownership, schema, access, validation, and scale are controlled. They become risky when treated as an invisible source of truth.' },
    ],
  }),
  automation({
    slug: 'lead-qualification', eyebrow: 'Lead qualification',
    title: 'Turn qualification criteria into a clear, reviewable decision.',
    description: 'Lead qualification combines submitted facts, approved enrichment, behavioral signals, and human judgment without disguising assumptions as certainty.',
    directAnswer: 'Lead qualification evaluates whether an inquiry matches agreed business, need, timing, and readiness criteria. The system should show which facts supported the decision, preserve an exception path, and avoid treating an opaque score as truth.',
    buyerQuestion: 'Which inquiries deserve immediate action, nurture, review, or rejection—and why?',
    outcomes: [
      { title: 'Faster prioritization', body: 'High-fit, high-intent inquiries reach the right response path quickly.' },
      { title: 'Explainable decisions', body: 'Teams can see which criteria or missing facts produced the result.' },
      { title: 'Better feedback', body: 'Sales outcomes refine criteria instead of leaving marketing and sales with conflicting definitions.' },
    ],
    included: [
      { title: 'Qualification contract', body: 'Define fit, need, timing, readiness, exclusions, and required data.' },
      { title: 'Signal collection', body: 'Use form answers, source context, approved enrichment, behavior, and CRM history.' },
      { title: 'Decision paths', body: 'Route qualified, nurture, review, duplicate, and invalid outcomes explicitly.' },
      { title: 'Feedback loop', body: 'Compare qualification decisions with acceptance, progression, and closed outcomes.' },
    ],
    process: [
      { title: 'Define', body: 'Agree on criteria with the people accountable for pipeline outcomes.' },
      { title: 'Test', body: 'Apply rules to historical examples and inspect contradictions.' },
      { title: 'Release', body: 'Start with visible recommendations or a narrow automated path.' },
      { title: 'Calibrate', body: 'Update rules only from traceable outcome evidence.' },
    ],
    measures: [
      { title: 'Acceptance rate', body: 'Qualified leads accepted by the responsible sales or service team.' },
      { title: 'False decision review', body: 'Good leads excluded or poor-fit leads prioritized under the current rules.' },
      { title: 'Time to disposition', body: 'Time from inquiry to qualified, nurture, review, or rejected state.' },
    ],
    example: { title: 'A decision with visible evidence', body: 'A lead may qualify because service need, market, timing, and volume match—not because a hidden score crossed an arbitrary threshold.', steps: ['Validate the submission', 'Evaluate explicit criteria', 'Record supporting facts', 'Assign a decision path', 'Compare with downstream outcome'] },
    faqs: [
      { question: 'Should AI qualify leads automatically?', answer: 'AI can summarize or classify approved information, but high-impact decisions need explainable criteria, confidence boundaries, and human review where errors carry meaningful cost.' },
      { question: 'What if important qualification data is missing?', answer: 'Use an explicit incomplete or review state, ask the smallest useful follow-up, and avoid guessing facts that were not provided.' },
      { question: 'How often should qualification rules change?', answer: 'Only when outcome evidence shows a consistent mismatch or the business strategy changes. Version the criteria so past decisions remain understandable.' },
    ],
  }),
  automation({
    slug: 'lead-routing', eyebrow: 'Lead routing',
    title: 'Send every qualified opportunity to the right owner with context.',
    description: 'Lead routing applies territory, service, capacity, account, priority, and availability rules while making exceptions and fallback ownership visible.',
    directAnswer: 'Lead routing assigns an inquiry to the person or queue responsible for the next action. Reliable routing validates the input, evaluates ordered rules, records why an owner was selected, and uses a monitored fallback when no rule matches.',
    buyerQuestion: 'Who owns this lead now, and what happens if the normal routing rule fails?',
    outcomes: [
      { title: 'Clear accountability', body: 'Every eligible lead has one visible owner or monitored queue.' },
      { title: 'Faster response', body: 'Assignment happens at the point of qualification instead of through manual triage.' },
      { title: 'Fewer lost leads', body: 'Unmatched, unavailable, or failed assignments enter an explicit fallback path.' },
    ],
    included: [
      { title: 'Rule hierarchy', body: 'Order account, territory, service, priority, language, capacity, and schedule rules.' },
      { title: 'Availability logic', body: 'Define coverage, absence, capacity, and escalation behavior.' },
      { title: 'Context package', body: 'Deliver source, qualification evidence, message, and required next action with the assignment.' },
      { title: 'Fallback queue', body: 'Monitor leads that do not match or cannot reach the selected owner.' },
    ],
    process: [
      { title: 'Model', body: 'Write the ordered rules and expected owner for representative examples.' },
      { title: 'Challenge', body: 'Test overlaps, missing values, absences, duplicates, and capacity limits.' },
      { title: 'Deploy', body: 'Release with assignment reason, timestamps, and fallback visibility.' },
      { title: 'Audit', body: 'Sample real records and compare routing outcome with the rule contract.' },
    ],
    measures: [
      { title: 'Assignment completeness', body: 'Eligible leads with the intended owner or monitored fallback.' },
      { title: 'Routing accuracy', body: 'Sampled assignments matching the current rule contract.' },
      { title: 'Unowned age', body: 'Time leads remain without an accountable next-action owner.' },
    ],
    example: { title: 'A safe fallback is part of routing', body: 'If a territory rule finds no active owner, the lead should enter a visible response queue—not disappear with a successful webhook status.', steps: ['Validate location and need', 'Apply ordered ownership rules', 'Check owner availability', 'Assign with context', 'Escalate unmatched leads'] },
    faqs: [
      { question: 'Can routing use round robin?', answer: 'Yes, when the eligible owner pool, capacity, fairness rule, availability, and fallback are defined. Round robin alone does not solve territory or expertise requirements.' },
      { question: 'How do you route existing customer inquiries?', answer: 'Account ownership can take precedence when the identity match is reliable. Ambiguous matches should enter review rather than silently reaching the wrong owner.' },
      { question: 'What proves routing worked?', answer: 'The destination accepted the assignment, an accountable owner is visible, the assignment reason is recorded, and fallback monitoring covers failures.' },
    ],
  }),
  automation({
    slug: 'lifecycle-automation', eyebrow: 'Lifecycle automation',
    title: 'Move customers and opportunities through explicit business states.',
    description: 'Lifecycle automation coordinates stage changes, tasks, messages, approvals, and system updates around events that prove a transition occurred.',
    directAnswer: 'Lifecycle automation manages the state of a lead, opportunity, customer, or request over time. Safe automation defines allowed transitions, required evidence, responsible roles, and recovery behavior instead of letting unrelated tools change status freely.',
    buyerQuestion: 'What event proves this record should move to the next state?',
    outcomes: [
      { title: 'Consistent progression', body: 'Stage changes happen from defined evidence rather than habit or guesswork.' },
      { title: 'Timely work', body: 'Tasks, messages, and approvals appear when the responsible person needs them.' },
      { title: 'Explainable state', body: 'Teams can see when, why, and by which rule a transition occurred.' },
    ],
    included: [
      { title: 'State model', body: 'Define lifecycle states, allowed transitions, entry evidence, and exit conditions.' },
      { title: 'Event mapping', body: 'Connect form, CRM, payment, scheduling, support, and product events to state changes.' },
      { title: 'Action orchestration', body: 'Trigger tasks, messages, approvals, and system updates after accepted transitions.' },
      { title: 'Exception handling', body: 'Support pause, correction, reversal, and manual approval where needed.' },
    ],
    process: [
      { title: 'Observe', body: 'Trace real records through the current lifecycle and find ambiguous transitions.' },
      { title: 'Define', body: 'Write the state machine and disallowed transitions in plain language.' },
      { title: 'Automate', body: 'Start with stable, high-volume transitions and visible event history.' },
      { title: 'Review', body: 'Audit exceptions and update the contract before expanding automation.' },
    ],
    measures: [
      { title: 'State integrity', body: 'Records whose current state is supported by the required event.' },
      { title: 'Transition delay', body: 'Time between the proving event and accepted system state.' },
      { title: 'Exception volume', body: 'Blocked, reversed, or manually corrected transitions by reason.' },
    ],
    example: { title: 'A stage is a proven state', body: 'A deal should enter “meeting booked” from an accepted calendar event, not simply because a message sequence was sent.', steps: ['Receive the business event', 'Validate transition prerequisites', 'Write the new state', 'Trigger owned actions', 'Record event and result'] },
    faqs: [
      { question: 'Is lifecycle automation the same as email nurture?', answer: 'No. Email can be one action. Lifecycle automation coordinates the broader business state, ownership, tasks, approvals, data, and communications.' },
      { question: 'Can users override an automated state?', answer: 'Often yes, but the override should require an allowed reason and remain visible in the event history.' },
      { question: 'How should re-entry be handled?', answer: 'Define whether a record can enter the lifecycle again, which prior state is preserved, and how duplicate actions are prevented.' },
    ],
  }),
  automation({
    slug: 'operational-dashboards', eyebrow: 'Operational dashboards',
    title: 'Show what is happening, what needs action, and why.',
    description: 'Operational dashboards connect defined source records to current state, exceptions, ownership, and business outcomes teams can verify.',
    directAnswer: 'An operational dashboard is a decision surface, not a decorative chart collection. It defines each metric, shows freshness and source context, exposes exceptions, and lets operators trace a number back to the records that produced it.',
    buyerQuestion: 'Can the team trust this number and act on it without opening five other systems?',
    outcomes: [
      { title: 'Shared truth', body: 'Metrics use explicit source, grain, filters, time windows, and ownership definitions.' },
      { title: 'Faster intervention', body: 'Current exceptions and aging work appear before a weekly report.' },
      { title: 'Traceable decisions', body: 'Operators can move from summary to the underlying records and responsible workflow.' },
    ],
    included: [
      { title: 'Metric contract', body: 'Define source, grain, formula, stage, date field, timezone, filters, and exclusions.' },
      { title: 'State and exception views', body: 'Show active workload, failures, aging, freshness, and ownership.' },
      { title: 'Drill-through', body: 'Connect aggregates to underlying records or reproducible queries.' },
      { title: 'Freshness visibility', body: 'Display when data was produced and whether refresh is healthy or stale.' },
    ],
    process: [
      { title: 'Decide', body: 'Name the operational decision each view should support.' },
      { title: 'Contract', body: 'Write metric and workflow definitions before choosing visualizations.' },
      { title: 'Validate', body: 'Compare dashboard values with source records using the same window and filters.' },
      { title: 'Operate', body: 'Assign owners for data freshness, exceptions, and definition changes.' },
    ],
    measures: [
      { title: 'Metric reconciliation', body: 'Dashboard totals matching reproducible source queries under the same definition.' },
      { title: 'Data freshness', body: 'Age and health of the data used for current decisions.' },
      { title: 'Action closure', body: 'Exceptions resolved by the accountable owner within the agreed window.' },
    ],
    example: { title: 'A lead dashboard that explains itself', body: 'A “qualified leads” count should expose its date field, qualification rule, source, refresh time, and underlying record identifiers.', steps: ['Define the metric contract', 'Query the source records', 'Render current state and freshness', 'Link to underlying records', 'Reconcile on each release'] },
    faqs: [
      { question: 'What is the difference between an operational dashboard and a report?', answer: 'A report often summarizes a period. An operational dashboard emphasizes current state, ownership, freshness, and exceptions that require action.' },
      { question: 'Why do two dashboards show different totals?', answer: 'Common causes include different sources, record grain, date fields, windows, timezones, stage definitions, filters, exclusions, or refresh times. Compare those before judging either number.' },
      { question: 'Should dashboards update in real time?', answer: 'Only when the decision requires it and sources can support it reliably. Visible freshness is more important than implying real time without proof.' },
    ],
  }),
  automation({
    slug: 'response-automation', eyebrow: 'Response automation',
    title: 'Acknowledge, inform, and escalate inquiries at the right speed.',
    description: 'Response automation sends context-aware acknowledgements and next steps while preserving human ownership for sensitive or complex conversations.',
    seoTitle: 'Response Automation for Qualified Lead Inquiries',
    seoDescription: 'Response automation for qualified inquiries: acknowledge the request, preserve context and consent, assign an owner, and escalate missed response windows.',
    directAnswer: 'Response automation triggers an appropriate message or task after a defined event. It should confirm what happened, set an honest expectation, preserve consent and context, and escalate when automation cannot safely answer.',
    buyerQuestion: 'What should happen in the first minutes after a qualified inquiry arrives?',
    outcomes: [
      { title: 'Immediate acknowledgement', body: 'The buyer knows the inquiry arrived and what to expect next.' },
      { title: 'Relevant next step', body: 'Message and task reflect source, need, qualification, and owner.' },
      { title: 'Human escalation', body: 'Sensitive, ambiguous, or high-value cases reach a responsible person.' },
    ],
    included: [
      { title: 'Trigger contract', body: 'Define the accepted event, required fields, consent, and suppression rules.' },
      { title: 'Message logic', body: 'Match approved content to source, audience, need, and business hours.' },
      { title: 'Channel orchestration', body: 'Coordinate email, SMS, CRM tasks, or internal alerts without duplicate contact.' },
      { title: 'Escalation', body: 'Set timeout, reply, failure, and exception paths with accountable owners.' },
    ],
    process: [
      { title: 'Map', body: 'Trace the current first-response experience for representative inquiries.' },
      { title: 'Approve', body: 'Confirm message, consent, timing, channel, owner, and exception rules.' },
      { title: 'Test', body: 'Use controlled records across business hours, missing data, duplicates, and failures.' },
      { title: 'Monitor', body: 'Measure delivery, replies, escalation, and downstream outcome.' },
    ],
    measures: [
      { title: 'Time to acknowledgement', body: 'Time from accepted inquiry to the first appropriate confirmation.' },
      { title: 'Delivery and reply', body: 'Accepted, delivered, failed, suppressed, and replied messages by channel.' },
      { title: 'Human follow-through', body: 'Qualified inquiries receiving the promised owner action.' },
    ],
    example: { title: 'Automation sets the expectation; a person owns the decision', body: 'A qualified request can receive a clear confirmation immediately while the assigned owner gets context and a response deadline.', steps: ['Accept and validate inquiry', 'Check consent and suppression', 'Send relevant acknowledgement', 'Create owner task', 'Escalate missed response window'] },
    faqs: [
      { question: 'Should automated responses look human?', answer: 'They should be clear and useful, but not deceptive. Identify automated confirmations where appropriate and provide a real path to a person.' },
      { question: 'Can AI write the response?', answer: 'AI can draft from approved context, but sensitive or consequential messages may require review. The design should define allowed content and escalation boundaries.' },
      { question: 'How do you prevent duplicate messages?', answer: 'Use stable event identifiers, channel state, suppression rules, and idempotent send operations before retrying.' },
    ],
  }),
  automation({
    slug: 'sales-follow-up', eyebrow: 'Sales follow-up automation',
    title: 'Keep useful follow-up moving without losing human context.',
    description: 'Sales follow-up automation coordinates tasks, reminders, approved messages, and stop conditions around real buyer activity.',
    directAnswer: 'Sales follow-up automation helps representatives complete the next useful action consistently. It uses defined timing, approved messages, owner tasks, reply detection, and stop rules rather than sending an endless generic sequence.',
    buyerQuestion: 'How do we follow up consistently while respecting buyer context and representative judgment?',
    outcomes: [
      { title: 'Consistent next actions', body: 'Representatives receive clear tasks and context at the right stage.' },
      { title: 'Fewer missed opportunities', body: 'Open conversations and promised actions remain visible.' },
      { title: 'Better buyer experience', body: 'Replies, meetings, status changes, and opt-outs stop irrelevant automation.' },
    ],
    included: [
      { title: 'Sequence design', body: 'Define audience, purpose, timing, channels, content, and completion state.' },
      { title: 'Context and personalization', body: 'Use approved CRM and inquiry facts without inventing familiarity.' },
      { title: 'Stop conditions', body: 'Honor replies, meetings, owner changes, stage changes, suppression, and opt-outs.' },
      { title: 'Representative workflow', body: 'Create tasks and summaries that help a person continue the conversation.' },
    ],
    process: [
      { title: 'Segment', body: 'Separate follow-up paths by buyer need and current relationship.' },
      { title: 'Approve', body: 'Review content, timing, consent, ownership, and stop conditions.' },
      { title: 'Pilot', body: 'Release to a small group and inspect actual messages and CRM state.' },
      { title: 'Improve', body: 'Use replies, meetings, progression, and objections to adjust the sequence.' },
    ],
    measures: [
      { title: 'Action completion', body: 'Promised and assigned follow-up completed within the agreed window.' },
      { title: 'Meaningful response', body: 'Replies and meetings connected to the sequence and audience.' },
      { title: 'Stop-rule accuracy', body: 'Sequences halted correctly after reply, booking, suppression, or state change.' },
    ],
    example: { title: 'A sequence that listens', body: 'When a buyer replies or books, automated messaging stops and the owner receives the full interaction context.', steps: ['Enroll an eligible lead', 'Schedule approved next actions', 'Watch reply and meeting events', 'Stop on a matched event', 'Hand context to the owner'] },
    faqs: [
      { question: 'How many follow-up messages should a sequence send?', answer: 'There is no universal number. Choose the smallest useful sequence based on buyer expectation, sales cycle, channel, consent, and observed response.' },
      { question: 'Should every lead enter the same sequence?', answer: 'No. Qualification, source, relationship, need, stage, owner, consent, and recent activity should shape eligibility.' },
      { question: 'Can automation send from a representative’s address?', answer: 'It can when access, consent, approval, reply handling, identity, and ownership are correctly configured. The representative should understand and control the workflow.' },
    ],
  }),
  automation({
    slug: 'workflow-monitoring', eyebrow: 'Workflow monitoring',
    title: 'Know when automation stops matching reality.',
    description: 'Workflow monitoring exposes state, throughput, delay, failures, retries, and business completion across critical automated processes.',
    directAnswer: 'Workflow monitoring observes whether an automation received the expected input, completed each required step, produced the intended business outcome, and recovered safely from failure. A green infrastructure status alone does not prove the workflow worked.',
    buyerQuestion: 'How will we know a workflow failed before a customer or operator tells us?',
    outcomes: [
      { title: 'Early detection', body: 'Find missing events, provider errors, stuck work, and unusual volume before they become silent loss.' },
      { title: 'Faster diagnosis', body: 'Trace one record through input, transformation, destination, and business state.' },
      { title: 'Safe recovery', body: 'Operators can retry, reconcile, or disable a workflow with clear boundaries.' },
    ],
    included: [
      { title: 'State visibility', body: 'Record received, processing, completed, retrying, failed, and reconciled states.' },
      { title: 'Signal design', body: 'Monitor throughput, latency, failure reason, dependency health, and business completion.' },
      { title: 'Alert ownership', body: 'Route actionable alerts with severity, context, and an accountable response.' },
      { title: 'Recovery runbook', body: 'Document replay safety, manual correction, rollback, and post-recovery validation.' },
    ],
    process: [
      { title: 'Define success', body: 'Name the observable business outcome, not only a successful API response.' },
      { title: 'Instrument', body: 'Add identifiers and state events across each important transformation.' },
      { title: 'Challenge', body: 'Test missing inputs, provider errors, duplicates, delay, and partial completion.' },
      { title: 'Operate', body: 'Review alerts, aging failures, reconciliation, and recurring causes.' },
    ],
    measures: [
      { title: 'End-to-end completion', body: 'Eligible workflow instances reaching the accepted business state.' },
      { title: 'Detection and recovery time', body: 'Time to notice, own, and resolve a material failure.' },
      { title: 'Unreconciled work', body: 'Failed or ambiguous instances without a verified final state.' },
    ],
    example: { title: 'HTTP 200 is not the business outcome', body: 'A lead webhook may succeed while CRM creation or owner assignment fails. Monitoring must follow the record to its final accepted state.', steps: ['Record the input identifier', 'Trace every transformation', 'Confirm destination write', 'Confirm owner and next action', 'Alert or reconcile missing completion'] },
    faqs: [
      { question: 'What is the difference between logs and monitoring?', answer: 'Logs record events. Monitoring turns selected events into current state, trends, alerts, and operational decisions.' },
      { question: 'Should every failure page someone?', answer: 'No. Alert based on customer impact, data risk, recoverability, time sensitivity, and volume. Low-risk failures can enter a visible queue.' },
      { question: 'How do you monitor third-party automations?', answer: 'Use provider run history where available, but also record source and destination state independently so provider success can be reconciled with the business outcome.' },
    ],
  }),

  privateAi({
    slug: 'company-knowledge-ai', eyebrow: 'Company Knowledge AI',
    title: 'Give teams source-backed answers from approved company knowledge.',
    description: 'Company Knowledge AI connects policies, SOPs, product documentation, proposals, and internal files through permission-aware retrieval.',
    directAnswer: 'A company knowledge AI system retrieves relevant passages from approved internal sources and produces an answer that points back to those sources. It should respect existing permissions, admit when evidence is missing, and make knowledge gaps visible.',
    buyerQuestion: 'How can employees find reliable internal answers without searching across folders, chats, and document owners?',
    outcomes: [
      { title: 'Faster knowledge access', body: 'Employees can ask a direct question and inspect the approved source behind the answer.' },
      { title: 'Visible boundaries', body: 'The system distinguishes supported answers, missing evidence, and restricted content.' },
      { title: 'Knowledge improvement', body: 'Repeated unanswered questions reveal documentation and ownership gaps.' },
    ],
    included: [
      { title: 'Source inventory', body: 'Classify repositories, owners, permissions, freshness, sensitivity, and document quality.' },
      { title: 'Retrieval design', body: 'Define parsing, chunks, metadata, filters, citations, and response boundaries.' },
      { title: 'Access control', body: 'Apply user and group permissions before retrieval and response generation.' },
      { title: 'Quality evaluation', body: 'Test representative questions for source relevance, answer support, refusals, and gaps.' },
    ],
    process: [
      { title: 'Connect', body: 'Begin with a small set of approved, owned, and useful sources.' },
      { title: 'Organize', body: 'Add metadata for department, topic, owner, sensitivity, version, and freshness.' },
      { title: 'Deploy', body: 'Release to a defined user group with citations, feedback, logs, and support.' },
      { title: 'Improve', body: 'Review unsupported answers, missing sources, adoption, and access exceptions.' },
    ],
    measures: [
      { title: 'Answer support', body: 'Sampled answers fully supported by the cited approved passages.' },
      { title: 'Successful task use', body: 'Users who find and apply the answer needed for an agreed workflow.' },
      { title: 'Knowledge gaps', body: 'Repeated questions lacking a current, owned, and accessible source.' },
    ],
    example: { title: 'An onboarding answer with evidence', body: 'An employee asks how enterprise onboarding works and receives a concise answer linked to the current launch guide, SOP, and security checklist.', steps: ['Authenticate the employee', 'Apply source permissions', 'Retrieve relevant passages', 'Answer with source citations', 'Capture feedback and gaps'] },
    faqs: [
      { question: 'Is Company Knowledge AI the same as training a model on our data?', answer: 'Not necessarily. Many systems retrieve approved company sources at answer time rather than training a new model on the content.' },
      { question: 'What happens when sources disagree?', answer: 'The system should surface the conflict, prioritize approved ownership and version rules, and avoid presenting an unsupported single answer as fact.' },
      { question: 'Can it connect to Google Drive, Notion, or Slack?', answer: 'Potentially, subject to each source’s access model, content quality, API behavior, and the organization’s security requirements.' },
    ],
  }),
  privateAi({
    slug: 'developer-ai', eyebrow: 'Developer AI',
    title: 'Help engineers navigate code, architecture, and standards with evidence.',
    description: 'Developer AI connects approved repositories, technical documentation, runbooks, and engineering standards through source-linked assistance.',
    directAnswer: 'A developer AI assistant helps engineers find and explain relevant code and documentation within authorized repositories. Useful answers identify the files or documents used, distinguish current code from assumptions, and preserve normal review and deployment controls.',
    buyerQuestion: 'How can engineers understand unfamiliar systems faster without trusting unverified code explanations?',
    outcomes: [
      { title: 'Faster orientation', body: 'Find the responsible modules, interfaces, runbooks, and decisions for a task.' },
      { title: 'Evidence-linked answers', body: 'Explanations point to the exact repository or documentation context used.' },
      { title: 'Preserved engineering control', body: 'Code changes still pass tests, review, security, and release gates.' },
    ],
    included: [
      { title: 'Repository access model', body: 'Define approved repositories, branches, roles, secrets boundaries, and audit requirements.' },
      { title: 'Code retrieval', body: 'Index symbols, paths, documentation, ownership, and architecture relationships.' },
      { title: 'Task workflows', body: 'Support orientation, impact analysis, test discovery, documentation, and review preparation.' },
      { title: 'Safety boundaries', body: 'Keep production credentials, privileged actions, and deployment authority outside unapproved automation.' },
    ],
    process: [
      { title: 'Scope', body: 'Choose one repository and a small set of high-value engineering questions.' },
      { title: 'Connect', body: 'Index approved code and docs with path, branch, and revision context.' },
      { title: 'Evaluate', body: 'Test answers against maintainers and direct code inspection.' },
      { title: 'Expand', body: 'Add workflows only after source accuracy and access behavior are proven.' },
    ],
    measures: [
      { title: 'Source accuracy', body: 'Answers referencing the correct files, symbols, revisions, and documentation.' },
      { title: 'Orientation time', body: 'Time engineers need to find the responsible system context for defined tasks.' },
      { title: 'Correction rate', body: 'Assistant explanations requiring material maintainer correction.' },
    ],
    example: { title: 'Explain a workflow from the repository', body: 'An engineer asks how lead routing works and receives the responsible entrypoint, rule module, tests, data contract, and runbook references.', steps: ['Authorize repository access', 'Retrieve current symbols and docs', 'Explain the trace with file links', 'Flag unknown runtime behavior', 'Validate through tests and review'] },
    faqs: [
      { question: 'Can Developer AI write production code?', answer: 'It can assist with drafts where authorized, but production changes still require the repository’s tests, reviews, security controls, and deployment process.' },
      { question: 'How do you avoid exposing secrets?', answer: 'Exclude secret stores and sensitive files, use scoped repository permissions, filter indexed content, log access, and preserve separate production authorization.' },
      { question: 'Does it replace technical documentation?', answer: 'No. It makes approved documentation and code easier to use, while repeated gaps can show where documentation needs improvement.' },
    ],
  }),
  privateAi({
    slug: 'sales-operations-ai', eyebrow: 'Sales and Operations AI',
    title: 'Prepare routine work from approved business context.',
    description: 'Sales and Operations AI assembles source-backed account context, drafts, summaries, and task support while preserving permission and approval boundaries.',
    directAnswer: 'A Sales and Operations AI system retrieves approved CRM, product, process, and document context to help a user prepare work. It can summarize or draft, but consequential messages, record changes, and external actions should follow explicit authorization rules.',
    buyerQuestion: 'Which repetitive knowledge tasks can AI accelerate without making unapproved decisions or inventing customer facts?',
    outcomes: [
      { title: 'Faster preparation', body: 'Assemble relevant account, process, and product context before a meeting or task.' },
      { title: 'More consistent output', body: 'Use approved language, sources, templates, and current business rules.' },
      { title: 'Controlled action', body: 'Keep sensitive communication and system changes behind human approval.' },
    ],
    included: [
      { title: 'Use-case selection', body: 'Choose bounded tasks such as account briefs, proposal inputs, case summaries, or internal answers.' },
      { title: 'Context contract', body: 'Define allowed sources, field freshness, user permissions, and unsupported assumptions.' },
      { title: 'Output design', body: 'Structure drafts with citations, missing-data flags, confidence boundaries, and approval state.' },
      { title: 'Action controls', body: 'Separate read, draft, recommend, approve, and execute permissions.' },
    ],
    process: [
      { title: 'Select', body: 'Begin with a frequent task that has clear inputs and a reviewable output.' },
      { title: 'Ground', body: 'Connect only the approved sources required for that task.' },
      { title: 'Pilot', body: 'Run with a small user group and mandatory review.' },
      { title: 'Measure', body: 'Compare time, acceptance, corrections, gaps, and business outcome.' },
    ],
    measures: [
      { title: 'Output acceptance', body: 'Drafts or summaries accepted with minor or no correction.' },
      { title: 'Time to ready', body: 'Time from task start to an approved output.' },
      { title: 'Unsupported claim rate', body: 'Outputs containing facts not supported by the allowed sources.' },
    ],
    example: { title: 'A source-backed account brief', body: 'Before a customer meeting, the assistant can compile current CRM context, open issues, approved product notes, and unanswered questions for representative review.', steps: ['Authorize the user', 'Retrieve approved account context', 'Draft with source references', 'Flag missing or conflicting facts', 'Require human approval before use'] },
    faqs: [
      { question: 'Can the assistant update CRM records?', answer: 'It can be designed to recommend or perform approved updates, but write access should be scoped, validated, logged, and separated from read-only use.' },
      { question: 'Can it send customer emails automatically?', answer: 'External sending should require explicit content, identity, consent, and approval rules. High-risk or relationship-sensitive messages should remain human-reviewed.' },
      { question: 'How do you measure time saved?', answer: 'Define the task, baseline method, start and completion points, review effort, and accepted output. Do not rely only on user estimates.' },
    ],
  }),
];

export function featurePath(feature: FeatureContent) {
  return `/services/${feature.service}/${feature.slug}`;
}

export function getFeature(service: string, slug: string) {
  return featurePages.find(feature => feature.service === service && feature.slug === slug);
}

export function getFeaturesForService(service: string) {
  return featurePages.filter(feature => feature.service === service);
}
