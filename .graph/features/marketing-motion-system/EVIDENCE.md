# Evidence

## Evidence: E-1 — current surface and external pattern review
- Date: 2026-08-10
- Graph node: N1
- Method: Production DOM/computed-style inspection of OfRoot, Stripe, Linear, and Vercel; official Vercel animation guidance; Apple Human Interface Guidelines; focused repository source inspection.
- Result: OfRoot already has precise navigation feedback and an 18-second accessible hero orbit, but supporting homepage sections lack shared entrance choreography and most cards lack intentional interaction feedback. Stripe uses a canvas-heavy atmospheric hero; Linear uses 100–160 ms controls, a 2.2-second text shine, long marquees, and simulated product UI; Vercel uses mostly 150–200 ms state feedback. Official guidance converges on CSS-first transform/opacity, short feedback, purposeful motion, and reduced-motion alternatives.
- Exit status: 0
- Remaining uncertainty: Exact OfRoot timing and mobile behavior require implementation and rendered verification.

## Evidence: E-2 — selected UI guidance
- Date: 2026-08-10
- Graph node: N2
- Method: Repository frontend guidance; installed `premium-marketing-redesign`; `ui-skills@0.2.4` category `motion`; retrieved `mengto/animation-systems`.
- Result: Selected `registry:mengto/animation-systems` with repository and Graph Loop precedence. Applied constraints: one strong hero moment, 150–200 ms micro feedback, 400–800 ms section entrances, 40–90 ms stagger, transform/opacity only, CSS before libraries, and reduced-motion visibility.
- Exit status: 0
- Remaining uncertainty: Guidance is advisory; rendered behavior remains the proof gate.

## Evidence: E-3 — bounded motion plan
- Date: 2026-08-10
- Graph node: N3
- Method: Pattern-to-page fit analysis against the current homepage conversion structure.
- Result: Chose hero reading-order entrance, one-time section/card reveals, explicit interactive feedback, and progressive enhancement. Rejected a second continuous hero layer, canvas/WebGL, product simulation, marquee, page transitions, and new dependencies.
- Exit status: 0
- Remaining uncertainty: Implementation and validation remain pending.

## Evidence: E-4 — scoped implementation
- Date: 2026-08-10
- Graph node: N4
- Method: Focused source changes in the existing global observer, homepage markup, global CSS, and a new observer test; `git diff --check` and manual diff inspection.
- Result: Added reusable motion tokens, five-step hero choreography, progressive one-time section reveals, explicit card and CTA feedback, smaller mobile offsets, and reduced-motion overrides. No dependency, copy, route, metadata, data, or semantic-heading change was introduced.
- Exit status: 0
- Remaining uncertainty: Static source inspection did not prove rendered or responsive behavior; N5 supplied that evidence.

## Evidence: E-5 — automated, build, and runtime validation
- Date: 2026-08-10
- Graph node: N5
- Environment: Clean worktree on `update/site-motion-system`; exact dependency tree reused only after SHA-256 equality of both `package-lock.json` files was confirmed (`4c699c62befa73d3891ffa7001ccb2076ff821294e533d6d7315a3b0713fb08d`).
- Commands and results:
  - `npm test -- --runInBand __tests__/revealObserver.test.tsx __tests__/heroGrowthSystemOrbit.test.tsx` — 2 suites, 6 tests passed.
  - `npm test -- --runInBand` — 22 suites, 89 tests passed; existing React act diagnostics remain noisy in unrelated suites.
  - `npx tsc --noEmit` — passed.
  - `npm run lint` — exit 0; only pre-existing warnings in `PublicNavbar.tsx`, `platform-store.ts`, and `subscribe/page.tsx`.
  - `NEXT_DISABLE_BUILD_CACHE=true NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 npm run build` — compiled, typechecked, and generated 168 static pages; homepage 1.5 kB route payload and 241 kB first load.
- Runtime result: Desktop 1440x1000 had no horizontal overflow; hero items used 720 ms entrances staggered from 70–350 ms; the existing orbit remained the sole continuous animation at 18 seconds; offscreen content began at opacity 0/18 px and resolved once to opacity 1/no transform; card hover resolved to -4 px with arrow +4 px; mobile 390x844 had no overflow and used 12 px reveal distance; reduced-motion disabled hero, orbit, and reveal animation; JavaScript-disabled content remained visible and complete.
- Console note: Anonymous runtime requested the existing `/api/auth/me` endpoint and received 401. Source and diff inspection show this authentication-context behavior is outside the motion feature; no motion or page-render error occurred.
- Exit status: 0
- Remaining uncertainty: Local runtime and build evidence do not constitute a published preview or canonical production proof.

## Evidence: E-6 — completion reconciliation
- Date: 2026-08-10
- Graph node: N6
- Method: Final source and Graph Loop diff review; JSON parse; `git diff --check`; search for new `transition: all`, canvas, WebGL, Framer, or GSAP usage; Graph Loop consistency validation.
- Result: The feature remains bounded to the existing observer, homepage, CSS, focused tests, and living records. No new broad transition, continuous animation, rendering library, package, content, route, data, or production mutation was found. The consistency checker reported `issues: []` before terminal reconciliation.
- Exit status: 0
- Remaining uncertainty: The branch is local and uncommitted; no preview-provider or production proof exists.

## Evidence: E-7 — current-main release readiness
- Date: 2026-08-10
- Method: Fetched `origin`, fast-forwarded the feature branch from `88a22af` to current `origin/main` `ade596d`, manually composed the only source overlap in `app/page.tsx`, and reran the required validation stack.
- Results:
  - Focused Jest: 2 suites, 6 tests passed.
  - Full Jest: 22 suites, 89 tests passed; existing unrelated React act diagnostics remain noisy.
  - `npx tsc --noEmit`: passed.
  - `npm run lint`: exit 0 with the same unrelated baseline warnings.
  - Cache-disabled production build: passed; 168 static pages generated; homepage remained 1.5 kB route payload and 241 kB first load.
  - Desktop 1440x1000: current logo loaded, hero sequence remained 720 ms with 70–350 ms delays, orbit remained 18 seconds, CTA stayed 48px tall and hovered to -2px, all section reveals resolved, zero horizontal overflow.
  - Mobile 390x844: CTA stayed 48px tall, zero overflow, 12px reveal distance.
  - Reduced motion: hero, orbit, and reveal animation disabled; all content visible.
  - JavaScript disabled: no content was hidden and the full closing CTA copy remained present.
- Tooling note: The bundled Playwright CLI wrapper could not resolve `playwright-cli`; the already-installed lockfile-matched Playwright package and system Chrome supplied equivalent browser evidence without dependency changes.
- Console note: The only HTTP/console error was the previously documented anonymous `/api/auth/me` 401 outside this diff.
- Remaining uncertainty: No remote branch, pull request, provider preview, merge, deployment, or canonical production verification exists. Publication scope is awaiting explicit user choice.

## Evidence: E-8 — reduced-motion review repair and production-readiness revalidation
- Date: 2026-08-10
- Graph nodes: N7, N8
- Trigger: Unresolved PR #27 review thread `PRRT_kwDOPyojvc6X2BlU` identified hover and active transforms that remained effective under `prefers-reduced-motion: reduce`.
- Repair: Added a bounded reduced-motion override for card hover/active, card-arrow hover, and CTA hover/active transforms. Standard motion, layout, markup, copy, routes, dependencies, and data behavior were unchanged.
- Commands and results:
  - `git diff --check` — passed.
  - Focused Jest — 2 suites, 6 tests passed.
  - Full Jest — 22 suites, 89 tests passed; existing unrelated React act diagnostics remain noisy.
  - `npx tsc --noEmit` — passed.
  - `npm run lint` — exit 0 with the existing unrelated warnings.
  - Cache-disabled production build — passed; 168 static pages generated; homepage remained 1.5 kB with 241 kB first load.
  - Playwright with a 1440x1000 viewport and reduced motion — hero and orbit animation names were `none`; CTA hover, CTA active, card hover, and card-arrow hover transforms were `none`; transition duration was `0s`; no horizontal overflow occurred.
- Local console note: The known anonymous `/api/auth/me` 401 and local-only missing Vercel Analytics script produced diagnostics outside this CSS repair.
- Remaining uncertainty: The repair is not committed or pushed. PR checks, a matching preview, merge, Vercel production identity, and canonical runtime remain unverified for the repaired head.

## Evidence: E-9 — independent-review waiver
- Date: 2026-08-10
- Graph node: N9
- Method: Required pre-push `grill-me` gate presented the absence of independent human approval, the verified repair evidence, the exact release path, and the revert-PR rollback.
- Result: The user replied `waive`, explicitly approving publication without independent human review for this bounded release.
- Remaining uncertainty: The waiver authorizes the release path; it does not replace refreshed PR checks, exact preview verification, merge proof, Vercel production identity, or canonical runtime proof.
