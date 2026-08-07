# Evidence

## E-1: Clean implementation boundary
- Date: 2026-08-06
- Graph node: N1
- Command or verification method: `git fetch origin main`; `git worktree add -b update/ai-process-audit ... origin/main`; `git status --short --branch`
- Result: Isolated branch created from `origin/main` commit `0654cbe`; original dirty checkout was not modified.
- Exit status: 0
- Remaining uncertainty: No remote publication is authorized or performed.

## E-2: Existing system inspection
- Date: 2026-08-06
- Graph node: N1
- Command or verification method: Focused source inspection of public automations, `/book`, Automation Build, dashboard shell, analytics, metadata, sitemap, and Jest conventions.
- Result: Existing booking attribution and Automation Build ownership were confirmed; no audit-stage or ROI persistence contract exists.
- Exit status: 0
- Remaining uncertainty: Runtime behavior remains unverified until local tests and browser checks run.

## E-3: Bounded design decision
- Date: 2026-08-06
- Graph node: N2
- Command or verification method: Reconciled supplied requirements with existing route and data contracts.
- Result: Chosen architecture composes with `/book` and `/dashboard/automation-build`, uses a shared typed model, and renders honest empty states.
- Exit status: 0
- Remaining uncertainty: Visual quality and responsive behavior require runtime verification.

## E-4: Feature implementation
- Date: 2026-08-06
- Graph node: N3
- Command or verification method: Scoped source inspection and `git diff --check`.
- Result: Added shared typed process metadata, public and dashboard routes, authenticated redirect, dashboard navigation, analytics events, sitemap and llms.txt discovery, and feature tests.
- Exit status: 0
- Remaining uncertainty: No backend persistence was added by design.

## E-5: Automated tests and compiler
- Date: 2026-08-06
- Graph node: N4
- Command or verification method: Bundled Node ran targeted Jest, full Jest, and `tsc --noEmit` against the lockfile-identical dependency tree.
- Result: Targeted AI Process tests passed; full suite passed 19 suites and 78 tests; TypeScript passed.
- Exit status: 0
- Remaining uncertainty: Existing Jest suites emit noisy React act warnings, but no tests failed.

## E-6: Lint
- Date: 2026-08-06
- Graph node: N4
- Command or verification method: Bundled Node ran `node_modules/next/dist/bin/next lint`.
- Result: Passed with four pre-existing warnings in `PublicNavbar.tsx`, `platform-store.ts`, and `subscribe/page.tsx`; no changed-file lint errors.
- Exit status: 0
- Remaining uncertainty: `next lint` is deprecated upstream but remains the repository-defined command.

## E-7: Runtime and responsive verification
- Date: 2026-08-06
- Graph node: N4
- Command or verification method: Local Next dev server, curl readback, and Playwright screenshot CLI using installed Chrome at 1440 px and 390 px.
- Result: `/ai-process` returned 200 with the expected title, canonical, CTAs, structured data, sitemap entry, and llms.txt entry. `/dashboard/ai-process` returned the expected unauthenticated 307 login redirect. Desktop and mobile screenshots showed readable hierarchy with no observed clipping.
- Exit status: 0
- Remaining uncertainty: Authenticated-persona dashboard runtime was not exercised because no test credential or saved browser state was available; the dashboard presentation is covered by server-render tests.

## E-8: Production build blocked by environment
- Date: 2026-08-06
- Graph node: N4
- Command or verification method: Turbopack build and bounded Webpack build cross-check with `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002`.
- Result: Initial Turbopack attempt rejected an external node_modules symlink. After replacing it with a lockfile-identical hard-linked tree, Turbopack stalled with sleeping workers and no output growth, so it was stopped after five minutes. The Webpack cross-check then reached compilation but failed with `ENOSPC: no space left on device, write`. Its 651 MB partial `.next` output was removed.
- Exit status: 130 for stopped Turbopack attempt; 1 for Webpack `ENOSPC`.
- Remaining uncertainty: Production build remains unproved until disk headroom and the default Node runtime are repaired.

## E-9: Premium marketing audit
- Date: 2026-08-06
- Graph node: N4
- Command or verification method: Audit rubric review plus local runtime and screenshots.
- Result: 93/100. Performance and delivery 30/35, SEO and indexability 30/30, GEO and machine-readable discoverability 18/20, brand clarity and UX 15/15.
- Exit status: 0
- Remaining uncertainty: Build proof caps the performance score; llms-full.txt was not added because the existing curated llms.txt is sufficient for this bounded inner route.

## E-10: Completion consistency review
- Date: 2026-08-06
- Graph node: N5
- Command or verification method: `validate_graph_consistency.py` against GRAPH.json, FEATURE.md, and EVIDENCE.md plus final scoped status review.
- Result: No graph contradictions or repairs were reported. The derived terminal state is `completed_with_validation_gap` because the required build gate is blocked.
- Exit status: 0
- Remaining uncertainty: Production build proof remains the only required validation gap.
