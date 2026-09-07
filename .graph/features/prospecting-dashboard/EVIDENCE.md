# Evidence

## Evidence: Existing capabilities and route boundary
- Date: 2026-09-06
- Graph node: N1
- Command or verification method: Focused source inspection of the login route, dashboard routes, and existing CRM import panel.
- Result: Dashboard pages require a server-side session. Existing CRM import recognizes CSV, HubSpot, Facebook, and other export sources. No verified directory connector was found.
- Exit status: 0
- Remaining uncertainty: Production authentication configuration and data-source credentials were not queried.

## Evidence: Implementation and scoped review
- Date: 2026-09-06
- Graph node: N2
- Command or verification method: Scoped diff review and `git diff --check`.
- Result: The authenticated route, browser-local CSV import, deterministic dedupe, fit scoring, filters, source state, evidence/inference split, and draft-only outreach controls are scoped to `app/dashboard/prospecting/`, with one dashboard navigation addition.
- Exit status: 0
- Remaining uncertainty: Authenticated browser rendering needs a configured session.

## Evidence: Static and unauthenticated runtime checks
- Date: 2026-09-06
- Graph node: N3
- Command or verification method: `./node_modules/.bin/tsc --noEmit`; `NEXT_PUBLIC_API_BASE_URL=https://ofroot-leads.onrender.com/api npm run build`; a Node execution check for CSV parsing, mapping, dedupe key, and score; and local `curl -I http://127.0.0.1:4025/dashboard/prospecting`.
- Result: TypeScript passed. The production build passed with pre-existing lint warnings. Parsing, mapping, dedupe key, and scoring passed. The protected route returned `307` to `/auth/login?next=/dashboard/prospecting` with `no-store` cache control.
- Exit status: 0
- Remaining uncertainty: The local worktree has no database/session configuration, so the authenticated desktop and mobile interface could not be exercised.


## Evidence: Action queue and score boundary
- Date: 2026-09-06
- Graph node: N4
- Command or verification method: `./node_modules/.bin/tsc --noEmit`, `npm test -- --runInBand __tests__/prospecting-utils.test.ts`, and `git diff --check`.
- Result: TypeScript and the three focused utility tests passed. The score does not change when only an inferred need changes; equivalent website variants deduplicate; older browser-local records receive safe action defaults.
- Exit status: 0
- Remaining uncertainty: An isolated full build could not run because the workstation ran out of disk while installing the worktree's dependencies. The complete repository suite retains one unrelated canonical-logo expectation failure.

## Evidence: Contact operations update
- Date: 2026-09-06
- Command or verification method: `tsc --noEmit`, focused prospecting utilities tests, and `git diff --check`.
- Result: Four focused tests passed, including contact-name CSV mapping and personalized draft output.
- Remaining uncertainty: Production UI verification follows the deployment.

## Evidence: Daily-workflow implementation and local runtime
- Date: 2026-09-07
- Graph nodes: N5, N6
- Commands or verification method: `npx tsc --noEmit`; `npm test -- --runInBand __tests__/prospecting-utils.test.ts`; `NEXT_PUBLIC_API_BASE_URL=https://ofroot-leads.onrender.com/api npm run build`; `git diff --check`; authenticated local browser checks at desktop and 390 by 844 mobile viewport using six synthetic prospects.
- Result: TypeScript, four focused tests, diff validation, and the production build passed. The browser rendered a five-item worklist from six prospects, exposed email, telephone, and website links, recorded No answer in one click, scheduled two business days, removed the handled prospect from immediate work, and advanced to the next business. Desktop and mobile layouts showed no observed horizontal overflow.
- Exit status: 0
- Remaining uncertainty: Canonical production runtime remains unverified until the pull request is merged and the deployment reaches READY.

## Evidence: Production release and canonical readback
- Date: 2026-09-07
- Graph node: N7
- Commands or verification method: GitHub PR #41 merge readback; GitHub commit-status readback for merge `9248f9c4f2283448b11f0f092ae0aa308f11f3d2`; `vercel inspect` for production deployment `dpl_JCeaGuttWQmMSe2BC9j6nKntvF6t`; authenticated browser verification at `https://www.ofroot.technology/dashboard/prospecting`.
- Result: PR #41 is merged, the production deployment is READY and aliased to both canonical domains, and the authenticated canonical route renders “Your next five conversations,” the Next five default, expanded search, compact metrics, and the truthful empty state.
- Exit status: 0
- Rollback: Revert merge commit `9248f9c4f2283448b11f0f092ae0aa308f11f3d2` and allow the existing Vercel Git integration to redeploy.
- Remaining uncertainty: Contact discovery and remote persistence are still intentionally absent; prospect data remains browser-local.


## Evidence: Houston HVAC discovery implementation
- Date: 2026-09-07
- Graph nodes: N8, N9
- Commands or verification method: Texas Open Data metadata and SODA API inspection; `./node_modules/.bin/jest --runInBand __tests__/prospecting-utils.test.ts`; `./node_modules/.bin/tsc --noEmit`; `NEXT_PUBLIC_API_BASE_URL=https://ofroot-leads.onrender.com/api npm run build`; local unauthenticated API request; `git diff --check`.
- Result: The official dataset exposed 3,037 Harris County A/C contractor rows and no populated contact fields. The implementation filters expired licenses, maps public license evidence, deduplicates source and business identities, caps imports at 100, protects the API with the existing session, and gives every imported record an explicit contact-research action. Six focused tests, TypeScript, diff validation, and the production build passed. The unauthenticated API returned 401.
- Exit status: 0
- Remaining uncertainty: Authenticated provider retrieval and the rendered import interaction require a configured deployment because the local database/session configuration is unavailable. No email, website, or phone enrichment is included.


## Evidence: Houston HVAC production release and canonical import
- Date: 2026-09-07
- Graph nodes: N9, N10
- Commands or verification method: PR #43 merge readback; Vercel deployment inspection; canonical alias inspection; authenticated browser interaction at `https://www.ofroot.technology/dashboard/prospecting`.
- Result: PR #43 merged at `42b7ce2332424176907511b6e70a5af41a443030`. Production deployment `dpl_9GnaBLPEo38JoLxFtTBWQBVJ4Ltc` reached READY and the canonical domain resolved to it. The authenticated route rendered the collector, imported 100 current licensed businesses from 2,415 available records, showed 0 reachable because TDLR provides no contact fields, preserved source date and license evidence, and a repeated discovery added 0 while skipping 100 duplicates.
- Exit status: 0
- Rollback: Revert merge commit `42b7ce2332424176907511b6e70a5af41a443030` and allow the Vercel Git integration to redeploy.
- Remaining uncertainty: Website, phone, and email enrichment are not yet connected; records remain in the operator's browser storage.


## Evidence: Source refresh preservation repair
- Date: 2026-09-07
- Graph nodes: N11, N12
- Commands or verification method: `./node_modules/.bin/jest --runInBand __tests__/prospecting-utils.test.ts`; `./node_modules/.bin/tsc --noEmit`; `NEXT_PUBLIC_API_BASE_URL=https://ofroot-leads.onrender.com/api npm run build`; `git diff --check`.
- Result: Repeated discovery now refreshes TDLR-controlled evidence, expiration, source date, and a missing contact-research action while preserving operator-entered email, notes, and outreach state. The client import boundary supplies the research-action default when a cached or older discovery payload omits it, browser-record normalization recognizes both saved TDLR schemas, and the queue derives a visible `Find contact route` instruction directly from license evidence. Eight focused tests, TypeScript, diff validation, and the production build passed.
- Exit status: 0
- Remaining uncertainty: Canonical refresh behavior remains pending until the repair deployment is READY.


## Evidence: Source refresh repair canonical verification
- Date: 2026-09-07
- Graph node: N12
- Commands or verification method: PR #45, #46, #47, #48, and #49 merge readback; Vercel deployment inspection; canonical alias inspection; authenticated fresh-tab browser verification at `https://www.ofroot.technology/dashboard/prospecting`.
- Result: Source-aware refresh, payload fallback, saved-record migration, legacy-license recognition, and the derived queue instruction are merged. Production deployment `dpl_Hh6k7gfxJVsXNCucHANkAdQJAAri` reached READY at the canonical domain. A fresh authenticated tab rendered five licensed businesses with `Find website and contact route` in every queue row and in the selected record's action field.
- Exit status: 0
- Rollback: Revert the merge chain from `377bcb3b2bbe8f30dd68c5db8f121ad20eeb344c` through `21deb007aebe9b8ac844e0221c4bf09454e7436c` and redeploy.
- Remaining uncertainty: TDLR provides licensing evidence but no email, phone, or website; contact enrichment remains the next bounded stage.
