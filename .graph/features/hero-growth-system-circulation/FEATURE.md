# Feature: Hero growth-system circulation

## Status
Production publication authorized; branch publication in progress

## Objective
Animate the three homepage hero system labels so they circulate around the existing central message without changing hero copy, CTA hierarchy, or layout.

## System breakdown
- Inputs: the existing `Discover`, `Convert`, and `Operate` labels; the hero viewport state; the document visibility state; the visitor's reduced-motion preference.
- Processing: one CSS orbit rotates the label track while a matched counter-rotation keeps each label upright; a small client observer pauses the loop when it is not visible.
- Outputs: a calm, continuous visual explanation that the three outcomes form one connected system.
- Dependencies: React 19, Next.js 15, browser `IntersectionObserver`, CSS animations, and the current homepage hero geometry.
- Failure points: unreadable rotating text, motion that continues offscreen, reduced-motion violations, label clipping, hydration errors, or regressions to hero copy and links.

## Success criteria
- The three labels complete a continuous circular orbit around the fixed center.
- Label text stays upright throughout the orbit.
- Motion pauses when the visual is offscreen or the document is hidden.
- `prefers-reduced-motion: reduce` preserves the static diagram and removes spatial movement.
- Existing hero copy, links, responsive visibility, and layout remain unchanged.
- Focused tests, typecheck, lint, production build, and desktop runtime checks pass.

## Non-goals
- No homepage copy, CTA, metadata, navigation, or lower-page redesign.
- No new animation dependency.
- No publication, deployment, or production mutation.

## Motion thesis
- Focal moment: the three named outcomes visibly circulate around their shared center.
- Continuity: the orbit makes the existing connected-system relationship legible.
- Feedback: none; this is a non-interactive explanatory visual.
- Budget: transform-only CSS at a slow linear pace, active only while visible, with no blur or layout animation.

## UI guidance
- Repository: `docs/skills/frontend.md` and `docs/BRAND_GUIDE.md` require purposeful, restrained motion and preserved conversion hierarchy.
- Installed: `premium-marketing-redesign` keeps the change brand-first, accessible, and scoped to the hero.
- Registry: `pbakaus/animate` was loaded through `ui-skills@0.2.4`; applied constraints are purposeful relationship motion, CSS keyframes, no new dependency, transform-only movement, offscreen pause, and an intentional reduced-motion path.

## Acceptance criteria
- AC-1: The live source and rendered hero are identified and the exact visual scope is bounded.
- AC-2: Task-relevant UI motion guidance is loaded and reconciled with repository authority.
- AC-3: The animation design keeps pills upright, motion subtle, and behavior observable.
- AC-4: The bounded component, styles, and focused tests are implemented without unrelated edits.
- AC-5: Static, compiler, automated, build, accessibility-motion, and browser runtime checks pass.
- AC-6: The Graph Loop record is consistent and accurately reflects local-only completion.

## Next bounded action
Stage the isolated feature, commit it, push the branch, and open the reviewed pull request.

## Last reviewed
2026-08-10
