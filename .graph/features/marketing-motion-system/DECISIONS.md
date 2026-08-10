# Decisions

## D-1 — Build a system, not a collection of effects
- Date: 2026-08-10
- Decision: Reuse the current orbit as the sole continuous hero moment, then add shared entrance and interaction primitives.
- Reason: The strongest reviewed sites use restraint and clear choreography. OfRoot needs hierarchy and feedback more than another spectacle layer.

## D-2 — Adopt and reject reviewed patterns explicitly
- Date: 2026-08-10
- Adopt: Linear-style reading-order choreography; Vercel-style 150–200 ms interaction feedback and CSS-first implementation; Apple-style optional, brief, purposeful motion; Stripe-style emphasis on a single hero focal moment.
- Reject: Stripe's canvas-heavy ambient layer, Linear's simulated product workspace and long marquee, autoplay carousels, large parallax, and a new GSAP/Framer dependency.
- Reason: Those rejected patterns either compete with the hero orbit, do not fit a consulting/service narrative, or add runtime cost without clearer conversion meaning.

## D-3 — Progressive enhancement is required
- Date: 2026-08-10
- Decision: New reveal styles may hide content only after `RevealObserver` marks the document motion-ready. Reduced-motion and missing-observer paths must reveal immediately.
- Reason: Content availability cannot depend on client JavaScript or animation support.

## D-4 — Preserve existing anonymous-session behavior
- Date: 2026-08-10
- Decision: Record the anonymous `/api/auth/me` 401 as pre-existing runtime behavior outside this feature instead of expanding the motion diff.
- Reason: The request originates from the existing authentication context, the motion diff does not touch authentication, and the rendered public page remains available. Changing the session contract would broaden scope and risk.

## D-5 — Preserve the latest CTA contract during base reconciliation
- Date: 2026-08-10
- Decision: Fast-forward the feature branch to current `origin/main`, retain the newer 48px CTA sizing and focus-ring classes, and layer the motion class onto those shared CTA definitions.
- Reason: The only overlapping upstream source was homepage CTA presentation. Preserving upstream accessibility and sizing while adding the bounded motion class avoids reverting released navbar work or duplicating CTA markup.

## D-6 — Treat reduced-motion hover feedback as release-blocking
- Date: 2026-08-10
- Decision: Neutralize hover and active transforms inside the existing reduced-motion media query before production publication.
- Reason: Reduced motion must cover interaction states, not only entrance and continuous animations. The PR review exposed a real accessibility contradiction that local non-hover emulation had not exercised.
