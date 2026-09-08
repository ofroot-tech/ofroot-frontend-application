# OfRoot SEO Roadmap

Last updated: 2026-09-08

This document is the implementation log for the OfRoot Technology SEO program. The Codex task titled **OfRoot SEO Orchestrator** is the single coordination thread.

## Primary objective

Increase qualified non-branded organic visibility and Growth Systems Audit bookings by improving index quality, commercial relevance, first-hand evidence, entity authority, and page experience.

## Current baseline

- Live site: https://www.ofroot.technology
- Public sitemap URLs crawled: 77
- URLs returning 200: 77
- Sitemap URLs canonicalized to another URL: 13
- Duplicate title groups found: 6
- Preferred host and HTTPS redirects: working
- Missing-page response: proper 404
- Robots access: working
- Server-rendered metadata and headings: present
- Structured data observed: Organization, ProfessionalService, WebSite, Service, Article, FAQPage, and BreadcrumbList
- Source repository: connected (`ofroot-tech/ofroot-frontend-application`, branch `main`)
- Search Console baseline: pending access and export

## Strategic decision required

Select one primary acquisition wedge for the first six months. Current recommendation:

**AI automation systems for home-service companies**, supported by the existing HVAC/plumbing implementation record and workflow-automation capabilities.

The other two pillars—AI Discoverability and Private Company AI—can remain visible as supporting services, but should not dilute the primary commercial topic until the site has stronger authority.

## Workstreams

### P0 — Measurement and access

- [x] Connect the actual source repository to this workspace.
- [ ] Record Google Search Console totals for the last 28 days and previous comparable period.
- [ ] Export query, page, country, and device performance.
- [ ] Record indexed/not-indexed counts and representative reasons.
- [ ] Verify sitemap submission and last read date.
- [ ] Verify analytics for audit-booking starts and completions.
- [ ] Record Core Web Vitals field data.

### P1 — Index and canonical cleanup

- [x] Remove known noncanonical and campaign URLs from the sitemap. Pending release verification.
- [x] Replace known obsolete aliases and duplicate rewrites with permanent redirects. Pending release verification.
- [x] Replace request-time sitemap `lastmod` values with intentional source dates. Pending release verification.
- [x] Keep campaign pages usable but mark them `noindex,follow`; rebuild selected industry pages before reconsidering indexation.
- [x] Define the `/blog` versus `/insights` consolidation strategy below. Migration is queued after the insight outlines are upgraded.
- [ ] Re-crawl and confirm every sitemap URL is indexable and self-canonical.

Known canonical conflicts:

- `/services` → `/`
- `/services/automation` → `/`
- `/services/integration` → `/`
- `/services/website-app-development` → `/`
- `/services/stability` → `/`
- `/services/growth-systems` → `/`
- `/docs/brand-guide` → `/`
- `/services/ai-audit` → `/services/data-pipeline-sanity`
- `/services/ai-development-integrations` → `/services/llm-agent-integrations`
- `/services/marketing-automation` → `/services/hubspot-meta-integrations`
- `/services/development-automation` → `/services/workflow-automation`
- `/helpr` → `/platform`
- `/ontask` → `/platform`

### P2 — Positioning and commercial pages

- [ ] Map one primary query and buyer intent to each indexable page.
- [ ] Rewrite homepage title, description, H1, and introduction around the selected acquisition wedge.
- [ ] Consolidate overlapping legacy service pages.
- [ ] Add industry-specific problem language, workflows, integrations, constraints, and outcomes.
- [ ] Link commercial pages to the most relevant evidence and educational resources.
- [ ] Ensure each retained page has a distinct purpose and conversion action.

### P3 — Evidence and expertise

- [ ] Publish a substantive About page.
- [ ] Add individual expert profiles and linked bylines.
- [ ] Upgrade the home-services case study with approved baseline and post-launch measures.
- [ ] Seek permission for at least one named customer case study and testimonial.
- [ ] Add implementation screenshots, diagrams, measurement windows, and methodology where appropriate.
- [ ] Document the editorial and technical review process.

### P4 — Editorial system

- [ ] Convert the three current insight outlines into complete resources.
- [ ] Build a six-month topic map from Search Console queries and sales questions.
- [ ] Publish original implementation evidence, benchmarks, templates, and decision tools.
- [ ] Consolidate pages that cannot offer distinct first-hand value.
- [ ] Add contextual internal links among insights, service pages, and case studies.

### P5 — Entity and authority

- [ ] Standardize OfRoot name, description, services, logo, and location across the website, LinkedIn, Crunchbase, X, and relevant profiles.
- [ ] Clearly explain the relationship between OfRoot Technology, OfRoot Health, and product/platform names.
- [ ] Connect structured-data entities with stable `@id` values.
- [ ] Add legitimate partner, customer, association, podcast, publication, and directory citations.
- [ ] Avoid purchased links and bulk guest-post campaigns.

### P6 — Page experience

- [ ] Capture Search Console Core Web Vitals field data.
- [ ] Run mobile and desktop Lighthouse tests on representative templates.
- [ ] Investigate the homepage's approximately 95 KB HTML and roughly 50 script tags if field data is weak.
- [ ] Add an Open Graph sharing image and verify social previews.
- [ ] Re-test accessibility, mobile layout, and booking flow after major releases.

## Initial success metrics

- 100% of sitemap URLs return 200, are indexable, and self-canonical.
- Zero obsolete aliases in the sitemap.
- Growth in non-branded impressions and clicks for the chosen commercial topic.
- Growth in the number of target queries ranking in positions 1–20.
- Growth in qualified organic audit bookings.
- At least one named, measurable case study.
- Good Core Web Vitals at the 75th percentile: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.

## Editorial consolidation strategy

Use `/blog` as the long-term editorial hub and publication archive. It already supports source-controlled articles plus API-backed posts, whereas `/insights` contains three short, template-driven outlines.

Migration sequence:

1. Expand each insight outline into a complete article with first-hand examples, evidence, and a distinct buyer question.
2. Publish the upgraded article at `/blog/<slug>` with complete article metadata and structured data.
3. Update all internal links to the new blog URL.
4. Permanently redirect the matching `/insights/<slug>` URL only after the replacement is live and verified.
5. Redirect `/insights` to `/blog` only when no unique insight pages remain.

Do not redirect the current insight pages yet: doing so now would discard unique content without an equivalent replacement.

## Prioritized release queue

### Release A — Technical index cleanup + AI-agent-ready article

Status: implementation in progress; production deployment blocked on the combined release checks.

- Permanent redirects for retired service aliases, product aliases, and duplicate vanity rewrites.
- Sitemap limited to intended canonical/indexable destinations.
- Stable, intentional sitemap modification dates.
- Campaign landings changed to `noindex,follow` and removed from the sitemap.
- Shared Open Graph image retained in centralized metadata and principal editorial templates.
- Internal links changed from retired service aliases to canonical destinations.
- New AI-agent-ready article and its supporting internal links, owned by the dedicated content task.
- `/services` self-canonical metadata, owned by the content task because that file is shared with its navigation changes.

Release gate:

- Targeted SEO tests, full type-check, production build, and route-level verification must pass.
- Confirm redirects return a permanent status and one hop only.
- Confirm every sitemap URL returns 200 and is self-canonical.
- Confirm campaign pages emit `noindex,follow`.
- Confirm the new article emits canonical, Open Graph, Article, and breadcrumb metadata and is linked from an indexable hub.

### Release B — Editorial consolidation

Status: queued after Release A has been indexed and the three outline replacements are complete.

- Upgrade and migrate the three `/insights` outlines into `/blog`.
- Update internal links, structured data, publication dates, and sitemap entries.
- Add one-to-one permanent redirects only after replacements exist.
- Consolidate the `/insights` hub last.

### Release C — Commercial authority

Status: requires business inputs and Search Console query evidence.

- Select and approve the primary acquisition wedge.
- Add About and individual expert-author pages.
- Upgrade the home-services case study with approved baseline and outcome evidence.
- Align controlled company profiles and earn relevant third-party citations.

## Change log

### 2026-09-08

- Completed public crawl and initial technical/content audit.
- Designated **OfRoot SEO Orchestrator** as the single SEO coordination task.
- Archived the parallel Search Console task to prevent duplicate work.
- Created this roadmap.
- Connected the GitHub source and reconciled the public crawl findings with the implementation.
- Prepared the technical index-cleanup slice without changing the in-progress AI-agent-ready article drafts.
- Defined `/blog` as the long-term editorial hub and sequenced migration to preserve existing content.
