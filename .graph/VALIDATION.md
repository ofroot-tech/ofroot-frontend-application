# Validation

- `npm run lint` — available; may emit unrelated repository warnings.
- `npx tsc --noEmit` — available typecheck.
- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 npm run build` — repository-documented local build validation when the required public API-base environment variable is absent.
- Local browser checks should include wide desktop, mobile dialog, keyboard close/focus restoration, and breakpoint overflow checks for Navbar changes.
