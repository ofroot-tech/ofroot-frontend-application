# CRM Integration Readiness — Phase 2 Architecture Only

## Scope

This is an adapter boundary, not a CRM integration. Phase 2 must not connect to, query, write to, or configure a live CRM.

The boundary exists so a later, explicitly approved clinic CRM connection can be added without changing the Technology-to-Health contract or leaking Health data.

## Clinic-scoped adapter boundary

Each adapter instance belongs to exactly one `clinic_id` and one named CRM destination. It receives a Technology-owned, allowlisted operational event and returns a normalized delivery result. It cannot accept arbitrary Health payloads, share credentials across clinics, or query a different clinic's records.

Required adapter inputs:

- `clinic_id`, `clinic_referral_id`, and optional `campaign_id` as opaque identifiers.
- Contract event ID, allowlisted lifecycle state, and `occurred_at` timestamp.
- A destination configuration reference, never raw credentials.

Permitted lifecycle states are the existing referral contract states: opened, signup started, account created, activated, timeline viewed, and report generated. These are attribution states, not health information.

## Least privilege and credentials

When a CRM is approved later, use one credential set per clinic and per destination. Request only create/update access to the dedicated referral-attribution object or explicitly approved custom fields. Do not request broad contact export, read-all, delete, admin, or unrelated pipeline scopes.

Credentials, refresh tokens, and client secrets remain server-side, encrypted, and unavailable to other clinics. Credential rotation, revocation, and a per-clinic kill switch are required before a connector can be enabled.

## Field and identity contract

| Technology field | CRM field | Rule |
| --- | --- | --- |
| `clinic_id` | `ofroot_clinic_id` | Immutable; adapter must enforce destination clinic match. |
| `clinic_referral_id` | `ofroot_clinic_referral_id` | Immutable external correlation ID; never reuse. |
| `campaign_id` | `ofroot_campaign_id` | Optional opaque attribution value. |
| lifecycle event type | `ofroot_referral_status` | Allowlisted state only; later events may advance state according to the published lifecycle map. |
| `occurred_at` | `ofroot_status_occurred_at_utc` | RFC 3339 UTC instant; never replace with CRM ingestion time. |
| event ID | `ofroot_last_event_id` | Idempotency trace only; no health data. |

External CRM record IDs are immutable once first bound. Store the destination name, clinic ID, `clinic_referral_id`, and CRM record ID in a separate mapping record with a unique constraint on both Technology referral identity and destination record identity. Never deduplicate across clinics or overwrite an existing mapping with a different CRM record.

## Idempotency and deduplication

The outbox uses the inbound event ID plus destination as its idempotency key. The adapter must make retries safe: a retry returns the original delivery result or safely replays the same upsert, and it must not increment a metric twice. Conflicts, duplicate external IDs, and destination/clinic mismatches go to a visible failed state; they are never silently reassigned.

## Time and metric contract

- Store all event, delivery, freshness, and aggregate timestamps in UTC.
- Store each clinic's IANA timezone only for display and clinic-local reporting cutoffs.
- Define each dashboard metric by event type, state transition, clinic filter, date window, timezone, and source-freshness requirement.
- Compare completed days only: default reporting windows end at the last completed clinic-local day, then convert the boundary to UTC for queries.
- Keep distinct metrics distinct. A referral lifecycle event is not a CRM appointment, meeting, lead, or conversion unless a later, separately versioned contract defines that mapping.
- Display source freshness (`last_successful_sync_at`, `last_attempt_at`, lag, and connector state) alongside any CRM-derived metric. A stale source must block a current-parity claim, not be treated as zero.

## Failure visibility and isolation

Record per-clinic operational metadata only: delivery ID, event ID, destination, attempt count, result class, error code, timestamps, and next retry time. Do not log request bodies, authorization headers, tokens, or Health payloads.

The aggregate dashboard must surface per-clinic connector state: disabled, healthy, delayed, failing, or paused; last success; lag; deduplicated event count; and unresolved failures. Global operators may see cross-clinic operational totals only through separately authorized administration, never by using one clinic's connector credential to read another clinic.

## Health-data prohibition

No Health data may be sent to a CRM by this adapter. Prohibited values include diagnoses, symptoms, medications, treatments, check-ins, timeline entries, reports, report content, notes, health-bearing intake, and Health account/session data.

Any future CRM delivery of patient-identifying or health information requires a separate Health-owned patient authorization flow with named recipient, clear data scope, recorded consent, and revocation/expiry behavior. That flow is outside Phase 2 and cannot be inferred from referral enrollment or a clinic's CRM connection.
