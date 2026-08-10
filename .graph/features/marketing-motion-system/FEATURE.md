# Feature: Marketing motion system

## Status
Completed locally. Publication was not requested.

## Objective
Improve the public homepage with a coherent, restrained motion system inspired by strong production sites without copying effects that do not fit OfRoot's service-led conversion path.

## System breakdown
- Inputs: homepage hierarchy, existing hero orbit, viewport entry, pointer and keyboard interaction, document visibility, and the visitor's reduced-motion preference.
- Processing: reusable duration/easing/offset tokens; one-time hero and section choreography; brief transform/opacity feedback for interactive surfaces; the existing orbit remains the only continuous focal motion.
- Outputs: clearer reading order, stronger relationship cues, and more polished interaction feedback without delaying access to content.
- Dependencies: React 19, Next.js 15, the existing global `RevealObserver`, CSS animations/transitions, and `IntersectionObserver`.
- Failure points: content hidden without JavaScript, motion overload, layout shifts, broad `transition: all`, inaccessible continuous motion, mobile overflow, or regressions to copy and links.

## Success criteria
- The hero establishes a short reading-order sequence while its existing orbit remains the only continuous focal animation.
- Supporting homepage sections reveal once with a restrained stagger when entering the viewport.
- Interactive cards and CTAs use brief, explicit transform/color/shadow feedback.
- Content stays visible without JavaScript and under `prefers-reduced-motion: reduce`.
- Motion uses transform and opacity; no animation dependency or layout-animation loop is added.
- Homepage copy, CTA routes, metadata, accessibility semantics, and responsive structure remain unchanged.
- Focused tests, full tests, typecheck, lint, build, desktop runtime, mobile runtime, reduced-motion runtime, and console checks pass.

## Non-goals
- No product-simulation carousel, autoplay marquee, WebGL/canvas layer, page-transition framework, or copied branded asset.
- No redesign of inner routes in this first bounded slice.
- No publication, merge, or production mutation without a separate request.

## Layout plan
1. Keep the current hero structure and orbit.
2. Add a brief hero reading-order entrance to eyebrow, headline, body, CTAs, trust line, and visual.
3. Reveal section headers and grouped cards once as they enter the viewport.
4. Add concise hover/focus/press feedback only to interactive cards and CTAs.
5. Preserve the final CTA as the closing motion beat.

## Component tree
- `app/layout.tsx`
  - existing `RevealObserver` upgraded as the shared progressive-enhancement boundary
- `app/page.tsx`
  - hero choreography classes
  - section/card reveal classes and stagger variables
  - interactive card/CTA feedback classes
- `app/globals.css`
  - motion tokens and accessible primitives

## UX notes
- Hero motion runs once and never blocks interaction.
- Section reveal runs once and does not reverse on scroll.
- No-JavaScript content remains visible because hiding activates only after the global observer is ready.
- Reduced motion removes translation, rotation, and continuous decorative movement while keeping all content visible.
- Mobile receives smaller offsets and stagger.

## Next bounded action
Pre-push readiness is verified on current `origin/main` (`ade596d`). Resolve the human gate by choosing a review-only pull request or a preview-verified production release; then publish only within that authorization.

## Last reviewed
2026-08-10
