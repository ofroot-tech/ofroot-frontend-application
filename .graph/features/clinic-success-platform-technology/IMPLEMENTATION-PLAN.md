# Smallest Reviewable Implementation and Validation Plan

## Current boundary

Target: OfRoot Technology Supabase project `mkgycihcekojbvmsexgv` only.

Excluded: every OfRoot Health database, Health session, Health credential, and patient health datum. Phase 2 also excludes live CRM connectivity.

Read-only target evidence:

- Project: `ofroot-tech's Project`, reference `mkgycihcekojbvmsexgv`, main Production branch.
- Public schema: 29 tables.
- RLS: disabled on all 29 listed public tables; no policies displayed.
- Migration state: Supabase Migrations shows “Run your first migration”; `_prisma_migrations` exists in `public`.
- Clinic Success tables: none found.

## Reconciliation result

The current source repository contains a shared platform store (`ofroot_*` tables in `app/lib/supabase-store.ts`) and a separate Prisma telephony schema. Neither is a safe model to copy into the separate Technology target without a target-schema inspection.

The shared source patterns that are reusable as patterns—not as persistence targets—are:

- Explicit tenant scoping.
- Server-side secret use only.
- Raw-body webhook verification before parsing or processing.
- Unique event keys for idempotent state changes.

The browser inspection reconciles the target with the repository: public contains the Prisma telephony tables, the shared `ofroot_*` store, and the operational contacts/jobs/invoices tables. Schema ownership is mixed between Prisma and application runtime DDL, while Supabase migration history is empty.

## Proposed isolated Technology model

The following is the reviewable target model. Put it in a dedicated, non-exposed `clinic_success` schema so it cannot collide with or inherit the current public Data API posture.

| Record | Key fields | Boundary |
| --- | --- | --- |
| `clinic` | immutable `clinic_id`, display name, IANA timezone, status | Technology-owned clinic configuration only. |
| `clinic_location` | immutable ID, `clinic_id`, timezone, status | Clinic operations only. |
| `referral_campaign` | immutable ID, `clinic_id`, optional operational label, status | No Health data. |
| `clinic_referral` | immutable opaque ID, `clinic_id`, optional campaign/location ID, signed-context expiry, issue/revoke state | Never stores Health account, session, or health content. |
| `referral_event_receipt` | `event_id`, raw-body digest, signature version, received/occurred UTC timestamps, verification result | Unique `event_id`; operational metadata only. |
| `referral_lifecycle_event` | immutable event ID, `clinic_referral_id`, allowlisted event type, occurred UTC timestamp | No arbitrary payload or health detail. |
| `clinic_lifecycle_aggregate` | clinic/time-bucket/event type/count, source freshness timestamp | Aggregate-only dashboard projection. |
| `crm_destination` | `clinic_id`, destination label, disabled state, configuration reference | No credentials in application records; no live connection in Phase 2. |
| `crm_external_record_map` | clinic/referral/destination identity and immutable external record ID | Unique within a clinic and destination; never cross-clinic. |
| `crm_sync_outbox` | event/destination idempotency key, attempt metadata, visible state | No CRM calls in Phase 2. |

Required database constraints: foreign keys always retain clinic scope; unique `(clinic_id, clinic_referral_id)`; unique lifecycle `event_id`; unique CRM `(clinic_id, destination_id, clinic_referral_id)` and `(clinic_id, destination_id, external_record_id)`; indexes for per-clinic reporting and freshness. No health-bearing JSON/blob column is permitted.

## First reviewable implementation slice

1. Create a target-local migration only after one migration owner is selected and rollback is rehearsed outside production.
2. Add clinic, referral, receipt, lifecycle-event, and aggregate tables plus clinic-isolation constraints. Do not add a Health client or CRM network client.
3. Add a server-only referral signer that emits an opaque URL containing only contract-approved context.
4. Add an event receiver that reads the raw body, validates HMAC/timestamp/version/event allowlist, transactionally records `event_id`, and updates a projection exactly once.
5. Add the disconnected CRM mapping/outbox tables only; no OAuth flow, provider SDK, or outbound request.

## Required validation plan

### Target readiness, read-only first

- Confirm target identity and project reference `mkgycihcekojbvmsexgv`. Passed through authenticated Chrome.
- List target tables, migrations, RLS/policies, and clinic/referral naming conflicts. Passed: 29 public tables, all RLS-disabled/no policies, no Clinic Success tables, no Supabase migration history.
- Confirm no Health database link, shared credential, or Health-data integration is configured. Still required before migration.
- Record the target environment and migration/rollback owner.

### Migration and access validation

- Apply only in an approved non-production Technology environment.
- Verify migration history/readback and required indexes/constraints.
- Prove one clinic cannot select or insert another clinic's records using the intended runtime role.
- Prove no exposed table grants browser roles access without RLS and an explicit policy.

### Receiver and referral tests

- Valid opaque referral URL contains only `clinic_id`, `clinic_referral_id`, optional `campaign_id`, expiry, return URL, key ID/version, and signature.
- Altered signature, expired URL, stale timestamp, wrong version, unsupported event, wrong clinic/referral pairing, and replayed event fail without an aggregate mutation.
- Same event retry is accepted as idempotent and does not increment an aggregate twice.
- Logs and persisted receipts contain operational metadata only; test fixtures contain no Health details.

### Dashboard and CRM-readiness tests

- Aggregate queries return clinic-scoped counts only and use UTC storage with the documented clinic-local completed-day boundary.
- Connector health exposes freshness/failure metadata without CRM payloads.
- CRM outbox/mapping remains disconnected; no network call is possible in Phase 2.

## Receiver configuration contract

Technology `main-website` server-only variables:

- `CLINIC_SUCCESS_DATABASE_URL`: least-privilege Postgres connection that must identify Supabase project `mkgycihcekojbvmsexgv`.
- `CLINIC_SUCCESS_EVENT_HMAC_SECRET_V1`: verifies Health lifecycle events using signature header `v1=<lowercase hex HMAC-SHA256>`.
- `CLINIC_SUCCESS_REFERRAL_SIGNING_SECRET_V1`: signs opaque referral tokens using key ID `v1`.

Confirmed receiver URL: `https://www.ofroot.technology/api/clinic-success/events`.

Health needs matching secret values for referral verification and lifecycle-event signing plus the receiver URL. Secret generation and installation are owned by the authorized Health/Technology operators, not this implementation.

Referral landing contract: `https://ofroot.health/clinic-referral#referral=<opaque-token>`. The fragment is absent from HTTP requests/server logs but may remain in local browser history until Health consumes and clears it.

Initial Health lifecycle mapping:

- Committed account/referral attachment → `clinic_referral.account_created`.
- First activation transition → `clinic_referral.activated`.
- A retry reuses the original transition event ID; distinct transitions use distinct globally unique event IDs.

## Remaining blocker

Remote schema writes remain blocked because:

- The visible target is the main Production branch; no non-production Technology branch/environment was identified.
- Public has 29 unrestricted tables with RLS disabled and no policies. Clinic Success must not reuse that exposure pattern.
- Supabase migration history is empty while Prisma migration history exists, so migration ownership and drift reconciliation are not established.
- The signing-secret owner, rotation procedure, rollback owner, and proof that no Health database link/shared credential exists are still unverified.
- The new `CLINIC_SUCCESS_REFERRAL_ISSUER` key is on the Health API Production environment. Neither Technology execution candidate has a receiver-specific HMAC configuration; the separate `backend` project also lacks a deployment and domain.

The route and mocked-persistence integration tests are ready. Both shared versioned secrets are now present in `main-website` Production. Production release remains blocked because `CLINIC_SUCCESS_DATABASE_URL` is absent. A Technology database owner must provision a login that inherits only `clinic_success_receiver`; the broad existing `DATABASE_URL` must not be reused. The migration still requires rehearsal/readback, followed by a valid signed event plus identical retry proving one aggregate increment.

## Migration and rollback scope

The unapplied migration creates only private schema `clinic_success`, its clinic/referral/receipt/lifecycle/aggregate tables, disconnected CRM readiness tables, constraints/indexes, and non-login role `clinic_success_receiver` with narrowly scoped grants/RLS policies. It does not alter Health or existing `public` tables.

Application rollback is the prior verified `main-website` Production deployment at `0654cbe`; the receiver can also fail closed by removing its server-only HMAC configuration. Before real Clinic Success data exists, database rollback may drop only `clinic_success` objects and the unused receiver role after confirming no memberships. After data exists, retain the schema, revoke the receiver credential/role membership, and roll back the application rather than dropping operational records.
