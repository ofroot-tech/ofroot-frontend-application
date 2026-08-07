# Feature: AI Process article and production release

## Status
Complete

## Objective
Publish the AI Process experience with a source-controlled supporting blog article and durable contextual internal links, then verify the canonical production routes.

## Acceptance criteria
- A premium article at `/blog/find-expensive-manual-work-before-automating` teaches readers how to identify, cost, score, and measure automation opportunities without unsupported claims.
- The article has canonical metadata, Open Graph and Twitter metadata, BlogPosting and BreadcrumbList structured data, accessible headings, and a decisive AI Process Audit CTA.
- `/blog` features the article even when the external blog API is unavailable.
- `/ai-process`, `/automations`, and the Automation Systems content link contextually to the article or AI Process page without keyword stuffing.
- Sitemap and llms.txt include the article.
- Automated tests, TypeScript, lint, production build, and desktop/mobile runtime checks pass before publication.
- The pre-push grill-me gate resolves the highest-risk release question.
- The intended commit is published through the `ofroot-tech` GitHub account, merged to `main`, deployed by Vercel project `main-website`, and both canonical routes are read back directly.

## Non-goals
- Production database blog writes.
- Redesigning dashboard blog authoring or changing the external blog API.
- Inventing testimonials, customer metrics, or guaranteed ROI.
- Changing DNS, authentication policy, billing, or database state.

## Design
- Blog index: editorial hero, one source-controlled featured guide, then existing API-backed posts.
- Article: identity-led hero, direct answer, workflow diagnostic, cost model, scoring model, reversible implementation gate, measurement plan, FAQ, and audit CTA.
- Internal-link loop: AI Process page to guide; guide to AI Process, Automation Systems, and attributed booking; Automations and Automation Systems to AI Process or guide.
- Empty state: the featured article remains visible if the external blog API returns no posts.

## Release boundary
- Repository: `ofroot-tech/ofroot-frontend-application`.
- Branch: `update/ai-process-audit`.
- Production branch: `main`.
- Vercel owner/project: `ofroot-tech/main-website` (`prj_vYX0oIVtZqkm3iZKyeXgHmgNWaAp`).
- Canonical host: `https://www.ofroot.technology`.
- GitHub publication account: `ofroot-tech`; restore prior active CLI profile `dimitri-sleeps` after publication.

## Risks and controls
- Dynamic blog dependency: use a source-controlled static article route and a featured index card.
- SEO duplication: use one canonical article route and descriptive contextual anchors.
- Production drift: merge the reviewed branch to `main`, wait for the matching Vercel commit, then verify each canonical route.
- Rollback: revert the single release commit or PR merge and redeploy `main`.

## Completion proof
- PR #17 merged to `main` as `98e52a83dc4f1d937090fa111f2fae993f1058e8`.
- Vercel production deployment `dpl_9JQEpe7XXcLEf1GepcDKVeMe9kx7` reached Ready for that exact commit and attached both canonical aliases.
- Direct readback returned HTTP 200 for the page, blog index, article, automation pages, sitemap, and llms.txt; expected headings, metadata, links, and responsive layouts were present.
- The authenticated dashboard route remains protected and redirects unauthenticated requests to login.

## Next bounded action
None. Monitor ordinary production analytics and error reporting.

## Last reviewed
2026-08-07
