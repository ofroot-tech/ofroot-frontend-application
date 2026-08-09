# Feature: Monochrome OfRoot logo release

## Status
In progress

## Objective
Publish the approved one-color OfRoot Tech logo to the existing `main-website` Vercel production project through the repository's `main` branch, then verify the canonical production site.

## Acceptance criteria
- The logo asset contains one foreground color, `#20B2AA`, on a transparent background.
- The global header, mobile navigation, footer, and alternate public navigation use the new logo without changing routes or CTA behavior.
- Static checks, TypeScript, focused lint, production build, and desktop/mobile runtime checks pass or are reported with an explicit evidence state.
- The scoped change is committed, merged to `main`, and linked to a Ready Vercel production deployment.
- `https://www.ofroot.technology` serves the new logo and renders it in the public header without horizontal overflow.
- Rollback remains available through the prior production deployment `dpl_2GKbiReM6D2MA1eC9ViK4ufzStGY` or a Git revert.

## Non-goals
- Changing navigation destinations, CTA tracking, application data, environment values, authentication, or database state.
- Replacing the favicon or application manifest icon.

## Next bounded action
Commit and push the validated scoped change, then open and merge the production PR.

## Last reviewed
2026-08-09
