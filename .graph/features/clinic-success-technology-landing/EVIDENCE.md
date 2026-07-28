# Evidence

## Evidence: Focused public-surface audit
- Date: 2026-07-28
- Graph node: N1
- Command or verification method: Read the repository Graph context, brand guide, public layout and navigation, `GrowthPage`, growth metadata helper, homepage, sitemap, robots, LLM routes, package scripts, and targeted clinic/privacy source search. Checked Git state and current remote base.
- Result: The checkout started clean at `5fd0427` matching `origin/main`; a local `update/clinic-success-technology-landing` branch now isolates the work. The public site uses App Router metadata, the canonical `https://www.ofroot.technology`, `TrackedLink`, shared public layout, sitemap, `robots.ts`, `llms.txt`, and `llms-full.txt`. No existing Clinic Success route was found. Existing public privacy language is general and does not define this pilot's Technology/Health boundary.
- Exit status: 0
- Remaining uncertainty: Local runtime, production behavior, and final booking-form handling are unverified. The existing booking route accepts the selected focus as a query parameter but no pilot-specific intake field has been observed.

## Evidence: Content-boundary decision
- Date: 2026-07-28
- Graph node: N2
- Command or verification method: Reconciled the user-provided shared contract against existing public marketing conventions and `docs/BRAND_GUIDE.md`.
- Result: The public content contract uses only scoped operational statements. It identifies Technology as the owner of clinic growth, referral links, aggregate operations, and agreed service cadence. It identifies Health as the owner of patient data, records, clinical workflows, and care decisions. It says Health-data access is never automatic and must begin with separate documented approval and architecture review. No clinical, security, compliance, or performance outcome is promised.
- Exit status: 0
- Remaining uncertainty: The exact terms of a future clinic agreement and any Health architecture are intentionally out of scope.

## Evidence: Scoped implementation review
- Date: 2026-07-28
- Graph node: N3
- Command or verification method: Reviewed the final scoped diff and searched all changed public copy for the Technology/Health boundary.
- Result: Added only `app/clinic-success/page.tsx`, `app/sitemap.ts`, `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`, and Graph Loop records. The page has one h1, `main` landmark, breadcrumbs, keyboard-reachable links, tracked pilot CTAs, canonical metadata, Service JSON-LD, Breadcrumb JSON-LD, explicit aggregate-only reporting language, and explicit no-automatic-Health-data-access language. `git diff --check` passed.
- Exit status: 0
- Remaining uncertainty: The isolated landing-page CTA uses the existing booking flow; the booking form's downstream pilot-specific intake has not been altered or verified.

## Evidence: Static and runtime validation
- Date: 2026-07-28
- Graph node: N4
- Command or verification method: Ran `npm run lint`, `npx tsc --noEmit`, the documented build command, local `next dev` on `127.0.0.1:4017`, HTTP readbacks, and Playwright Chromium screenshots.
- Result: Lint passed with four pre-existing warnings in `app/components/PublicNavbar.tsx`, `app/lib/platform-store.ts`, and `app/subscribe/page.tsx`. Typecheck passed. Local development runtime compiled `/clinic-success` and returned 200; its title, description, canonical, Open Graph, Twitter metadata, JSON-LD, boundary copy, sitemap entry, `llms.txt`, and `llms-full.txt` descriptions were observed. Desktop and 390 px viewport screenshots showed readable hierarchy, visible CTAs, and no observed horizontal overflow. The documented Turbopack build made no progress after four minutes and was stopped, exit 130. A direct Next Webpack comparison was unavailable because Next.js 15.5.7 returned `unknown option '--webpack'`, exit 1.
- Exit status: partial
- Remaining uncertainty: Production build and production-host behavior are unverified. The build gap is environmental/build-tool evidence, not a passed build.

## Evidence: Graph consistency review
- Date: 2026-07-28
- Graph node: N5
- Command or verification method: Run the Graph Loop consistency checker after updating node states and validation outcomes.
- Result: The checker returned `completed_with_validation_gap`; derived status matched the graph status and reported no issues or repairs.
- Exit status: 0
- Remaining uncertainty: Production deployment and public-host verification are pending.

## Evidence: Network-enabled production build
- Date: 2026-07-28
- Graph node: N4
- Command or verification method: Ran `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 ./node_modules/.bin/next build` with approved network access after the sandbox-only attempt failed to resolve `fonts.googleapis.com`.
- Result: Passed with exit 0. Webpack compiled successfully, lint and type checks completed, static pages generated, and `/clinic-success` appears as a static route. The output retained four unrelated lint warnings and a Sentry deprecation warning; neither was introduced by this feature.
- Exit status: 0
- Remaining uncertainty: Build proof is local; deployment and live canonical-host behavior remain unverified until promotion.

## Evidence: Production promotion and canonical-host readback
- Date: 2026-07-28
- Graph node: N6
- Command or verification method: Committed the exact staged scope as `631be92` (`Add clinic success pilot landing page`), pushed `HEAD` to `origin/main`, observed Vercel deployment `dpl_4zK8thhUo6oPZ9cGmk6vK1tHLWdH` transition to Ready, and fetched the canonical route plus sitemap and LLM route.
- Result: `https://www.ofroot.technology/clinic-success` returned HTTP 200, `age: 0`, `x-matched-path: /clinic-success`, and the expected title, description, canonical URL, Open Graph, Twitter metadata, JSON-LD, and explicit no-automatic-Health-patient-data copy. `https://www.ofroot.technology/sitemap.xml` returned 200 and contains the canonical route. `https://www.ofroot.technology/llms.txt` returned 200 and contains the accurate route description and boundary.
- Exit status: 0
- Remaining uncertainty: The page is a public informational and conversion surface; no authenticated booking submission or future Health integration was exercised, because neither was part of this feature.
