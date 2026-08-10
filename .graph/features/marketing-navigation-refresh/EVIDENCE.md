# Evidence

## Evidence: Baseline source and brand inspection
- Date: 2026-07-27
- Graph node: N1
- Command or verification method: Read `docs/BRAND_GUIDE.md`, `app/components/Navbar.tsx`, `app/layout.tsx`, `app/page.tsx`, and `app/globals.css`; inspect logo dimensions with `sips`.
- Result: The logo is a 1024 × 1024 circular asset; brand guide requires its whitespace and identifies teal as primary/focus color. `Navbar.tsx` owns all public navigation and uses the required booking source tags. The homepage hero is dark navy and supports a high-contrast translucent header.
- Exit status: 0
- Remaining uncertainty: Baseline/current visual behavior has not yet been inspected in the local browser.

## Evidence: Scoped navigation implementation and repair
- Date: 2026-07-27
- Graph node: N2
- Command or verification method: Reviewed `git diff --check` and `app/components/Navbar.tsx`; ran a local browser at wide desktop, 1025 px, and 1280 px layouts.
- Result: Only `Navbar.tsx` application code changed. The existing link destinations and booking source values are preserved. Browser evidence exposed two introduced layout risks: an explicit `role="banner"` activated an old global shrink-to-fit selector, and the `lg` desktop variant overflowed at 1025 px. Removing that redundant role and switching the full desktop navigation to `xl` resolved both risks. Desktop fits at 1280 px; mobile control is active and non-overflowing at 1025 px.
- Exit status: 0
- Remaining uncertainty: No production rendering was inspected.

## Evidence: Static and build validation
- Date: 2026-07-27
- Graph node: N3
- Command or verification method: `npm run lint`; `npx tsc --noEmit`; `/bin/zsh -lc 'NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 npm run build'`.
- Result: All commands exited 0. Lint and build report four pre-existing warnings outside the changed component: a `PublicNavbar.tsx` Hook dependency, two unused eslint-disable comments in `app/lib/platform-store.ts`, and two warnings in `app/subscribe/page.tsx`.
- Exit status: 0
- Remaining uncertainty: The default build initially stopped because this checkout lacked `NEXT_PUBLIC_API_BASE_URL`; the documented local placeholder was used only for validation and no configuration was written.

## Evidence: Browser and accessibility verification
- Date: 2026-07-27
- Graph node: N3
- Command or verification method: Local in-app browser against `http://127.0.0.1:3100/`; DOM snapshots, screenshots, and bounded state checks.
- Result: Wide desktop rendered the full nav and audit CTA without document overflow. The Services disclosure exposed all three expected links. Mobile showed a labeled modal dialog with grouped Services/Solutions links and a visible `mobile-nav` audit CTA. Escape closed the dialog, restored focus to `Open navigation`, removed the dialog, and restored body scrolling. At mobile width, no horizontal overflow occurred. The focus rings and `motion-reduce` classes are present on controls and animated affordances.
- Exit status: 0
- Remaining uncertainty: The configured Playwright CLI wrapper was unavailable because `@playwright/mcp` did not expose `playwright-cli`; the bundled in-app browser provided the actual runtime evidence instead.

## Evidence: Graph consistency
- Date: 2026-07-27
- Graph node: N4
- Command or verification method: `python3 /Users/ofroot/.agents/skills/graph-loop-engineering/scripts/validate_graph_consistency.py --graph .graph/features/marketing-navigation-refresh/GRAPH.json --feature .graph/features/marketing-navigation-refresh/FEATURE.md --evidence .graph/features/marketing-navigation-refresh/EVIDENCE.md`.
- Result: `{ "status": "completed", "derivedStatus": "completed", "issues": [], "repairs": [] }`.
- Exit status: 0
- Remaining uncertainty: Consistency proves record alignment, not a deployment or production verification.

## Evidence: Wordmark casing continuation
- Date: 2026-07-27
- Graph node: N5
- Command or verification method: Reviewed the existing `Navbar.tsx` wordmark, changed only its two visible text fragments, then ran `git diff --check`, `npm run lint`, `npx tsc --noEmit`, and local desktop/mobile browser DOM snapshots at `http://127.0.0.1:3100/`.
- Result: The visible navbar text is `ofroot` on desktop and mobile. The logo image source remains `/ofroot-logo.png`; desktop navigation, mobile menu, CTA destinations, and booking source tags are unchanged. Static commands exited 0. Lint emitted the same unrelated existing repository warnings previously recorded.
- Exit status: 0
- Remaining uncertainty: This is local rendering evidence only. No commit, push, deployment, or production verification occurred.

## Evidence: Direct main release and public readback
- Date: 2026-07-27
- Graph node: N6
- Command or verification method: `git fetch origin main`; `git push origin HEAD:main`; cache-busted `curl -sSIL` and HTML readback against `https://www.ofroot.technology/`.
- Result: Remote main matched the local base before release. The direct push advanced `origin/main` from `f743b0c` to `f7dbc14`. Public requests returned Vercel HTTP 200, but still had an unchanged ETag, `x-vercel-cache: HIT`, approximately 9.7-hour cache age, and older navbar markup. The public deployment has not yet been verified as carrying this commit.
- Exit status: 0
- Remaining uncertainty: Git delivery is complete; production deployment/provider state remains pending and must not be represented as live code.

## Evidence: 2026-08-10 baseline and reference inspection
- Date: 2026-08-10
- Graph node: N7
- Command or verification method: Clean worktree inspection from `origin/main`; source review; `git status`; canonical desktop and 390px mobile screenshots; Linear 1440 x 900 screenshot; official Linear and Apple web sources.
- Result: The work is isolated on `update/navbar-brand-refresh`. Existing routes and booking source tags are mapped. The canonical header presents as a heavy gray strip with a thin uppercase teal lockup and oversized CTA. Linear provides a current reference for quiet hierarchy. The repository brand guide permits a teal logo update, and the user explicitly authorized improving the logo.
- Exit status: 0
- Remaining uncertainty: The proposed OfRoot treatment has not yet been rendered locally.

## Evidence: UI guidance selection
- Date: 2026-08-10
- Graph node: N8
- Command or verification method: Read repository frontend guidance, Graph Loop UI routing, installed `apple-liquid-glass-ui` and `premium-marketing-redesign` skills; ran `npx --yes ui-skills@0.2.4 start` and `categories` twice.
- Result: The live catalog commands exited 0 but returned no entries, so the selection used the evidence-backed repository and installed-skill fallback. Applied constraints are one navigation material, preserved OfRoot tokens, one primary CTA, explicit focus behavior, mobile-first layout, and reduced motion.
- Exit status: 0
- Remaining uncertainty: External UI catalog content was unavailable and is not treated as validation evidence.

## Evidence: Focused logo and navbar implementation
- Date: 2026-08-10
- Graph node: N9
- Command or verification method: Scoped diff review; route-string comparison against `origin/main`; SVG XML and unique-color checks; local desktop and mobile render inspection.
- Result: The implementation updates the shared one-color logo lockup, intrinsic dimensions at its four known consumers, the main responsive navbar, and the brand guide. All pre-existing destination paths, `/book?source=nav`, `/book?source=mobile-nav`, `audit_cta_clicked`, `nav`, and `mobile_nav` values remain unchanged. The new navbar adds active-route state, a compact desktop CTA, a 1024px desktop breakpoint, and an inset mobile sheet without new dependencies.
- Exit status: 0
- Remaining uncertainty: This is local source and runtime evidence, not a commit, preview, deployment, or canonical production result.

## Evidence: Static, build, and browser validation
- Date: 2026-08-10
- Graph node: N10
- Command or verification method: `git diff --check`; `xmllint --noout public/ofroot-tech-logo.svg`; unique-color search; focused ESLint; `npx tsc --noEmit`; `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 npm run build`; production-like local server; Playwright through installed Chrome at 1440 x 900, 1024 x 800, and 390 x 844.
- Result: Diff, XML, one-color, focused lint, TypeScript, and the 168-page Turbopack production build passed. Browser checks passed for desktop/mobile visibility, no overflow, disclosure contents, active-route state, booking hrefs, focus-on-open, focus loop, body-scroll lock/restoration, Escape close, and focus restoration. The logo route returned HTTP 200 `image/svg+xml`. Focused lint emitted one unchanged `PublicNavbar.tsx` Hook dependency warning and zero errors; the build repeated that and other pre-existing warnings outside the changed navbar.
- Exit status: 0
- Remaining uncertainty: Browser evidence is local only. A first metadata route-check command failed because the zsh special parameter `path` cleared the command PATH; the corrected `route_name` retry passed and no application code was implicated.

## Evidence: Public marketing audit
- Date: 2026-08-10
- Graph node: N10
- Command or verification method: Production build output plus local HTTP checks of `/`, `/results`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, `/og.jpg`, and `/ofroot-tech-logo.svg`; homepage and inner-route canonical/title extraction; rendered visual review.
- Result: Audit score is 96/100: performance and delivery 31/35, SEO and indexability 30/30, GEO and machine-readable discoverability 20/20, brand clarity and UX 15/15. All checked routes returned HTTP 200 with expected content types; homepage and Results titles/canonicals are correct. The score is capped by the existing 241 kB homepage first-load JavaScript, which is outside this navbar-only change.
- Exit status: 0
- Remaining uncertainty: The audit is local build/runtime evidence, not canonical production verification.

## Evidence: Completion review and graph consistency
- Date: 2026-08-10
- Graph node: N11
- Command or verification method: Final scoped diff/status review and Graph Loop consistency checker.
- Result: The final application diff is limited to the navbar, shared logo asset, intrinsic logo dimensions at known consumers, and the brand guide. Pre-completion consistency returned `incomplete` with no issues or repairs because N11 was still in progress. Final consistency returned `{ "status": "completed", "derivedStatus": "completed", "issues": [], "repairs": [] }`. No unrelated dirty-checkout work was touched.
- Exit status: 0
- Remaining uncertainty: Publication and canonical runtime evidence were deliberately not performed.

## Evidence: Homepage CTA spacing follow-up and rebase validation
- Date: 2026-08-10
- Graph node: N12
- Command or verification method: Scoped `app/page.tsx` diff; rebase onto `origin/main` at `c89f920`; explicit compact-line conflict resolution; production-like local browser measurements at desktop and 390px mobile; `git diff --check`; focused ESLint; `npx tsc --noEmit`; `npm test -- --runInBand __tests__/heroGrowthSystemOrbit.test.tsx`; `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 npm run build`.
- Result: The three homepage pill CTAs share reusable primary/secondary classes, remain 48px high, use 20px mobile / 22px desktop horizontal padding and a 9px text-icon gap, preserve all destinations and tracking fields, and do not overflow. The rebased homepage also retains the merged `HeroGrowthSystemOrbit`; its 3 tests pass and the desktop runtime exposes the orbit as visible and animating. Static checks, TypeScript, and the 168-page production build passed. The same pre-existing unrelated warnings remain.
- Exit status: 0
- Remaining uncertainty: This is local evidence. Push, PR preview, merge, matching production deployment, and canonical runtime verification remain pending.

## Evidence: Reviewed release and canonical production verification
- Date: 2026-08-10
- Graph node: N13
- Command or verification method: Mandatory `grill-me` release review; `gh` repository/PR/check inspection; Vercel project and deployment API readback; authenticated rendered preview inspection; squash merge; provider production polling; cache-busted canonical HTTP headers; local/remote SVG SHA-256 comparison; desktop 1440px, 1024px, and mobile 390px canonical browser checks; sampled navigation-route HTTP checks.
- Result: PR #24 passed GitGuardian, Vercel Preview Comments, and Vercel; the exact final preview head `05a7688` was `READY`, rendered the new logo/navbar/CTA contract, retained `HeroGrowthSystemOrbit`, had no overflow, and produced zero clean-tab console warnings/errors. PR #24 squash-merged to `main` as `6758900e59c5d164a24b9bba415de2b48d9825d7`. Vercel production deployment `dpl_3Ntvm4fbQGYA97a5oMvCGbDf3x8b` matched that commit, target `production`, reached `READY`, reported no alias error, and attached `www.ofroot.technology`. Canonical HTTP returned 200. The canonical SVG hash exactly matched source (`77b504d7ab4ca046011d237c8015a57a9f3ea0c8006782b2084e959c31462322`). Desktop and mobile CTA dimensions matched the 48px contract; mobile focus trap, Escape close, focus restoration, scroll restoration, and overflow checks passed. All sampled navbar destinations returned HTTP 200.
- Exit status: 0
- Remaining uncertainty: Deployment proves delivery and runtime behavior, not downstream conversion lift. Normal analytics and error monitoring remain operational follow-up.
