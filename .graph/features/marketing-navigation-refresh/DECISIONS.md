# Decisions

## Decision: Preserve all existing routes, tracking, and logo asset
- Date: 2026-07-27
- Status: accepted
- Context: This is a high-visibility public surface; user explicitly prohibited unrelated redesign and shipped-logo recreation/recoloring.
- Decision: Restrict implementation to `app/components/Navbar.tsx`; retain all destination and `source` strings; use the untouched circular asset; only refine the adjacent HTML wordmark.
- Evidence: `docs/BRAND_GUIDE.md` identifies `/public/ofroot-logo.png` as the logo and names teal as the primary brand color. Existing `Navbar.tsx` contains the exact routes and tracking sources.

## Decision: Use a single restrained translucent navigation material
- Date: 2026-07-27
- Status: accepted
- Context: Apple Liquid Glass guidance calls for material to establish control hierarchy, not to decorate every surface.
- Decision: Apply the material only to the sticky desktop header and mobile sheet; retain opaque, high-contrast CTA and menu controls.
- Evidence: Apple Liquid Glass UI skill, local brand guide accessibility requirements, and homepage dark-navy hero context.

## Decision: Normalize only the visible wordmark casing
- Date: 2026-07-27
- Status: accepted
- Context: The requested casing is lowercase `ofroot`; the original refresh already split the HTML text for a restrained two-tone treatment.
- Decision: Change only the two visible text fragments from `Of` / `Root` to `of` / `root`. Preserve the link's accessible name, logo image, routes, CTA sources, and responsive/accessibility logic.
- Evidence: Direct desktop and mobile browser DOM snapshots expose the navbar text as `ofroot`.
