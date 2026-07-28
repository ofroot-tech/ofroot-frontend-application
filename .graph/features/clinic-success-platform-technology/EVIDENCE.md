# Evidence

## Evidence: Technology/Health boundary contract reviewed
- Date: 2026-07-28
- Graph node: OBS-1
- Command or verification method: Read the shared draft contract in `/private/tmp/ofroot-tech-clinic-success/docs/clinic-success-platform/`.
- Result: The contract permits only opaque clinic/referral IDs, optional campaign ID, lifecycle event type/time, and aggregate reporting. It forbids Health database queries, shared patient sessions, and health-bearing payloads.
- Exit status: 0
- Remaining uncertainty: The contract is untracked in its source worktree and has not been released as a shared versioned artifact.

## Evidence: Current repository has no dedicated Clinic Success service or database target
- Date: 2026-07-28
- Graph node: OBS-2
- Command or verification method: `test -d backend; test -d supabase; rg -n "DATABASE_URL|NEXT_PUBLIC_API_BASE_URL|SUPABASE" .env.local.example README.md docs/SUPABASE_DB_OPERATIONS.md`.
- Result: Neither `backend/` nor `supabase/` exists. The current application documents shared server-store/API configuration but does not identify a separate Clinic Success database or migration owner.
- Exit status: 0
- Remaining uncertainty: A dedicated Technology service may exist outside this worktree, but it was not provided or discoverable from this repository.

## Evidence: Existing webhook route is not sufficient for this contract
- Date: 2026-07-28
- Graph node: OBS-3
- Command or verification method: Read `app/api/telephony/webhook/[provider]/route.ts` and `app/api/workflows/events/ingest/route.ts`.
- Result: Existing routes show raw-body provider verification and internal workflow ingestion patterns, but neither implements the Clinic Success HMAC/timestamp/version/event-ledger/replay contract or separate persistence boundary.
- Exit status: 0
- Remaining uncertainty: Reusing either route without an approved Technology database and signing-secret boundary would be unsafe.

## Evidence: Bounded graph is internally consistent
- Date: 2026-07-28
- Graph node: GATE-1
- Command or verification method: `python3 /Users/ofroot/.agents/skills/graph-loop-engineering/scripts/validate_graph_consistency.py --graph .graph/features/clinic-success-platform-technology/GRAPH.json --feature .graph/features/clinic-success-platform-technology/FEATURE.md --evidence .graph/features/clinic-success-platform-technology/EVIDENCE.md`.
- Result: Passed. The checker derived the required `blocked` status and reported no consistency issues or repairs.
- Exit status: 0
- Remaining uncertainty: Graph consistency does not supply the missing Technology backend/database target.

## Evidence: CRM readiness contract added without a CRM connection
- Date: 2026-07-28
- Graph node: OBS-4
- Command or verification method: Design review against the existing Technology/Health boundary and the SCALEIR metric-contract lessons recorded in memory.
- Result: The readiness layer defines per-clinic adapter isolation, least-privilege scopes, immutable IDs, idempotency, UTC and clinic-timezone rules, metric definitions, freshness/failure visibility, and an explicit prohibition on Health-data CRM transfer without separate authorization. It does not add a connector or credentials.
- Exit status: 0
- Remaining uncertainty: Destination-specific OAuth scopes and object APIs cannot be selected until a CRM and clinic target are approved.

## Evidence: Technology target is configured but schema inspection cannot authenticate
- Date: 2026-07-28
- Graph node: OBS-5
- Command or verification method: `codex mcp list`; attempted Supabase MCP `list_mcp_resources` for server `supabase`.
- Result: `codex mcp list` shows enabled Supabase endpoint `https://mcp.supabase.com/mcp?project_ref=mkgycihcekojbvmsexgv...`. The read-only resource request failed before a query: `MCP startup failed: failed to refresh OAuth tokens for server supabase: OAuth token refresh failed: Failed to parse server response`.
- Exit status: 1
- Remaining uncertainty: Existing target schemas, tables, migrations, RLS, roles, and data isolation cannot be asserted until the user reauthenticates the MCP server.

## Evidence: Source data model and minimal implementation plan reconciled
- Date: 2026-07-28
- Graph node: PLAN-1
- Command or verification method: Read `app/lib/supabase-store.ts`, `prisma/schema.prisma`, `app/api/telephony/webhook/[provider]/route.ts`, and the Clinic Success contract.
- Result: The repository's shared `ofroot_*` store and telephony schema are not safe persistence targets for the separate Technology product. `IMPLEMENTATION-PLAN.md` defines a target-local, clinic-scoped proposal and validation sequence with no Health or live CRM access.
- Exit status: 0
- Remaining uncertainty: Proposed table/schema names require reconciliation with the remote Technology target before any migration exists.

## Evidence: Second read-only MCP attempt remained unauthenticated
- Date: 2026-07-28
- Graph node: OBS-5
- Command or verification method: Repeated Supabase MCP `list_mcp_resources` for server `supabase`.
- Result: The client again failed during startup, before any project request: `failed to refresh OAuth tokens for server supabase: OAuth token refresh failed: Failed to parse server response`.
- Exit status: 1
- Remaining uncertainty: The target's schema and data isolation remain unobserved. No further retry is safe until the connection is reauthenticated or repaired.

## Evidence: Correct authenticated Chrome profile confirms Technology target and schema state
- Date: 2026-07-28
- Graph node: OBS-5
- Command or verification method: Selected Chrome profile `mcdaniel`, claimed the open `ofroot-tech's Org` Supabase tab, and read the project, Table Editor, Policies, Schema Visualizer, and Migrations pages without mutation.
- Result: Confirmed `ofroot-tech's Project` at `mkgycihcekojbvmsexgv` on main Production. Public contains 29 tables and no Clinic Success tables. Policies shows RLS disabled, no policies, and Data API exposure warnings for every table. Supabase Migrations shows “Run your first migration”; `_prisma_migrations` exists.
- Exit status: 0
- Remaining uncertainty: The UI inspection did not prove absence of Health database links/shared credentials or identify a non-production Technology target, migration owner, signing-secret owner, or rollback owner.

## Evidence: Local private-schema migration artifact created but not applied
- Date: 2026-07-28
- Graph node: TASK-1
- Command or verification method: `supabase migration new clinic_success_foundation --yes`; reviewed `supabase/migrations/20260728121108_clinic_success_foundation.sql`.
- Result: The unapplied artifact creates a locked `clinic_success` schema with clinic/referral/event/aggregate and disconnected CRM-readiness tables, composite clinic-scope constraints, unique event IDs, immutable CRM identity mapping, forced RLS, and no grants to browser or service roles.
- Exit status: 0
- Remaining uncertainty: SQL syntax, rollback, RLS behavior, migration history, and remote readback are not validated against a non-production Technology database. The migration has not run anywhere.

## Evidence: Referral and event security contract implemented locally
- Date: 2026-07-28
- Graph node: TASK-2
- Command or verification method: Reviewed `app/lib/clinic-success/contract.ts` and `app/lib/clinic-success/security.ts`.
- Result: Strict allowlisted payloads reject unknown/health-bearing fields; signed referrals contain contract-approved opaque context; event authentication verifies raw-body HMAC, Unix timestamp freshness, contract version, event ID parity, safe size, and occurrence time before returning parsed data.
- Exit status: 0
- Remaining uncertainty: The v1 canonical signature profile is a Technology proposal and has not been ratified by Health. No HTTP receiver or persistence transaction exists.

## Evidence: Focused local validation results
- Date: 2026-07-28
- Graph node: TASK-2
- Command or verification method: `npm test -- --runInBand __tests__/clinicSuccessSecurity.test.ts`; `npx tsc --noEmit`; `npx eslint app/lib/clinic-success/contract.ts app/lib/clinic-success/security.ts __tests__/clinicSuccessSecurity.test.ts`.
- Result: Six security tests passed; TypeScript exited 0; focused ESLint exited 0. Tests cover valid referral/event input, tampering, expiry, stale timestamps, unsupported versions, health-bearing fields, and event-ID mismatch.
- Exit status: 0
- Remaining uncertainty: No database integration, idempotent transaction, route, build, runtime, or remote validation was performed.

## Evidence: Vercel receiver configuration remains on the wrong application boundary
- Date: 2026-07-28
- Graph node: OBS-6
- Command or verification method: Read-only Vercel project metadata plus `vercel env ls --format json` for `backend`, `main-website`, and `ofroot-health-api`; inspected names, types, and scopes only.
- Result: `ofroot-health-api` has the newly created encrypted Production key `CLINIC_SUCCESS_REFERRAL_ISSUER`. The separate Technology `backend` project has no environment variables, deployment, or domain. `main-website` has existing application/database variables but no Clinic Success receiver-specific key. No secret value was retrieved.
- Exit status: 0
- Remaining uncertainty: The Technology receiver execution project, endpoint, server-only HMAC secret name, Technology-only database binding, Preview configuration, and exact Health/Technology v1 signature agreement remain undefined.

## Evidence: Receiver route and transactional idempotency implemented locally
- Date: 2026-07-28
- Graph node: TASK-2
- Command or verification method: Reviewed `app/api/clinic-success/events/route.ts`, `app/lib/clinic-success/config.ts`, and `app/lib/clinic-success/store.ts`; ran four focused Jest suites.
- Result: The Node.js route validates the explicit Technology database target, timestamp, contract version, raw-body HMAC, strict event schema, and event-ID parity before persistence. One transaction inserts the receipt and lifecycle event and increments a UTC aggregate. Identical retries do not increment again; conflicting reuse rolls back. Seventeen focused tests exited 0.
- Exit status: 0
- Remaining uncertainty: The SQL has not run against a database and no valid signed request has been persisted remotely.

## Evidence: Current-source build and local HTTP rejection path succeeded
- Date: 2026-07-28
- Graph node: TASK-2
- Command or verification method: Created `update/clinic-success-receiver` from `origin/main@0654cbe`; ran `npx tsc --noEmit`, focused ESLint, `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 ./node_modules/.bin/next build`, and a local built-server POST with a deliberately invalid signature.
- Result: TypeScript and focused ESLint exited 0. The production build exited 0 and listed dynamic route `/api/clinic-success/events`. The local HTTP request returned 401 `invalid_signature` before any database connection. Build warnings were pre-existing and outside the scoped files.
- Exit status: 0
- Remaining uncertainty: A valid signed request cannot be exercised until matching secrets and the Technology schema/least-privilege credential exist.

## Evidence: Browser confirms receiver host, current deployment source, domain, and Technology database target
- Date: 2026-07-28
- Graph node: OBS-7
- Command or verification method: Reconnected to the current Chrome extension session; read Vercel `main-website` Deployments and Domains plus the open Supabase Migrations page without mutation.
- Result: `main-website` Production is Ready from commit `0654cbe` on `main`; `www.ofroot.technology` is the valid Production domain. Supabase shows `ofroot-tech's Project`, main Production, project reference `mkgycihcekojbvmsexgv`, and no Supabase migration history. The live receiver remains absent until a later authorized release.
- Exit status: 0
- Remaining uncertainty: No Preview receiver deployment, environment configuration, database migration, or live valid-event verification exists.

## Evidence: Referral fragment and initial lifecycle semantics reconciled
- Date: 2026-07-28
- Graph node: TASK-2
- Command or verification method: Updated the referral URL builder and focused tests; ran all four Clinic Success suites, TypeScript, and focused ESLint.
- Result: Referral URLs contain no query string and use `/clinic-referral#referral=<opaque-token>`. Tests verify strict parsing through the fragment. The allowlist tests explicitly accept `clinic_referral.account_created` and `clinic_referral.activated`. Four suites and nineteen tests exited 0; TypeScript and focused ESLint exited 0.
- Exit status: 0
- Remaining uncertainty: Health must implement fragment consumption/clearing and emit the two transitions after its own committed state changes.

## Evidence: Shared secrets are present but the Technology database credential is absent
- Date: 2026-07-28
- Graph node: GATE-1
- Command or verification method: Read-only `vercel env ls production --format json` for `main-website`; public POST to the canonical receiver URL.
- Result: Production contains sensitive `CLINIC_SUCCESS_EVENT_HMAC_SECRET_V1` and `CLINIC_SUCCESS_REFERRAL_SIGNING_SECRET_V1`. It does not contain `CLINIC_SUCCESS_DATABASE_URL`. Existing general `DATABASE_URL` metadata does not prove the dedicated `clinic_success_receiver` role or least privilege. The canonical receiver URL still returns Vercel 404.
- Exit status: 0
- Remaining uncertainty: A least-privilege login/credential, role membership, migration execution/readback, valid-event integration, application publication, and live receiver verification remain absent.

## Evidence: Technology migration and dedicated receiver login verified in Production
- Date: 2026-07-28
- Graph node: GATE-1, TASK-1
- Command or verification method: `supabase migration list --db-url "$DIRECT_URL"`; `supabase db push --dry-run --db-url "$DIRECT_URL"`; authorized `supabase db push --db-url "$DIRECT_URL" --yes`; read-only `psql` catalog, privilege, RLS, and policy queries; dedicated-login connection through the Technology transaction pooler.
- Result: Only migration `20260728121108_clinic_success_foundation.sql` was pending and it now matches the remote Supabase ledger. The private `clinic_success` schema has ten FORCE-RLS tables and six receiver policies. `public`, `anon`, `authenticated`, and `service_role` have no schema or table access. No prohibited Health-bearing column names were found. Login `clinic_success_receiver_login` has no superuser, database-creation, role-creation, replication, or RLS-bypass attributes; it inherits only `clinic_success_receiver`, uses the port-6543 Technology pooler, can access only the receipt/lifecycle/aggregate receiver tables, and cannot select the clinic source table. `CLINIC_SUCCESS_DATABASE_URL` is present as a sensitive Production variable on `main-website`; values were not exposed.
- Exit status: 0
- Remaining uncertainty: Sensitive Vercel values are intentionally redacted from pull-back and therefore require deployed runtime verification.

## Evidence: Scoped release build and real-database idempotency integration passed
- Date: 2026-07-28
- Graph node: TASK-2
- Command or verification method: Four focused Jest suites; `tsc --noEmit`; focused ESLint; isolated `next build`; local built-server POST using a temporary non-Production HMAC key and the dedicated Production receiver login; administrator readback and synthetic-row cleanup.
- Result: Four suites and nineteen tests passed. TypeScript and focused ESLint exited 0. The isolated production build exited 0 and lists dynamic route `/api/clinic-success/events`. A health-free synthetic event returned 202 accepted; an identical retry returned 200 duplicate. Database readback showed one receipt, one lifecycle event, and aggregate count one. All synthetic clinic, referral, receipt, event, and aggregate rows were then removed and absence was verified.
- Exit status: 0
- Remaining uncertainty: The exact Production-sensitive shared key values were not retrieved. Live 401, accepted, duplicate, and database readback remain required after deployment; the accepted/duplicate calls must be emitted by the Health process that owns the matching key.
