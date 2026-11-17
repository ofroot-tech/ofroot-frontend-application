# Partner acquisition funnel — Sprint 1

## Outcome

A staffing/recruiting/consultancy visitor can compare personally delivered embedded engineering with a scoped, founder-led managed engagement at `/partners/staffing`. A qualified inquiry creates a durable owner-review record and a visitor receipt. No contract, capacity, price or start date is accepted automatically.

## Current-state audit

- Next.js 15 App Router, React 19, TypeScript, Tailwind/CSS modules, Geist typography and the existing plum/copper/lilac public design.
- The existing homepage emphasizes workflow automation and practical AI. Sprint 1 adds partner navigation and a hero link; the larger positioning refresh remains Sprint 2.
- Vercel project `main-website` serves the existing domain. This branch changes no production configuration or deployment settings.
- Existing PostgreSQL sales inquiries and owner dashboard provide the handoff. Older public inquiry handlers remain unchanged; the dedicated partner endpoint does not inherit their automatic email behavior or personal-data logging.
- Existing service/SEO routes are retained. No URL was deleted or renamed. Search Console, conversion baseline, approved biography and contracting regions are not independently verified.
- Existing analytics have unproven consent behavior. Partner measurement therefore uses local, allowlisted events only, and the partner route suppresses the existing public analytics component.

## Implementation

- Landing page: partner types, distinct engagement responsibilities, technical-fit discussion, founder accountability, six-step process, native FAQ, canonical/social metadata and Service schema. No invented years, staffing availability, client proof, prices or guarantees.
- Form: name, work email, company, partner type, engineering need, description, timeframe, optional budget and privacy acknowledgment. Pending/error/receipt states preserve answers; an unchanged retry keeps the request reference. Privacy opens separately to retain the draft.
- `/api/partner-inquiry`: strict bounded JSON validation, origin/Host comparison, honeypot, no-store responses and generic failures without personal-data logging. Arbitrary forwarded-host headers are not trusted.
- Transactional handoff: one existing sales-inquiry record plus unique receipt. Concurrent identical retries reuse the record; changed content under the same reference is rejected. Separate requests from a contact are not merged. Shared global/network/email rate budgets use keyed hashes.
- Owner queue: engineering need, description, partner context and referral source. Updates preserve existing pipeline ownership/metadata, including compatibility with legacy null pipeline values. Initial consent/history and owner/next action are stored; later-stage pipeline redesign is deferred.
- Notifications: founder notice and visitor acknowledgment are unsent drafts in the record, visible as approval-required. There is no enabled mail sender, queue worker or outbound cadence.
- Analytics: `partner_page_view`, `partner_cta_click`, `partner_form_start`, `partner_form_submit` emit local hooks containing only fixed page/event/placement labels. No form text, names, addresses or receipt IDs are sent to analytics.

## Enablement and migration

Default intake is disabled. Server configuration names:

- `PARTNER_INQUIRY_ENABLED` — explicit enablement.
- `PARTNER_INQUIRY_DATABASE_URL` — reviewed durable sales-pipeline database; no fallback to shared credentials.
- `PARTNER_INQUIRY_DATABASE_CA` — reviewed PEM root certificate when the database uses a private CA. Remote connections always verify TLS; URL SSL switches cannot disable verification. Only non-production loopback fixtures allow plaintext.
- `PARTNER_INQUIRY_HASH_SECRET` — stable server-only secret of at least 32 characters.

Apply `migrations/20261116_partner_inquiry.sql` explicitly only after reviewing the target environment, existing sales table, migration state/drift, encrypted connection, ownership and rollback. It adds receipt and rate-limit tables; startup and requests never run migrations. Verify a synthetic saved result and owner access on the approved target before enablement.

The migration also protects the existing sales-inquiry table and both new tables with row-level security and removes PUBLIC/anon/authenticated grants. The server pipeline must connect as the reviewed table owner or an explicitly authorized role; anonymous Data API access is not supported for these private records.

Initial Sprint 1 validation wrote only the isolated loopback `ofroot_partner_test` fixture. Production setup is a separate explicit operation subject to the target checks above; production metadata inspection does not replace a saved-inquiry readback.

## Validation

- 105 tests passed across eight focused/regression suites, including real isolated PostgreSQL persistence, concurrent retries, separate-request preservation, rate limits, disabled configuration, origin normalization, owner edits and owner-queue rendering.
- Final `npm run build` passed, including lint and TypeScript checks; the build's six reading suites passed 32 tests. Existing repository warnings remain.
- Production-build browser smoke passed desktop 1440px and mobile 390px inquiry submissions, simulated failure/retry with retained answers/reference, one-click homepage route, native FAQ keyboard use, menu Escape/focus return, metadata, private analytics hooks and security headers.
- Automated WCAG A/AA-tagged scans reported zero violations at desktop and mobile widths. This is a smoke check, not a complete accessibility certification.
- No horizontal overflow at 320, 390, 768, 1024 and 1440px. Local performance smoke observed LCP 212ms and CLS 0 without network/CPU throttling; these are not field Core Web Vitals or production forecasts.
- Screenshots and the local JSON report are saved outside the PR under `output/playwright/partner-funnel/`. Failed earlier setup evidence is preserved separately.

Local check commands (use only an isolated loopback test database):

```sh
TEST_PARTNER_DATABASE_URL='postgresql://127.0.0.1:55439/ofroot_partner_test' npm test -- --runInBand __tests__/partnerInquiry.test.ts __tests__/partnerInquiry.integration.test.ts __tests__/partnerPipeline.test.tsx
npm run build
TEST_PARTNER_DATABASE_URL='postgresql://127.0.0.1:55439/ofroot_partner_test' node scripts/check-partner-funnel.cjs
```

The browser script rejects non-loopback targets and blocks external browser requests. It requires a running local server with synthetic intake enabled and the migration applied to its test fixture. The unit suite skips database integration checks when no explicit test URL is provided.

## Ordered issue/PR plan

1. This PR: revenue-first partner page, distinct offers, qualified intake, durable handoff, local analytics hooks and homepage links.
2. Founder review: public copy/bio/technical capabilities, contracting model/regions, approved proof, privacy wording, lead owner/destination and sender/recipient/templates. Verify actual notification delivery separately before publication/enablement.
3. Sprint 2: broader homepage positioning and buyer segmentation, configurable lead stages/history, owner dashboard improvements and approved scheduling/follow-up drafts.
4. Sprint 3: separate embedded/managed pages, approved evidence and proposal/commercial templates.
5. Engineering Companion Phase A: separate synthetic-data prototype plan in `COMPANION-PLAN.md`; no customer data or external AI integration is included here.

## Acceptance and release gates

- [x] Clear staffing intent, distinct delivery models, qualified form, metadata and one-click homepage route.
- [x] Local durable storage, safe retries, bounded validation/rates and owner/consent records.
- [x] Current-source tests/build/lint/typecheck and desktop/mobile smoke.
- [x] External analytics and notification sending disabled by default.
- [ ] Founder approves public claims, contracting eligibility/regions, permissible proof and privacy language.
- [ ] Approved lead routing/sender/templates and real notification delivery verified.
- [ ] Target-specific migration, encrypted database connection, synthetic record and owner access verified.
- [ ] PR/preview reviewed and explicit production release/enablement authorized.

## Rollback

Disable `PARTNER_INQUIRY_ENABLED` before reverting the feature commit. Revert page/form/API/store, homepage/navigation, queue and sitemap changes. Preserve saved inquiries and receipt history; do not delete records or drop tables during a routine code rollback. No provider, billing or production configuration changes are part of this PR.
