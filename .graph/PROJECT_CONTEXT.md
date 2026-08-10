# Project Context

## Last verified
2026-07-27

## Repository facts
- Next.js 15 application with App Router metadata routes in `app/sitemap.ts` and `app/robots.ts`.
- Shared public site identity is defined in `app/config/site.ts`; growth metadata uses `app/lib/growth-content.ts`.
- Runtime/build validation needs local `node_modules`; this worktree currently has no local Next.js, Jest, or TypeScript executable.

2026-07-27 — Public marketing routes use a shared Next.js App Router navbar at `app/components/Navbar.tsx`; it is rendered by `app/layout.tsx` except under `/landing` and `/dashboard`.

2026-08-10 — The shared public lockup is `public/ofroot-tech-logo.svg`; known consumers are the main navbar, footer, `PublicNavbar`, and `MarketingNavbar`. Navbar route destinations and `nav` / `mobile-nav` booking sources are protected behavior.

## Relevant conventions
- `docs/BRAND_GUIDE.md` identifies `public/ofroot-logo.png` as the circular logo and permits teal for primary actions/focus accents.
- Public navigation is high visibility. Preserve exact routes and CTA source tags unless a task explicitly changes them.
