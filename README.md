# ofroot-frontend-application

A modern frontend application built with [Next.js](https://nextjs.org), designed for deployment on [Vercel](https://vercel.com).

## Tech Stack
- **Next.js** (React framework)
- **Tailwind CSS** (utility-first CSS)
- **Vanta.js** (animated backgrounds, topology effect)
- **p5.js** (rendering library for Vanta.js topology)
- **TypeScript** (type safety)

## Backend Communication
- Communicates with a **Laravel** backend
  - Handles authorization, authentication, and all backend logic
  - API endpoints for data, user management, and more

## Vanta.js Integration
This project uses Vanta.js for animated backgrounds. The topology effect is implemented on the home page.

### Dependencies
- `vanta` - Core Vanta.js library
- `p5` - Required for topology effect rendering
- `@types/p5` (dev) - TypeScript types for p5.js

### Customizing Colors
To change the background colors of the Vanta effect:
1. Open `app/page.tsx`
2. Locate the `TOPOLOGY` initialization in the `useEffect`
3. Modify the `color` and `backgroundColor` options:
   - `color`: Hex color for particles/lines (e.g., `0x007cf0` for blue)
   - `backgroundColor`: Hex color for the background (e.g., `0xffffff` for white)
4. Save and the changes will hot-reload

Example:
```tsx
vantaEffect.current = TOPOLOGY({
  // ... other options
  color: 0xff6b6b,        // Red particles
  backgroundColor: 0x2c3e50, // Dark blue background
});
```

### Best Practices for Next.js & Vercel
1. **Use Client Components**: Add `'use client'` at the top of components using Vanta to ensure client-side rendering.
2. **Dynamic Imports**: Import Vanta effects dynamically inside `useEffect` to avoid SSR issues.
   ```tsx
   const TOPOLOGY = (await import('vanta/dist/vanta.topology.min')).default;
   ```
3. **Proper Cleanup**: Always destroy the Vanta effect in the cleanup function to prevent memory leaks.
4. **Vercel Optimization**: Vanta works seamlessly with Vercel deployments. Ensure effects are initialized only on the client-side for optimal performance.

## Landing pages
Static, manifest-driven landing pages live under `app/landing/[slug]`.

- Manifest file: `app/landing/manifest.json`
- Add a new page by adding a key under `pages`, e.g.:
```json
{
  "pages": {
    "summer-campaign": {
      "seo": { "title": "Summer Campaign" },
      "hero": { "headline": "Save big this summer", "subheadline": "Limited-time offers" },
      "cta": { "label": "Get started", "href": "/#contact" },
      "features": [
        { "emoji": "🔥", "title": "Hot deals", "text": "Great prices" }
      ],
      "embed": { "html": "<div>Optional embed HTML</div>" }
    }
  }
}
```
- Visit `/landing/summer-campaign` to view it.
- `generateStaticParams` prebuilds these routes on Vercel for speed.

### Theme & A/B variants
- Optional `theme` block per page: `{ "primary": "#20b2aa", "secondary": "#007bff" }` used for CTA background, etc.
- Optional `variants` block to A/B test copy. Example:
```json
"variants": {
  "default": "A",
  "A": { "ctaLabel": "Schedule a call" },
  "B": { "ctaLabel": "Get your consultation" }
}
```
- Select variant via query: `/landing/ofroot-demo?v=B`. The active variant key is shown on the CTA.

### Variant stickiness
- Middleware at `middleware.ts` captures `?v=A|B|...` on `/landing/:slug` and sets a cookie `ofroot_variant_<slug>`, then redirects to a clean URL.
- Page reads this cookie to choose the variant; if absent, falls back to `variants.default` from the manifest.
- This keeps canonical URLs clean while preserving experiment assignment.

## Analytics & A/B helpers
- File: `app/lib/ab.ts`
- Functions:
  - `getActiveVariant(slug)` — reads `ofroot_variant_<slug>` cookie in the browser
  - `track(event)` — vendor-agnostic; uses Vercel Analytics `va()` if available, else logs
  - `trackVariantExposure({ slug, variant })` — call on page view
  - `trackCtaClick({ slug, variant, label })` — call on CTA clicks
- Landing pages dynamically import these helpers to avoid extra server bundle weight and call them on mount and on CTA clicks.

Event taxonomy
- category: `ab` | `cta` | `view`
- action: `exposure` | `click`
- label: usually the CTA label or slug
- meta: includes `slug`, `variant`, and `path`

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the home page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Vercel Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vanta.js Documentation](https://www.vantajs.com/)


## Backend API configuration

This frontend talks to the Laravel API. Configure the base URL via an environment variable.

- Variable name: `NEXT_PUBLIC_API_BASE_URL`
- Production (Vercel): set to `https://ofroot-leads.onrender.com/api` in Vercel → Project → Settings → Environment Variables. Scope to Production (and Preview if needed). Redeploy after saving.
- Local development: copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api` (or your local URL).

Tips
- This variable is intentionally public so client components can call the API from the browser.
- Avoid double slashes when joining (the app normalizes a trailing slash).

### API client
- File: `app/lib/api.ts`
- Helpers: `api.createLead`, `api.assignLead`, `api.unassignLead`, `api.listTenants`, `api.createTenant`, `api.updateTenant`.
- Form helper: `submitLead(formData)` to post to `/leads`.

### Quick usage (client components)
```tsx
'use client';
import { api } from '@/app/lib/api';

export default function LeadForm() {
  async function onSubmit() {
    await api.createLead({ phone: '555-1111', service: 'plumbing', zip: '90210', tenant_id: null });
  }
  return <button onClick={onSubmit}>Send lead</button>;
}
```

### Quick usage (server components / actions)
```ts
import { api } from '@/app/lib/api';

export async function createLeadAction(formData: FormData) {
  const phone = String(formData.get('phone'));
  await api.createLead({ phone, service: 'plumbing', zip: '90210', tenant_id: null });
}
```

## Vercel Deployment (recommended)

Recommended settings to ensure a smooth deployment:

- Framework Preset: `Next.js` (auto-detects the App Router and static/SSR routes).
- Root Directory: `./` (use this if the project lives at the repository root).
- Install Command: `npm ci` (or `npm install` if you prefer).
- Build Command: `npm run build` (Vercel will run `next build`).
- Output Directory: leave blank (Vercel auto-detects Next.js output). If you need to set one, use `.next`.
- Environment Variables: add `NEXT_PUBLIC_API_BASE_URL` as described above. Example value for production: `https://ofroot-leads.onrender.com/api`.
- Node Version: pin via `engines` in `package.json` or add a `.nvmrc` if you want a specific Node.js version on Vercel.

Notes and best practices:
- Keep `Framework Preset` as `Next.js` and `Root Directory` as `./` for the defaults shown in your screenshot — this is correct for this repo.
- Vanta effects are client-only; ensure components using Vanta include `'use client'` and use dynamic imports (this repo already does this in `app/page.tsx`).
- If you see the warning about `@next/font`, migrate to the built-in `next/font` (Next.js 14 will remove `@next/font`). You can run the codemod: `npx @next/codemod@latest built-in-next-font .` before deploying.
- Add any required environment variables before deployment so server-side builds that depend on them succeed.

Deploying:
1. Import the repository into Vercel and choose the `ofroot-frontend-application` project name.
2. Confirm the framework preset is `Next.js` and the root directory is `./`.
3. Add environment variables (if any) and click Deploy.

This project is configured to work with Vercel's default Next.js settings.

---

This frontend is designed to work seamlessly with a Laravel backend and is optimized for Vercel hosting.

## Admin and Blog add-on

Role and feature visibility in the dashboard are controlled via server-side environment variables and the authenticated user:

- Super admin allowlist: set `ADMIN_EMAILS` to a comma-separated list of emails on the API and on the frontend server runtime (for the server route below). For both local and production, use:
  - `ADMIN_EMAILS=1.dimitri.mcdaniel@gmail.com`
- Blog add-on flag: users can have a boolean `has_blog_addon` feature flag on the backend. Admins can toggle this from the dashboard Users table.

Main-company publishing (super admins):
- If the logged-in user is a super admin (email is included in `ADMIN_EMAILS`), any new blog post they create, or any draft they publish from the editor, will be attributed to the "main OfRoot tenant" by setting a `tenant_id` in the API payload.
- Configure which tenant is considered the main OfRoot tenant by setting `OFROOT_TENANT_ID` in the frontend server runtime (e.g., `.env.local` for dev, Vercel Project → Settings for prod). Example: `OFROOT_TENANT_ID=1`.
- With this set, super-admin posts will surface at the public site (e.g., https://ofroot.technology/blog) under the main tenant.

How it works:
- The dashboard shell calls a server route `GET /api/admin/me` to determine `isSuperAdmin` and `hasBlogAddon` in order to show/hide links (Docs, Blog).
- Super admin checks read `process.env.ADMIN_EMAILS` server-side (App Router route).
- Admin-only backend routes are protected by a middleware that also checks `ADMIN_EMAILS`.

API endpoints involved:
- Toggle blog add-on (admin-only): `PUT /api/admin/users/{id}/features { has_blog_addon: boolean }`
- Current user: `GET /api/auth/me`

UI surface:
- Dashboard → Users: per-row “Blog add-on” chip + Enable/Disable button.
- Dashboard → Blog: only visible if `hasBlogAddon` or `isSuperAdmin`.

## Public blog pages

The public marketing site exposes a simple blog powered by the API’s public endpoints.

- Listing: `/blog` — SSR; fetches `GET /api/public/blog-posts?limit=24`.
- Detail: `/blog/[slug]` — SSR; fetches `GET /api/public/blog-posts/{slug}?tenant_id=...`. If `tenant_id` isn’t in the URL, the page resolves it by listing posts and matching the slug.
- SEO: JSON-LD for CollectionPage/BlogPosting is injected server-side.

Environment:
- Ensure the frontend is pointed at the API: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api` for local dev.
- For super admin link visibility in the dashboard shell, set `ADMIN_EMAILS` in the frontend runtime (server-only; not exposed to the client), e.g. via `.env.local` for dev. Use:
  - `ADMIN_EMAILS=1.dimitri.mcdaniel@gmail.com`
- To route super-admin blog publishes to the main tenant on the public site, set `OFROOT_TENANT_ID` in the frontend runtime to the tenant ID used by the API for the main OfRoot company.

## Contact & Email configuration

We centralize contact emails and optional email sending via environment variables so nothing sensitive is committed to git.

Variables (Next.js app on Vercel):
- `NEXT_PUBLIC_CONTACT_EMAIL` — Public-facing email to display on the site (safe to expose). Example: `ofroot.technology@gmail.com`.
- `CONTACT_EMAIL` — Recipient inbox for form submissions (server-only). If omitted, falls back to `NEXT_PUBLIC_CONTACT_EMAIL`.
- `RESEND_API_KEY` — Optional. If set, audit and sales inquiry routes will send emails via Resend; otherwise they will log.
- `RESEND_FROM` — Optional. Sender email for Resend (e.g., `no-reply@ofroot.technology`). Must be verified in Resend.
- `RESEND_FROM_NAME` — Optional. Sender display name (e.g., `OfRoot`).

Where used:
- Display email: `app/config/public.ts` → used in `app/page.tsx` contact section.
- Mail sending: `app/api/audit-inquiry/route.ts` and `app/api/sales-inquiry/route.ts`.

Local setup:
1. Copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_CONTACT_EMAIL`. Leave `RESEND_API_KEY` empty unless testing sending.
2. Never commit `.env.local` (already gitignored).

Vercel (production):
1. Add the vars above in Project → Settings → Environment Variables.
2. Redeploy.

Render (Laravel API):
- Not required for these frontend email routes. If moving email to Laravel later, configure `MAIL_*` there per Laravel docs.

Security hygiene:
- Keep this repo public if you want GitHub activity — just ensure secrets live in Vercel/Render envs, not in git.
- Rotate keys immediately if a secret ever lands in commit history.
