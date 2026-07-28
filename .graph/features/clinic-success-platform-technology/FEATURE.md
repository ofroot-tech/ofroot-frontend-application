# Feature: Clinic Success Platform — Technology Phase 2 foundation

## Status
Production database integration is verified and the application is at the deployment gate. Technology migration `20260728121108` is applied to `mkgycihcekojbvmsexgv`; all ten tables use FORCE RLS; browser/API roles have no access; and a dedicated `clinic_success_receiver_login` reaches only receipt, lifecycle, and aggregate tables through the transaction pooler. `main-website` Production has all three sensitive server-only variables. Nineteen focused tests, TypeScript, focused ESLint, an isolated production build, and a valid-event/identical-retry database integration pass. Synthetic rows were removed. The canonical receiver remains on the prior deployment until publication and live verification complete.

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

Publish the scoped source to `main-website`, verify the Vercel deployment is Ready, prove the canonical route is no longer 404 and rejects a bad signature with 401, then coordinate one Health-emitted valid event plus identical retry and confirm one Technology aggregate increment. Do not retrieve or expose the rotated shared secret values.

## Last reviewed
2026-07-28
