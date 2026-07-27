# Validation

## Canonical host feature
- Static contract: `node -e "..."` verified the seven changed URL-source files use `CANONICAL_SITE_URL` and contain no naked-host or environment override. Passed 2026-07-27.
- Automated test/typecheck/build: blocked because `node_modules/.bin/{jest,tsc,next}` are absent. Do not interpret the static contract as compiler or build proof.
