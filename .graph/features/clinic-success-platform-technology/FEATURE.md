# Feature: Clinic Success Platform — Technology Phase 2 foundation

## Status
The Technology receiver foundation is live and verified. Migration `20260728121108` is applied to Technology project `mkgycihcekojbvmsexgv`; all ten tables use FORCE RLS; browser/API roles have no access; and the dedicated receiver login reaches only receipt, lifecycle, and aggregate tables. Final Vercel deployment `dpl_FhS9NDcoG4fuGWLTdcn3RBBHbu27` is Ready from commit `249a33a` and serves `POST https://www.ofroot.technology/api/clinic-success/events`. Live Health-emitted `account_created` and `activated` events returned 202; an altered-body reuse returned 409; a byte-exact retry returned 200 duplicate; and Technology readback proved two immutable events with aggregate counts one and one. The health-free synthetic rows were then removed with exact predicates and all scoped counts returned to zero.

## Objective

Implement the OfRoot Technology-side Clinic Success Platform foundation without querying OfRoot Health or receiving health details. The intended scope is clinic-scoped operational data, referral lifecycle attribution, opaque signed referral URLs, authenticated lifecycle-event receipt, aggregate-only dashboard groundwork, and a non-live CRM adapter boundary.

## Acceptance criteria

- Every Technology record is clinic-scoped and contains no patient health detail.
- Referral URLs carry only opaque clinic/referral context and are signed with a rotating server-side secret.
- The event receiver validates raw-body HMAC, timestamp freshness, schema version, event type, and referral context before processing.
- Event IDs are transactionally idempotent; stale or replayed events do not change aggregates.
- Dashboard queries expose only clinic-level aggregate lifecycle counts.
- CRM readiness is clinic-scoped, least-privilege, idempotent, freshness-visible, timezone/metric-contract governed, and remains disconnected in Phase 2.
- Health data is never sent to a CRM without a separate Health-owned patient authorization.
- No Technology code queries Health databases or shares Health sessions.
- A dedicated Technology backend/database target, migration workflow, secrets boundary, and rollback plan are approved before implementation.
- Health and Technology ratify the exact v1 HMAC canonicalization profile before any cross-application receiver is exposed.

## Next bounded action

Implement the pending aggregate-only dashboard query and clinic authorization boundary against `clinic_lifecycle_aggregates`. Keep the CRM adapter disconnected and do not expose the receiver credential or raw lifecycle ledger to browser clients.

## Last reviewed
2026-07-28
