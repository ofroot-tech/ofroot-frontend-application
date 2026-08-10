# Project Context

## Last verified
2026-07-27

## Repository facts
- Next.js 15 application with App Router metadata routes in `app/sitemap.ts` and `app/robots.ts`.
- Shared public site identity is defined in `app/config/site.ts`; growth metadata uses `app/lib/growth-content.ts`.
- Runtime/build validation needs local `node_modules`; this worktree currently has no local Next.js, Jest, or TypeScript executable.

2026-07-27 — Public marketing routes use a shared Next.js App Router navbar at `app/components/Navbar.tsx`; it is rendered by `app/layout.tsx` except under `/landing` and `/dashboard`.

2026-08-10 — The shared public lockup is `public/ofroot-tech-logo.svg`; known consumers are the main navbar, footer, `PublicNavbar`, and `MarketingNavbar`. Navbar route destinations and `nav` / `mobile-nav` booking sources are protected behavior.

2026-08-10 — The rooted-circle lowercase logo, responsive navbar, and 48px homepage CTA-spacing contract were released through PR #24 and verified on Vercel production and `www.ofroot.technology`. Merge `6758900` maps to production deployment `dpl_3Ntvm4fbQGYA97a5oMvCGbDf3x8b`.

2026-08-10 — Unlayered legacy rules in `app/globals.css` set fluid type on every anchor and `6px 2px` padding on every navigation anchor. Navbar controls that need exact dimensions must override that cascade at the component boundary; the scoped CTA-refinement contract is a 65px rendered header, 44px desktop audit target, 14px navigation type, and preserved booking attribution.

2026-08-10 — The navbar CTA refinement was released through PR #28. Merge `11345031099a72b8aecad72114416972a025cf74` maps to READY Vercel production deployment `dpl_DqScFF8gRjT7L7xw3d8zrrVWUgfB`; `www.ofroot.technology` and `ofroot.technology` were attached and canonical desktop/mobile runtime checks passed.

## Relevant conventions
- `docs/BRAND_GUIDE.md` identifies `public/ofroot-logo.png` as the circular logo and permits teal for primary actions/focus accents.
- Public navigation is high visibility. Preserve exact routes and CTA source tags unless a task explicitly changes them.
