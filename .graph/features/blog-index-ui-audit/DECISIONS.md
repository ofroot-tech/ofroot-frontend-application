# Decisions

## Decision: Improve only the observed zero-post state
- Date: 2026-08-10
- Status: accepted
- Context: The live blog exposes one featured guide and an empty archive placeholder. Existing API posts must remain supported.
- Decision: Preserve the post-present branch and replace only the zero-post branch with source-controlled insight routes.
- Evidence: Live DOM audit, `app/blog/page.tsx`, and `app/lib/insights-content.ts`.

## Decision: Select one external redesign skill with repository precedence
- Date: 2026-08-10
- Status: accepted
- Context: UI Skills category discovery identified `visual`; the first candidate endpoint returned 404.
- Decision: Activate `[registry] leonxlnx/redesign-skill` and apply only targeted, stack-preserving guidance. Keep repository typography, palette, and restrained motion rules.
- Evidence: `ui-skills@0.2.4` category/list/get command results and local frontend guidance.
