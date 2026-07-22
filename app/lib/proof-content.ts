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
    slug: 'home-services-mvp',
    category: 'Home services',
    title: 'A production workflow launched in 30 days.',
    description: 'How a home-services operator launched intake, scheduling, invoicing, and payments through one production workflow.',
    evidenceLabel: 'Documented project outcome',
    featuredResult: '30 days',
    featuredResultLabel: 'from scoped build to production launch',
    summary: 'OfRoot delivered one operating path from customer intake through payment, supported by role controls, observability, deployment automation, and recovery documentation.',
    context: 'An early-stage HVAC and plumbing operator needed production-ready intake and scheduling without building a full internal engineering team.',
    problem: 'After-hours demand, estimates, invoices, and reminders were split across calls and spreadsheets. Every handoff increased delay and made ownership harder to see.',
    constraints: 'The first release needed to be narrow, production-safe, and usable by operators while preserving clear rollback and handoff paths.',
    approach: [
      'Scoped intake, scheduling, estimates, invoices, and Stripe payments as one release path.',
      'Reused secure foundations for authentication, role controls, observability, and preview deployments.',
      'Validated the flow with fixtures, weekly demos, incident runbooks, and explicit rollback steps.',
    ],
    outcomes: [
      'The production workflow launched within the documented 30-day delivery window.',
      'Intake, scheduling, estimates, invoices, and payments moved through one operating path.',
      'Operators received runbooks, incident guidance, and a visible ownership model for ongoing use.',
    ],
    delivered: [
      'AI-assisted intake routing with operator guardrails.',
      'Scheduling, estimating, invoicing, payment, and reminder workflows.',
      'Deployment automation, operational checks, runbooks, and handoff documentation.',
    ],
    relatedService: { label: 'Automation Systems', href: '/services/automation-systems' },
  },
  {
    slug: 'crm-erp-sync',
    category: 'Revenue operations',
    title: 'CRM and ERP synchronization with visible failure recovery.',
    description: 'How an operations team replaced brittle synchronization scripts with explicit ownership, retries, recovery paths, and reporting automation.',
    evidenceLabel: 'Anonymized implementation record',
    featuredResult: 'One source-of-truth map',
    featuredResultLabel: 'with explicit field ownership and exceptions',
    summary: 'OfRoot replaced implicit sync behavior with documented rules, idempotent processing, visible failures, and recoverable operations.',
    context: 'A revenue-operations team depended on CRM and ERP records that represented the same customers and transactions differently.',
    problem: 'Teams reconciled discrepancies manually and could not explain which system owned each field or why a synchronization failed.',
    constraints: 'The integration had to improve reliability without interrupting active sales, finance, or reporting workflows.',
    approach: [
      'Defined the source of truth for each shared field and documented exceptions.',
      'Added idempotency, retries, dead-letter handling, and recoverable error states.',
      'Added alerts, operational dashboards, audit reporting, and small release slices.',
    ],
    outcomes: [
      'Synchronization rules and ownership became explicit and reviewable.',
      'Failures became visible, assigned, and recoverable instead of silent.',
      'Operations gained an audit path for changes without depending on ad hoc engineering investigation.',
    ],
    delivered: [
      'Source-of-truth and ownership map.',
      'Retry, idempotency, and failure-recovery controls.',
      'Operational alerts, runbooks, and reporting automation.',
    ],
    relatedService: { label: 'Automation Systems', href: '/services/automation-systems' },
  },
  {
    slug: 'healthcare-ai-automation',
    category: 'Operations',
    title: 'AI-assisted routing with human-readable operational controls.',
    description: 'How an anonymized operations team improved workflow visibility with routing, summarization, observability, and runbooks.',
    evidenceLabel: 'Anonymized implementation record',
    featuredResult: 'Earlier signals',
    featuredResultLabel: 'through actionable alerts and owner-aware routing',
    summary: 'OfRoot clarified the critical workflow, reduced ambiguous handoffs, and added AI assistance only where operators retained context and control.',
    context: 'A healthcare operations team relied on time-sensitive processes spread across systems, checklists, and team knowledge.',
    problem: 'Incidents surfaced late, response paths were inconsistent, and leaders lacked one explainable view of operational health.',
    constraints: 'Changes had to reduce operational friction without presenting unsupported compliance claims or automating sensitive decisions without review.',
    approach: [
      'Mapped the critical workflow and made ownership visible at each handoff.',
      'Added actionable alerts, routing assistance, and summarization with operator safeguards.',
      'Released small changes with runbooks, rollback paths, and weekly health review inputs.',
    ],
    outcomes: [
      'Operational issues had clearer detection and response paths.',
      'Routing delivered the right context to an identified owner.',
      'Leadership received a more consistent view of workflow health and recurring gaps.',
    ],
    delivered: [
      'Critical-path workflow and owner map.',
      'AI-assisted routing and summarization modules.',
      'Alerts, runbooks, incident patterns, and operational health reporting.',
    ],
    relatedService: { label: 'Private Company AI', href: '/services/private-company-ai' },
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}
