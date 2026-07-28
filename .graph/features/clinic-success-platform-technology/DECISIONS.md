# Decisions

## Decision: Treat the Clinic Success contract as a cross-application boundary
- Date: 2026-07-28
- Status: accepted
- Context: The contract worktree documents a Technology-to-Health integration. It states that the applications neither query each other's databases nor share patient sessions.
- Decision: Preserve the contract as the authority for Phase 2 inputs and outputs. Do not copy Health data models, auth, or database access into this Technology worktree.
- Evidence: `/private/tmp/ofroot-tech-clinic-success/docs/clinic-success-platform/{ARCHITECTURE,PRIVACY-BOUNDARY,EVENT-CONTRACT}.md`.

## Decision: Block implementation until a dedicated Technology persistence target is named
- Date: 2026-07-28
- Status: accepted
- Context: This repository has no `backend/` or `supabase/` directory. Its documented `DATABASE_URL`/Supabase store and `NEXT_PUBLIC_API_BASE_URL` serve existing shared platform surfaces, not a confirmed separate Clinic Success database.
- Decision: Do not add a referral table, event ledger, database migration, or receiver that might write to the shared platform or Health data store.
- Evidence: repository inspection on 2026-07-28; `README.md`, `.env.local.example`, `docs/SUPABASE_DB_OPERATIONS.md`.

## Decision: Use only the confirmed Technology Supabase target after independent read-only verification
- Date: 2026-07-28
- Status: accepted
- Context: The user identified `mkgycihcekojbvmsexgv` as the separate OfRoot Technology target and authorized its use. The configured MCP endpoint points to that project, but authentication did not complete for a schema read.
- Decision: Treat `mkgycihcekojbvmsexgv` as the only candidate persistence target. Do not write, migrate, deploy, or infer its schema until the MCP connection can complete the required read-only inspection. Health remains out of scope.
- Evidence: `codex mcp list`; MCP resource-list startup error recorded in evidence.

## Decision: Require fail-closed event ingestion
- Date: 2026-07-28
- Status: accepted
- Context: The contract requires HMAC over raw body and timestamp, version checks, transactional idempotency, and replay protection.
- Decision: When a Technology target is available, process only allowlisted contract events after signature, timestamp, version, and idempotency checks. Log operational metadata only; do not persist payload health details.
- Evidence: `/private/tmp/ofroot-tech-clinic-success/docs/clinic-success-platform/EVENT-CONTRACT.md`.

## Decision: Define CRM readiness as a non-live, clinic-isolated adapter boundary
- Date: 2026-07-28
- Status: accepted
- Context: CRM-derived metrics and lifecycle attribution can be misread when source definitions, completed-day windows, freshness, and appointment/meeting semantics are conflated. The Phase 2 privacy boundary also prohibits Health data transfer.
- Decision: Add an architecture-only adapter contract with per-clinic credentials and destination mapping, immutable external record IDs, event/destination idempotency, UTC storage, clinic-local presentation, explicit metric definitions, and visible sync health. Do not build, connect, or configure a live CRM in Phase 2. Do not send Health data to a CRM absent separate patient authorization owned by Health.
- Evidence: `CRM-INTEGRATION-READINESS.md`; SCALEIR metric-contract evidence in memory, including completed-day/source-freshness requirements and distinct meeting versus setter-outcome definitions.

## Decision: Propose an explicit v1 HMAC profile pending Health ratification
- Date: 2026-07-28
- Status: proposed
- Context: The shared draft requires HMAC over raw body and timestamp but does not define timestamp encoding, canonical message bytes, signature encoding/prefix, or replay-window duration.
- Decision: The local Technology implementation proposes Unix timestamp seconds, canonical bytes `<timestamp>.<rawBody>`, `HMAC-SHA256`, lowercase hex digest, `v1=<digest>`, and a five-minute replay window. Do not expose the receiver or claim cross-application compatibility until Health adopts the same versioned profile.
- Evidence: `app/lib/clinic-success/security.ts`; `__tests__/clinicSuccessSecurity.test.ts`.

## Decision: Keep Health issuer configuration separate from the Technology receiver
- Date: 2026-07-28
- Status: accepted
- Context: Vercel now contains `CLINIC_SUCCESS_REFERRAL_ISSUER` on the `ofroot-health-api` Production environment. The separate Technology `backend` project has no environment variables, deployment, or domain, and the Technology `main-website` project has no Clinic Success receiver-specific variables.
- Decision: Treat the new key as Health-side issuance configuration only. It does not authorize the Technology receiver to use the Health API, Health database connection, or Health secrets. Receiver implementation remains blocked until its Technology execution project and server-only HMAC/database configuration contract are named.
- Evidence: Read-only Vercel project and environment metadata inspection on 2026-07-28; no secret values retrieved.

## Decision: Host the Technology receiver on main-website
- Date: 2026-07-28
- Status: accepted
- Context: The user selected Vercel project `main-website`. Browser readback confirms its Production domain is `www.ofroot.technology`; current Production source is `origin/main@0654cbe`.
- Decision: Implement `POST /api/clinic-success/events` as a Node.js Next.js route in `main-website`. The route reads only `CLINIC_SUCCESS_DATABASE_URL` and `CLINIC_SUCCESS_EVENT_HMAC_SECRET_V1`; the database URL must identify Technology project `mkgycihcekojbvmsexgv`. Referral issuance uses the separate versioned key `CLINIC_SUCCESS_REFERRAL_SIGNING_SECRET_V1`. None of these names is public/client-side.
- Evidence: Browser readback, local source, focused tests, and production build on 2026-07-28.

## Decision: Use a dedicated least-privilege database role
- Date: 2026-07-28
- Status: accepted
- Context: The private schema denies `anon`, `authenticated`, and `service_role`. A general application or database-owner credential would give the receiver unnecessary access.
- Decision: The migration defines non-login role `clinic_success_receiver`, grants only receipt/event/aggregate access, and adds matching RLS policies. The dedicated login `clinic_success_receiver_login` inherits that role only, uses bounded connection and statement limits, and connects through the Technology transaction pooler. Credential creation and emergency disablement are separate operational scripts; no password or secret is stored in source.
- Evidence: `supabase/migrations/20260728121108_clinic_success_foundation.sql`; `supabase/operations/create_clinic_success_receiver_login.sql`; remote role and privilege readback on 2026-07-28.

## Decision: Roll back receiver access before considering schema deletion
- Date: 2026-07-28
- Status: accepted
- Context: The migration creates an append-oriented event ledger. Dropping it during an application incident would destroy evidence and expand the blast radius.
- Decision: For receiver incidents, first roll back the Vercel deployment and run `disable_clinic_success_receiver_login.sql` to revoke membership and set the login `NOLOGIN`. Preserve the schema and ledger for investigation. Dropping `clinic_success` requires a separate reviewed destructive action and is not part of the routine rollback.
- Evidence: `supabase/operations/disable_clinic_success_receiver_login.sql`; production release review on 2026-07-28.

## Decision: Deliver the opaque referral token in the URL fragment
- Date: 2026-07-28
- Status: accepted
- Context: Health's approved landing contract is `/clinic-referral#referral=<opaque-token>`.
- Decision: Technology emits the token only in the `referral` fragment parameter, never in the query string. The fragment is not transmitted in the HTTP request and therefore does not enter server/access logs. It may still be retained in local browser history, so the Health landing page should consume and clear it promptly.
- Evidence: `app/lib/clinic-success/security.ts`; `__tests__/clinicSuccessSecurity.test.ts`.

## Decision: Fix the first two Health lifecycle milestones
- Date: 2026-07-28
- Status: accepted
- Context: Health requested confirmation for attachment and first activation.
- Decision: Emit `clinic_referral.account_created` after the Health account/referral attachment transaction commits. Emit `clinic_referral.activated` only on the first activation transition. Each transition receives a globally unique event ID; retries of that transition reuse its event ID.
- Evidence: strict allowlist and milestone tests in `app/lib/clinic-success/contract.ts` and `__tests__/clinicSuccessSecurity.test.ts`.
