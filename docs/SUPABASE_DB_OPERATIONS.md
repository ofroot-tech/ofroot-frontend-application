# Supabase DB Operations (Production-safe)

This project uses a stable, repeatable DB access pattern for operational checks.

## Standard method (use this first)

Use Supabase REST API with the project `SUPABASE_SERVICE_ROLE_KEY` from Vercel env.

Why this is the default:
- Works from this environment even when direct Postgres connections fail (IPv6/pool connectivity issues).
- No local DB port setup needed.
- Uses the same production env source of truth as deployed app (`vercel env pull`).

## Helper script

Use:

```bash
scripts/supabase_rest_query.sh <table> [select] [filter]
```

Examples:

```bash
# List latest auth users
scripts/supabase_rest_query.sh ofroot_auth_users "id,email,name,created_at" "order=created_at.desc&limit=20"

# Find one user by email
scripts/supabase_rest_query.sh ofroot_auth_users "id,email,name,created_at" "email=eq.communications@ofroot.technology"

# Latest automation leads
scripts/supabase_rest_query.sh ofroot_leads "id,email,source,status,created_at" "source=eq.automation-onboarding&order=created_at.desc&limit=20"
```

Notes:
- Defaults to `production` env. Override with `VERCEL_ENV=preview` or `VERCEL_ENV=development`.
- This script is intended for reads/verification.

## When direct Postgres is acceptable

Direct `pg` connection (`DATABASE_URL`/`DIRECT_URL`) is acceptable only when:
- Network routing is known good.
- You need SQL capabilities not available through REST filters.

In this environment, direct DB has been intermittently unreliable (pool timeout / IPv6 reachability), so do not use it as primary for routine checks.

## MCP recommendation

Yes, set up Supabase MCP for faster schema/table introspection and safer guided workflows.

- MCP is good for interactive exploration and design-time checks.
- Keep the REST script above as fallback for production verification when MCP is unavailable.

## Operational rule for this repo

For DB operations in this project:
1. Start with `scripts/supabase_rest_query.sh`.
2. If blocked by query limitations, use MCP.
3. Use direct Postgres only as last resort.

