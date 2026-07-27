# Feature: canonical www host

## Status
Completed with validation gap

## Objective
Make the repository-generated public SEO URLs consistently use `https://www.ofroot.technology`, which is the observed live redirect destination for the naked host.

## Acceptance criteria
- Metadata, Open Graph URLs, Organization/WebSite JSON-LD, sitemaps, robots, and generated absolute URLs use the www canonical host.
- Existing relative links and non-URL email addresses are unchanged.
- A focused automated contract test and TypeScript check pass.
- The live naked-to-www redirect is recorded as deployment behavior, not claimed as caused by this repository change.

## Non-goals
- Change Vercel/domain/DNS redirect settings, deploy, commit, push, or modify content strategy.

## Next bounded action
On a dependency-complete checkout or CI run `npx jest __tests__/canonicalHost.test.ts --runInBand`, `npx tsc --noEmit`, and `npm run build` before deployment. Verify the deployed HTML, sitemap, robots, and schema after a separately authorized deployment.

## Last reviewed
2026-07-27
