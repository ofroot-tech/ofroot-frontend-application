# Feature: Blog index editorial routing

## Status
Graph state: completed.

Implementation state: verified.

## Objective
Replace the blog index's empty archive dead end with useful, truthful routes to existing editorial content while preserving the featured guide and API-backed posts.

## User or system problem
The live page presents itself as a field-notes hub but currently exposes one article followed by a placeholder saying more notes are being prepared. Visitors cannot quickly choose another relevant topic.

## Current verified behavior
- The canonical `/blog` route returns HTTP content with one `h1`, canonical metadata, Open Graph and Twitter metadata, three JSON-LD blocks, a skip link, and no horizontal overflow at the observed 320px mobile viewport.
- The external post API returned no visible archive cards during the audit.
- The zero-post source path renders `More field notes are being prepared.`
- Three existing structured insight routes are source-controlled in `app/lib/insights-content.ts`.

## Desired behavior
When the API returns zero posts, visitors see three clearly labeled editorial routes based on existing insight records. When posts exist, the existing archive cards remain unchanged.

## Scope
- `app/blog/page.tsx`
- Focused blog rendering test coverage
- Durable Graph Loop feature evidence

## Non-goals
- Inventing posts, customer proof, metrics, or outcomes
- Changing the API, navigation, fonts, logo, global palette, or article route
- Commit, push, merge, preview, or production deployment

## Acceptance criteria
- [x] The featured source-controlled guide remains present.
- [x] Existing API-backed posts still render through the current archive path.
- [x] The zero-post fallback renders three existing insight routes with category, title, description, and accessible link destinations.
- [x] No placeholder promise about future posts remains in the zero-post experience.
- [x] The page preserves one `h1`, keyboard focus styling, responsive balance, and no horizontal overflow.
- [x] Focused tests, typecheck, lint, production build, and local browser checks passed.

## Affected systems
Public Next.js App Router blog index and static rendering tests.

## Dependencies
Existing `insights` content source and current Tailwind v4 utility system.

## Constraints
Preserve OfRoot navy, orange, teal, typography, route taxonomy, and CTA attribution. Use glass only where it improves hierarchy; this content section remains a solid editorial surface.

## Risks
- Mislabeling insights as blog posts. Control: label the routes as structured insights.
- Hiding genuine API posts. Control: change only the zero-item branch.
- Generic equal-card treatment. Control: use an editorial list/grid with restrained surfaces and clear reading order.

## Implementation approach
Import the existing insight records into the blog index and render them only when API posts are absent. Update the existing focused rendering test to assert the honest fallback routes.

## Progress
### Completed
- Audited live mobile structure, metadata, semantics, and overflow.
- Inspected the blog index source, existing insight records, and focused tests.
- Loaded registry skill `leonxlnx/redesign-skill`; rejected conflicting font and animation advice.
- Replaced the zero-post placeholder with three source-controlled structured insight routes.
- Passed focused and full tests, TypeScript, lint, production build, and responsive browser verification.

### Active
- None.

### Blocked
- None.

### Deferred
- Additional published field notes and production release.

## Validation status

| Gate | Status | Evidence | What it proves / does not prove |
|---|---|---|---|
| Scoped diff inspection | passed | E-5 | Confirms the application diff is limited to the blog index and focused test. |
| Static analysis | passed with warnings | E-5 | Lint passed with five pre-existing warnings outside this change. |
| Compiler | passed | E-5 | TypeScript accepted the implementation. |
| Automated tests | passed | E-5 | Focused 5/5 and full 83/83 tests passed. |
| Build | passed | E-5 | Next.js generated 168 routes after the dependency-layout repair. |
| Runtime verification | passed | E-5 | Desktop and mobile rendered checks passed with no overflow or browser errors. |
| Deployment | not performed | | Not authorized. |

## Open questions
None required for the bounded first node.

## Next bounded action
Await user review of the local branch; publication requires separate authorization and the pre-push gate.

## Last reviewed
2026-08-10 — `.graph-runs/completed/20260810T041659Z-blog-index-ui-audit`.

## Consistency check
Passed with no issues or repairs. The graph derives `completed` after E-6 reconciliation.
