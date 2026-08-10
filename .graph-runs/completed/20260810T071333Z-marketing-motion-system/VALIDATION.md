# Validation

## Environment

The clean worktree initially lacked local executables. The dependency tree from the prior clean hero worktree was reused only after both lockfiles produced the identical SHA-256 hash `4c699c62befa73d3891ffa7001ccb2076ff821294e533d6d7315a3b0713fb08d`. No manifest or lockfile changed.

## Passed gates

- Focused Jest: 2 suites, 6 tests passed.
- Full Jest: 22 suites, 89 tests passed.
- TypeScript: passed with no errors.
- Lint: exit 0; unrelated baseline warnings only.
- Cache-disabled production build: passed; 168 static pages generated.
- Desktop runtime: hero timing, 18-second orbit, one-time reveals, hover feedback, and zero horizontal overflow verified.
- Mobile runtime at 390x844: H1 and CTA visible, orbit intentionally hidden by the existing responsive contract, 12 px reveal distance, zero horizontal overflow.
- Reduced motion: hero, orbit, reveals, and interaction transitions disabled; all content visible.
- JavaScript disabled: all homepage content visible; the motion-ready marker was absent as designed.
- Console: no page or motion exception. Existing anonymous-session `/api/auth/me` request returned 401 and is outside this diff.

## Evidence boundary

These results prove local source, automated, build, and local browser behavior. They do not prove a provider preview or canonical production release.
