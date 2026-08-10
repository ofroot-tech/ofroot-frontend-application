# Feature: Marketing navigation refresh

## Status
Completed and verified in canonical production — 2026-08-10

## Objective
Modernize the public marketing logo, navigation, and homepage CTA spacing on desktop and mobile while preserving routes, CTA intent, and analytics source attribution.

## Current iteration: 2026-08-10

### Inputs
- The current public pathname, navigation destinations, dropdown groups, and mobile-menu state.
- The approved one-color OfRoot logo asset and local navy, teal, and orange brand system.
- Direct screenshots of the canonical site and Linear's current public homepage.

### Processing
- `app/components/Navbar.tsx` turns the route model into desktop navigation, dropdowns, the booking CTA, and a mobile dialog.
- `public/ofroot-tech-logo.svg` supplies the shared public brand lockup.
- Existing focus trapping, Escape handling, scroll locking, and tracking protect behavior while visual hierarchy changes.

### Outputs
- A slimmer, calmer public header with active-route feedback and a single clear CTA.
- A simpler lowercase OfRoot lockup that remains recognizable at mobile size.
- A mobile inset sheet with clear grouping and preserved keyboard behavior.

### Dependencies
- Next.js App Router, `next/image`, `lucide-react`, Tailwind CSS, and `app/lib/ab.ts` tracking.
- The existing route structure and shared asset consumers in the footer and alternate public navigations.

### Failure points
- A shared logo change could become illegible on light or dark surfaces.
- Compact desktop navigation could overflow near its breakpoint.
- A visual rewrite could alter booking attribution or route destinations.
- Translucent material could reduce contrast or read as decorative glassmorphism.

### Success criteria
- The same navigation destinations and `nav` / `mobile-nav` booking source values remain present.
- The logo is legible at desktop and 390px mobile sizes and uses the documented OfRoot teal.
- Desktop navigation fits at its breakpoint with a visible current-route state and one compact CTA.
- Mobile navigation traps focus, closes with Escape/backdrop, restores focus, and does not overflow.
- Focus, contrast, and motion-reduction behavior remain explicit.
- Focused lint, TypeScript, production build, desktop runtime, and mobile runtime checks pass.

### Non-goals
- Changing page content, route taxonomy, booking behavior, analytics event names, authentication, data, or infrastructure.
- Copying Linear's logo or visual identity.
- Direct provider mutation outside the repository's reviewed Git-to-Vercel release path.

### Competing hypotheses

| Hypothesis | Why it could be true | Disconfirming evidence |
| --- | --- | --- |
| H4: The logo feels dated because the thin branching mark and widely spaced uppercase wordmark read like an older technology brand. | The canonical screenshot shows a small skeletal symbol followed by a narrow all-caps label. | A revised lowercase lockup still feels dated when rendered at the same size and context. |
| H5: The navbar feels dated because the tall gray bar, equally weighted links, and oversized CTA compete with the hero. | The canonical desktop screenshot shows the header as a separate heavy slab with little active-state guidance. | A slimmer, quieter header fails to improve scan order or visual continuity in browser comparison. |
| H6: The problem comes mainly from the hero/header transition, not the controls themselves. | The header sits directly over a dark hero and a mismatched surface can exaggerate separation. | The same dated impression remains when the navbar is inspected independently or on an inner light page. |

## System breakdown

### Inputs
- Public pathname, navigation links, dropdown groups, and open/closed mobile-menu state.
- The shipped circular logo at `public/ofroot-logo.png`.
- Local brand guide tokens: teal, orange CTA, dark navy, accessible focus rings.

### Processing
- `app/components/Navbar.tsx` renders desktop links, grouped menus, audit CTA, and an accessible mobile dialog.
- Local tracking records CTA source and current path.

### Outputs
- A structured sticky desktop header and an accessible mobile navigation panel.
- Links retain their existing destinations; the CTA retains `/book?source=nav` and `/book?source=mobile-nav`.

### Dependencies
- Next.js App Router, `next/image`, `lucide-react`, Tailwind CSS, and the existing analytics helper.

### Failure points
- A dense desktop layout may overflow around the `lg` breakpoint.
- A modal-style mobile panel may lose keyboard focus or leave scrolling locked.
- Translucency can lower contrast against a changing hero background.
- A visual refresh could accidentally alter CTA tracking, routes, or the shipped logo asset.

## Success criteria
- Desktop navigation has clear logo, link, group-menu, and far-right CTA hierarchy without route or source changes.
- Mobile navigation has clear grouping, escape/backdrop close, focus restoration/trapping, and no overflow at a narrow viewport.
- CTA and interactive controls have visible keyboard focus and readable contrast.
- Motion is restrained and removed under `prefers-reduced-motion`.
- Desktop and mobile browser screenshots, plus available lint/typecheck/build validation, are recorded.

## Non-goals
- Recreating, editing, or recoloring `public/ofroot-logo.png`.
- Changing destinations, marketing copy, tracking event names, attribution sources, or booking flows.
- Deploying, pushing, committing, or redesigning other page surfaces.

## Hypotheses

| Hypothesis | Why it could be true | Disconfirming evidence |
| --- | --- | --- |
| H1: The desktop header feels unstructured because all nav controls share a single visual weight. | The brand, links, dropdowns, and CTA currently sit in one dense row. | A screenshot shows clearly separated hierarchy and adequate whitespace already. |
| H2: The CTA is visually weak because it has no distinct affordance beyond background color. | It is the same height and typographic treatment as surrounding controls. | A screenshot shows it remains prominent and immediately scannable in the existing header. |
| H3: The mobile panel feels less modern because its information groups lack control-level hierarchy. | Category labels, rows, and CTA have little surface separation. | Mobile browser evidence shows the existing panel is balanced and easy to scan. |

## Delivered
- Added a calmer, full-width sticky navigation material with one subtle blur/border/shadow layer.
- Preserved the shipped circular logo asset and refined only the adjacent HTML wordmark using the local teal accent.
- Strengthened the audit CTA, including its separator, readable opaque fill, focus ring, and reduced-motion-safe hover treatment.
- Improved desktop group-menu surfaces and mobile information grouping, hit targets, focus states, Escape close, focus restoration, and scroll locking.
- Moved the full desktop breakpoint from `lg` to `xl` after direct browser evidence showed overflow at 1025 px; desktop fits at 1280 px and mobile has no overflow at 1025 px.
- Normalized the visible navbar wordmark to lowercase `ofroot` while keeping the existing two-tone treatment and the shipped logo image untouched.
- Replaced the dated thin all-caps lockup with a one-color rooted-circle mark and lowercase `ofroot` wordmark, preserving the approved teal.
- Reduced the header to a quiet navy bar with a fine divider, compact route controls, active-route state, and one shorter desktop audit CTA.
- Moved the desktop layout to the 1024px breakpoint after direct fit evidence and retained the mobile treatment below it.
- Reworked the mobile menu as one inset navigation sheet with clear group dividers and the full audit CTA.
- Normalized the three homepage pill CTAs to a measured 48px height, 20px mobile / 22px desktop horizontal padding, 9px text-icon gap, restrained hover motion, and explicit focus/reduced-motion behavior.

## Validation summary
- `git diff --check`, `npm run lint`, and `npx tsc --noEmit` passed.
- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 npm run build` passed. The placeholder was the repository-documented local validation value; no environment file changed.
- Local browser verification passed for wide desktop, mobile menu behavior, mobile CTA visibility, Escape close/focus restoration, body-scroll restoration, and the responsive threshold.
- Continuation validation: `git diff --check`, lint, and typecheck passed; desktop and mobile browser DOM snapshots both expose the navbar wordmark as `ofroot`.
- 2026-08-10 iteration: SVG structure/color, focused lint, TypeScript, 168-page Turbopack build, and production-like desktop/mobile browser validation passed.
- Desktop at 1440px and 1024px and mobile at 390px have no horizontal overflow; mobile focus trapping, Escape close, focus restoration, and body-scroll restoration passed.
- Public marketing audit: 96/100. The existing 241 kB homepage first-load JavaScript caps the performance category and was not expanded by this scoped change.
- Homepage CTA follow-up: desktop and mobile browser measurements confirmed all three target buttons at 48px high, with the expected responsive padding, icon gap, typography, and no horizontal overflow.
- Release verification: PR #24 merged as `6758900`; matching Vercel production deployment `dpl_3Ntvm4fbQGYA97a5oMvCGbDf3x8b` reached `READY` with the canonical aliases attached.
- Canonical verification: the homepage, shared SVG, desktop/mobile navigation, all target CTA measurements, mobile focus/scroll behavior, hero coexistence, console health, and sampled navigation destinations passed on `www.ofroot.technology`.

## Remaining uncertainty
No release-specific correctness issue remains unverified for the scoped UI behavior. Business conversion impact and longer-term production performance require normal post-release monitoring; they are not inferred from deployment success.

## Next bounded action
Monitor production errors and CTA analytics through the normal observability path. Any further visual iteration should begin from current `main` and preserve the verified route, attribution, accessibility, and spacing contracts.

## Last reviewed
2026-08-10
