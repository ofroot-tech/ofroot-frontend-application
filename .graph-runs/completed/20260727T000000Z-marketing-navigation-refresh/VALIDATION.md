# Validation

- `git diff --check` — passed.
- `npm run lint` — passed with six existing warnings outside `Navbar.tsx`.
- `npx tsc --noEmit` — passed.
- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 npm run build` — passed.
- Local browser — desktop and mobile screenshots captured; desktop disclosure, mobile dialog, Escape close, focus restoration, body-scroll restoration, CTA visibility, and breakpoint overflow checks passed.
- The default build without `NEXT_PUBLIC_API_BASE_URL` is an environment blocker, not a code failure; the repository-documented placeholder made the validation build pass.
