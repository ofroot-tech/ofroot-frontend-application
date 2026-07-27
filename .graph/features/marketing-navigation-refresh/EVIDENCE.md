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
