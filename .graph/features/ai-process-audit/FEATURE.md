# Feature: AI Process Audit experience

## Status
Completed with validation gap

## Objective
Productize OfRoot's AI implementation method as a public audit sales page and an authenticated client journey without creating a new backend workflow.

## Acceptance criteria
- `/ai-process` explains the five public phases, uses the existing `/book` intake, and contains complete metadata plus BreadcrumbList, Service, and FAQPage structured data.
- `/dashboard/ai-process` is protected by the existing dashboard token gate and renders all ten client stages.
- A shared typed model is the single source for process stage metadata.
- Dashboard navigation exposes AI Process to the same authenticated client and privileged roles that can already access Automation Build.
- Analytics uses the existing event dispatcher for public view, audit CTA, and dashboard view events.
- Missing client ROI, documents, and audit records render explicit empty states rather than invented metrics.
- Targeted tests, type checking, lint, production build, and local runtime checks pass or any gap is recorded honestly.

## Non-goals
- Database migrations or new persistence.
- Audit questionnaire workflows, generated reports, payments, or client document generation.
- Changes to Automation Build's existing progress contract.
- Commit, push, deployment, migration, or production mutation.

## Design
- Public layout: hero, problem framing, five-phase process, audit deliverables, illustrative ROI, implementation examples, FAQ, final CTA.
- Dashboard layout: honest status summary, next action, ten-stage journey, Automation Build handoff, value empty state, document empty state.
- Primary CTA: `/book?focus=ai-process-audit&source=ai-process` with section-specific source values where useful.

## Risks and controls
- Duplication risk: the dashboard page links to Automation Build for implementation detail instead of reimplementing it.
- Data-integrity risk: only the supplied illustrative ROI example may show numbers; it is labeled as illustrative.
- Access risk: the dashboard route uses the same cookie token and redirect contract as Automation Build.
- Navigation risk: the AI Process item follows the same role visibility as Automation Build.

## Next bounded action
Re-run the production build after restoring at least 1 GB of disk headroom and a working default Node runtime. No feature implementation remains.

## Validation summary
- Feature tests: 7 passed.
- Full Jest suite: 19 suites and 78 tests passed.
- Type checking: passed.
- Lint: passed with four pre-existing warnings in untouched files.
- Runtime: public route, metadata, canonical, sitemap, llms.txt, dashboard auth redirect, desktop rendering, and 390 px rendering passed.
- Production build: blocked by local environment. Turbopack stalled after the hard-linked dependency repair; the bounded Webpack cross-check failed with `ENOSPC` while writing its cache.
- Premium marketing audit: 93/100. Performance proof is capped by the blocked production build; SEO, GEO, brand clarity, CTA hierarchy, and responsive runtime checks passed.

## Last reviewed
2026-08-06
