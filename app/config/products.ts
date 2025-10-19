// app/config/products.ts
// Central catalog for products and services that map to subscribe variants.
// Keep copy clear, pricing honest, and structure typed for safety.

export type PlanCycle = { monthly: string; yearly: string };

export type ProductConfig = {
  slug: string;
  kind: 'product' | 'service';
  name: string;
  anchorPrice: string; // For marketing copy: "Normally $X/mo"
  heroTitle?: string;
  heroSubtitle?: string;
  planPrices?: Partial<Record<'pro' | 'business', PlanCycle>>;
  includes?: string[]; // Right-column inclusions list
  defaultPlan?: 'pro' | 'business';
  comparison?: {
    competitor: string;
    parity: string[];
    differentiators: string[];
  };
};

export const PRODUCT_CATALOG: Record<string, ProductConfig> = {
  // Products
  ontask: {
    slug: 'ontask',
    kind: 'product',
    name: 'OnTask',
    anchorPrice: '$19',
    heroTitle: 'Start your $1 trial of OnTask',
    heroSubtitle: 'Lightweight task automation for local pros — forms to follow‑ups, done for you.',
    planPrices: {
      pro: { monthly: '$19', yearly: '$190' },
      business: { monthly: '$49', yearly: '$490' },
    },
    includes: [
      'Secure authentication with roles, audit trails, and staff permissions',
      'Automated lead capture, follow-ups, and review campaigns',
      'Estimates, invoices, and payment reminders in one inbox',
      'Embedded reporting that shows source-to-revenue performance',
    ],
    comparison: {
      competitor: 'BluePro',
      parity: [
        'Scheduling, dispatch, job boards, and crew mobile app',
        'Digital estimates, invoices, and financing hand-off',
        'Customer timelines with before/after photos and notes',
      ],
      differentiators: [
        'AI-powered follow-up copy + review nudges shipped automatically',
        'Pre-built marketing landing pages and blog templates included',
        'Hands-on quarterly automation tune-up from the OfRoot team',
      ],
    },
  },
  helpr: {
    slug: 'helpr',
    kind: 'product',
    name: 'Helpr',
    anchorPrice: '$19',
    heroTitle: 'Start your $1 trial of Helpr',
    heroSubtitle: 'Inbound lead capture with fast follow‑ups and reviews — ship in days, not weeks.',
    planPrices: {
      pro: { monthly: '$19', yearly: '$190' },
      business: { monthly: '$49', yearly: '$490' },
    },
    includes: [
      'Lead capture pages',
      'Email/SMS flows and review boosts',
      'Basic analytics and attribution',
      'Sentry observability',
      'Providers can bid on nearby jobs to keep schedules full',
      'Homeowners get competitive, open prices from vetted providers',
    ],
  },

  // Services
  'website-app-development': {
    slug: 'website-app-development',
    kind: 'service',
    name: 'Website & App Development',
    anchorPrice: '$99',
    heroTitle: 'Start your $1 trial — Website & App Development',
    heroSubtitle: 'Full‑stack product engineering: MVPs, SaaS, mobile, and migrations — with performance and observability baked in.',
    planPrices: {
      pro: { monthly: '$99', yearly: '$990' },
      business: { monthly: '$199', yearly: '$1990' },
    },
    includes: [
      'Frontend and backend engineering',
      'CMS and content tooling',
      'Observability and testing harnesses',
    ],
  },
  'development-automation': {
    slug: 'development-automation',
    kind: 'service',
    name: 'Development Automation',
    anchorPrice: '$49',
    heroTitle: 'Start your $1 trial — Development Automation',
    heroSubtitle: 'Ship features faster with pipelines, scaffolds, and repeatable integrations.',
    planPrices: {
      pro: { monthly: '$49', yearly: '$490' },
      business: { monthly: '$99', yearly: '$990' },
    },
    includes: [
      'CI/CD + preview deployments',
      'Auth, RBAC, observability',
      'API + frontend scaffolds',
    ],
  },
  'marketing-automation': {
    slug: 'marketing-automation',
    kind: 'service',
    name: 'Marketing Automation',
    anchorPrice: '$49',
    heroTitle: 'Start your $1 trial — Marketing Automation',
    heroSubtitle: 'Capture more demand with landing pages, follow‑ups, and measurement.',
    planPrices: {
      pro: { monthly: '$49', yearly: '$490' },
      business: { monthly: '$99', yearly: '$990' },
    },
    includes: [
      'SEO landing pages and content',
      'Email/SMS automations',
      'Analytics & reporting',
    ],
  },
  // Accept both slugs for AI to be forgiving with links
  'ai-development': {
    slug: 'ai-development',
    kind: 'service',
    name: 'AI Development & Integrations',
    anchorPrice: '$149',
    heroTitle: 'Start your $1 trial — AI Development & Integrations',
    heroSubtitle: 'Assistants, retrieval, and orchestration that measurably improve speed and quality.',
    planPrices: {
      pro: { monthly: '$149', yearly: '$1490' },
      business: { monthly: '$299', yearly: '$2990' },
    },
    includes: [
      'Assistants & workflows',
      'RAG, embeddings, and data pipelines',
      'Integrations with CRMs and back‑office systems',
    ],
  },
  'ai-development-integrations': {
    slug: 'ai-development-integrations',
    kind: 'service',
    name: 'AI Development & Integrations',
    anchorPrice: '$149',
    heroTitle: 'Start your $1 trial — AI Development & Integrations',
    heroSubtitle: 'Assistants, retrieval, and orchestration that measurably improve speed and quality.',
    planPrices: {
      pro: { monthly: '$149', yearly: '$1490' },
      business: { monthly: '$299', yearly: '$2990' },
    },
    includes: [
      'Assistants & workflows',
      'RAG, embeddings, and data pipelines',
      'Integrations with CRMs and back‑office systems',
    ],
  },
  // BluePro niche variants
  'bluepro-plumber': {
    slug: 'bluepro-plumber',
    kind: 'product',
    name: 'BluePro — Plumbers',
    anchorPrice: '$149',
    heroTitle: 'BluePro for Plumbers',
    heroSubtitle: 'Scheduling, invoices, and reviews that drive repeat work.',
    planPrices: {
      pro: { monthly: '$149', yearly: '$1490' },
      business: { monthly: '$399', yearly: '$3990' },
    },
    includes: [
      'Scheduling & dispatch',
      'Invoices & payments',
      'Automated review requests',
    ],
  },
  'bluepro-hvac': {
    slug: 'bluepro-hvac',
    kind: 'product',
    name: 'BluePro — HVAC',
    anchorPrice: '$199',
    heroTitle: 'BluePro for HVAC',
    heroSubtitle: 'Estimates, scheduling, and financing integrations.',
    planPrices: {
      pro: { monthly: '$199', yearly: '$1990' },
      business: { monthly: '$499', yearly: '$4990' },
    },
    includes: [
      'Estimates and quotes',
      'Technician scheduling',
      'Financing integrations',
    ],
  },
  'bluepro-roofer': {
    slug: 'bluepro-roofer',
    kind: 'product',
    name: 'BluePro — Roofers',
    anchorPrice: '$179',
    heroTitle: 'BluePro for Roofers',
    heroSubtitle: 'Lead capture, estimates, and CRM basics.',
    planPrices: {
      pro: { monthly: '$179', yearly: '$1790' },
      business: { monthly: '$449', yearly: '$4490' },
    },
    includes: [
      'Lead capture forms',
      'Estimate templates',
      'Simple CRM and follow-ups',
    ],
  },
  // High-ticket CTO offer (drives Business -> sales dialog)
  cto: {
    slug: 'cto',
    kind: 'service',
    name: 'Fractional CTO',
    anchorPrice: '$2,500',
    heroTitle: 'Fractional CTO',
    heroSubtitle: 'Strategy + execution for serious growth.',
    defaultPlan: 'business',
    planPrices: {
      pro: { monthly: '$2500', yearly: '$25000' },
      business: { monthly: '$6000', yearly: '$60000' },
    },
    includes: [
      'Architecture & roadmap',
      'Hiring & vendor selection',
      'Weekly sprints and demos',
    ],
  },
};
