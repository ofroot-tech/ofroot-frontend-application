# Feature: Marketing navigation refresh

## Status
Completed with local validation

## Objective
Improve the public marketing navigation on desktop and mobile without changing its routes, CTA intent, shipped logo asset, analytics source attribution, or any production state.

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

## Validation summary
- `git diff --check`, `npm run lint`, and `npx tsc --noEmit` passed.
- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 npm run build` passed. The placeholder was the repository-documented local validation value; no environment file changed.
- Local browser verification passed for wide desktop, mobile menu behavior, mobile CTA visibility, Escape close/focus restoration, body-scroll restoration, and the responsive threshold.
- Continuation validation: `git diff --check`, lint, and typecheck passed; desktop and mobile browser DOM snapshots both expose the navbar wordmark as `ofroot`.

## Remaining uncertainty
Release commit `f7dbc14` was pushed directly to `origin/main` on 2026-07-27 after the user expressly waived the pre-push gate. The public Vercel response still served an older cached deployment (old navbar markup, unchanged ETag, cache age about 9.7 hours) after 30 seconds, so deployment/live behavior remains unverified.

## Next bounded action
No further in-scope action. Review the local diff before any publication decision.

## Last reviewed
2026-07-27
