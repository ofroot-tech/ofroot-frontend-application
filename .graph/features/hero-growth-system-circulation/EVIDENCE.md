# Evidence

## Evidence: E-1 — production and source identity
- Date: 2026-08-10
- Graph node: N1
- Command or verification method: Chronicle current-frame review; Chrome DOM snapshot of `https://www.ofroot.technology/`; GitHub code search; clean worktree from `origin/main` at `b8237d5`.
- Result: The requested target is the desktop homepage hero graphic containing `One connected growth system`, `Discover`, `Convert`, and `Operate`. The exact source is `app/page.tsx` in `ofroot-tech/ofroot-frontend-application`.
- Exit status: 0
- Remaining uncertainty: Production publication is outside this request and is not implied by local implementation.

## Evidence: E-2 — selected UI guidance
- Date: 2026-08-10
- Graph node: N2
- Command or verification method: `npx --yes ui-skills@0.2.4 start`; `categories`; `list --category motion`; `get pbakaus/animate`; repository frontend and brand guide review.
- Result: Selected `registry:pbakaus/animate`. Applied constraints: one purposeful focal motion, CSS transform/keyframes, no dependency, static default, offscreen/hidden pause, and reduced-motion fallback.
- Exit status: 0
- Remaining uncertainty: Registry guidance is advisory and must be verified in the rendered application.

## Evidence: E-3 — bounded implementation plan
- Date: 2026-08-10
- Graph node: N3
- Command or verification method: Comparison of three approaches against the current hero geometry.
- Result: Whole-diagram rotation was rejected because it makes text unreadable; ring pulse was rejected because it does not show circulation; orbit plus counter-rotation was selected as the smallest clear implementation.
- Exit status: 0
- Remaining uncertainty: Actual clipping, synchronization, and reduced-motion behavior require browser validation.

## Evidence: E-4 — bounded implementation
- Date: 2026-08-10
- Graph node: N4
- Command or verification method: Scoped source implementation and `git diff --check`.
- Result: Added `HeroGrowthSystemOrbit`, replaced only the existing inline hero graphic, added transform-only orbit/counter-rotation CSS, and added three focused lifecycle tests. Hero copy, links, layout, and dependencies are unchanged.
- Exit status: 0
- Remaining uncertainty: None at the source-scope gate; rendered behavior is covered by E-5.

## Evidence: E-5 — automated, build, and runtime validation
- Date: 2026-08-10
- Graph node: N5
- Command or verification method: Focused Jest; full Jest; TypeScript; Next lint; production build; Chrome desktop sampling; offscreen scroll; system-Chrome reduced-motion and mobile contexts; browser console review.
- Result: Focused tests passed 3/3; full tests passed 86/86 across 21 suites; typecheck exited 0; lint exited 0 with five pre-existing warnings outside changed files; the 168-route production build passed. Desktop runtime showed an 18-second running orbit, label positions changed over 900 ms, track/label transforms remained inverse, and offscreen state changed to paused. Reduced motion resolved both animations and transforms to `none`. At 390 px, the existing desktop-only visual remained hidden, the H1 and primary CTA remained visible, and body width equaled viewport width. Browser console had no warnings or errors.
- Exit status: 0
- Remaining uncertainty: The change is local only. No preview, deployment, or canonical production verification was requested or performed.

## Evidence: E-5A — validation recovery record
- Date: 2026-08-10
- Graph node: N5
- Command or verification method: Initial focused-test and standalone Playwright attempts.
- Result: The first focused test was blocked because the clean worktree lacked local executables. Lockfile hashes matched, so the existing exact dependency tree was hard-linked without changing manifests. The first mounted test then exposed an unnecessary `MessageChannel` assumption and was repaired to assert the real client DOM. Bundled Playwright lacked a downloaded browser; the same reduced-motion and mobile checks passed using installed system Chrome.
- Exit status: mixed before successful recovery
- Remaining uncertainty: None for the required gates; the absent bundled Playwright browser remains an optional environment gap.

## Evidence: E-5B — premium marketing audit
- Date: 2026-08-10
- Graph node: N5
- Command or verification method: `premium-marketing-redesign` audit rubric applied to current source, production-like build, and local runtime.
- Result: 97/100. Performance and delivery 32/35; SEO and indexability 30/30; GEO and machine-readable discoverability 20/20; brand clarity and UX 15/15. The only deduction is the pre-existing 241 kB homepage first-load bundle and existing repository warnings; this motion adds no dependency and only a small client component.
- Exit status: 0
- Remaining uncertainty: Production performance is unchanged until a separately authorized release occurs.

## Evidence: E-6 — Graph Loop consistency
- Date: 2026-08-10
- Graph node: N6
- Command or verification method: `python3 /Users/ofroot/.agents/skills/graph-loop-engineering/scripts/validate_graph_consistency.py --graph .graph/features/hero-growth-system-circulation/GRAPH.json --feature .graph/features/hero-growth-system-circulation/FEATURE.md --evidence .graph/features/hero-growth-system-circulation/EVIDENCE.md`
- Result: The pre-completion graph was internally consistent with derived status `incomplete` only because the completion-review node was still active. No issues or repairs were reported. The node was then reconciled to completed and the checker was rerun.
- Exit status: 0
- Remaining uncertainty: Local completion is not publication or canonical production proof.

## Evidence: E-7 — publication approval and preflight
- Date: 2026-08-10
- Graph node: N7
- Command or verification method: User approval following the mandatory grill-me gate; `git fetch origin main`; Git/GitHub/Vercel CLI readback.
- Result: The user approved commit, push, preview verification, squash merge to `main`, production publication, and canonical verification. The branch starts exactly at current `origin/main` (`b8237d5`), GitHub authentication is active as `ofroot-tech`, and `www.ofroot.technology` resolves to the healthy Vercel `main-website` production project.
- Exit status: 0
- Remaining uncertainty: Preview and post-merge production behavior remain unverified until the branch is published.
