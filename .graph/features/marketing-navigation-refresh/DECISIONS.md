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

## Decision: Direct main release after explicit gate waiver
- Date: 2026-07-27
- Status: accepted
- Context: User requested “push live bypass gates,” which expressly waived the mandatory pre-push grill gate. Remote `origin/main` was refreshed and matched the local base before release.
- Decision: Commit the scoped application change and Graph records as `f7dbc14`, then push detached `HEAD` directly to `origin/main`. Keep generated local screenshots untracked.
- Evidence: `git push origin HEAD:main` advanced `origin/main` from `f743b0c` to `f7dbc14`. Public Vercel readback was still stale at the time of verification.

## Decision: Use Linear's hierarchy as a reference, not a template
- Date: 2026-08-10
- Status: accepted
- Context: The user requested a strong current online example. Linear's public header demonstrates a compact brand lockup, quiet navigation, a restrained divider, and one decisive action.
- Decision: Adapt its hierarchy and restraint while retaining OfRoot's route structure, navy surface, teal identity, orange conversion CTA, and accessible interaction model.
- Evidence: Direct 1440 x 900 browser screenshot of `https://linear.app/homepage`; canonical OfRoot desktop/mobile screenshots; repository brand guide.

## Decision: Replace the shared lockup with a simpler lowercase mark
- Date: 2026-08-10
- Status: accepted
- Context: The user expressly asked to improve the dated logo, which authorizes a focused update to the protected shared logo asset. Earlier user feedback also rejected a complex root-and-circuit concept.
- Decision: Keep a one-color teal asset, reduce the icon to a rooted circle, and use a lowercase `ofroot` wordmark. Do not copy Linear's striped circle or typography.
- Evidence: User request, `docs/BRAND_GUIDE.md`, current `public/ofroot-tech-logo.svg`, and prior feedback recorded in memory.

## Decision: Use one restrained navigation material
- Date: 2026-08-10
- Status: accepted
- Context: The current header reads as a heavy gray slab, while Apple material guidance recommends glass only where it clarifies control hierarchy.
- Decision: Use a navy translucent header and one mobile sheet, both with fallback backgrounds, soft borders, restrained shadows, and reduced-motion-safe transitions.
- Evidence: Installed Apple Liquid Glass UI guidance, canonical screenshots, and local brand tokens.

## Decision: Normalize homepage CTA geometry without changing intent
- Date: 2026-08-10
- Status: accepted
- Context: The user asked for more modern spacing inside page buttons after approving the navbar direction.
- Decision: Limit the follow-up to the three homepage pill CTAs. Use a shared 48px control height, responsive horizontal padding, a 9px icon gap, compact line-height, explicit focus rings, and reduced-motion-safe transitions. Preserve routes, labels, and analytics fields.
- Evidence: Desktop/mobile computed-style measurements and the scoped `app/page.tsx` diff.

## Decision: Treat PR #23 as a release-order dependency
- Date: 2026-08-10
- Status: accepted
- Context: PR #23 is already open and building. It changes the hero orbit on a different element, but both branches edit the same compact source line in `app/page.tsx`.
- Decision: Do not merge this branch against stale `main`. PR #23 was allowed to finish first; this branch was then rebased onto its squash merge `c89f920`. The conflict resolution retained both the imported `HeroGrowthSystemOrbit` and the CTA-spacing classes. Static, test, build, and browser checks were rerun after the rebase.
- Evidence: `gh pr view 23`, direct `app/page.tsx` diff comparison, rebase conflict/readback, 3 passing hero tests, 168-page build, and computed desktop/mobile runtime measurements.

## Decision: Release through reviewed Git-to-Vercel production flow
- Date: 2026-08-10
- Status: accepted and completed
- Context: The user explicitly requested publication once ready. The repository requires a pre-push grill, exact preview verification, and truthful separation between Git, provider, and canonical proof.
- Decision: Rebase onto the current production-ready `main`, push an isolated review branch, verify the exact protected Vercel preview, squash-merge PR #24, then wait for the matching production deployment and canonical desktop/mobile checks. Keep local screenshots outside the commit.
- Evidence: PR #24, merge `6758900`, deployment `dpl_3Ntvm4fbQGYA97a5oMvCGbDf3x8b`, canonical asset hash match, browser measurements, mobile interaction checks, and route HTTP checks.

## Decision: Contain the legacy global cascade at the navbar boundary
- Date: 2026-08-10
- Status: accepted
- Context: The user screenshot showed a visually oversized CTA. Production measurement found the component's intended `text-sm` and `px-4` values were not reaching the browser because unlayered `p, li, span, a` and `nav a` rules override Tailwind's layered utilities. Browser zoom and Retina scaling did not explain the CSS measurements.
- Decision: Do not change the broad legacy stylesheet in this narrow follow-up. Restore exact pixel dimensions inside `Navbar.tsx`, remove the decorative divider, keep a 44px pointer target, and use a quiet 24px arrow surface to improve internal hierarchy. Preserve all routes, labels, analytics fields, focus behavior, and mobile-menu mechanics.
- Evidence: Canonical before measurement, scoped source inspection, clean-worktree production build, and desktop/mobile production-like browser measurements recorded in E16.
