# Validation

 - `npm run lint` — available; may emit unrelated repository warnings.
 - `npx tsc --noEmit` — available typecheck.
 - `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 npm run build` — repository-documented local build validation when the required public API-base environment variable is absent.
 - Local browser checks should include wide desktop, mobile dialog, keyboard close/focus restoration, and breakpoint overflow checks for Navbar changes.

## Canonical host feature
- Static contract: `node -e "..."` verified the seven changed URL-source files use `CANONICAL_SITE_URL` and contain no naked-host or environment override. Passed 2026-07-27.
- Automated test/typecheck/build: blocked because `node_modules/.bin/{jest,tsc,next}` are absent. Do not interpret the static contract as compiler or build proof.
