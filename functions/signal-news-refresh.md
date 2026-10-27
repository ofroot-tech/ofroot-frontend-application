# Native Neon schedule

The native scheduler is deployed and active on the production database branch. No Vercel cron secret is copied into its configuration. Neon automatically injects the branch's pooled `DATABASE_URL`. Keeping this source in the repository does not automatically deploy later source changes.

| Resource | Active value |
| --- | --- |
| Project | `lingering-morning-05872742` (`ofroot-signal-news`) |
| Branch | `br-rough-bird-b8lr4umj` (`main`), AWS US East 1 |
| Function / deployment | `signalnewsrefresh` / `1` |
| Runtime | Node.js 24, 2048 MiB |
| Trigger | `signal-news-refresh`, `trigger-5a691009-6281-484e-87eb-e0ace2dc2a0b` |
| Schedule | Enabled, `7,22,37,52 * * * *` (UTC) |
| Endpoint | `https://br-rough-bird-b8lr4umj-signalnewsrefresh.compute.c-14.us-east-1.aws.neon.tech/` |

A native platform invocation scheduled at `2026-10-27T20:10:00Z` completed at `20:10:02Z` during a brief every-minute validation schedule. Its safe log reported `ok: true`, live/completed/Postgres storage, 157 references, and `checkedAt` / `lastSuccessfulAt` of `2026-10-27T20:10:01.574Z`. An independent public API request confirmed the new persisted snapshot and eight healthy enabled feeds. The trigger was immediately changed to the production 15-minute cadence above, with its next invocation shown as `20:22:00Z`.

The handler accepts only scheduled POST invocations carrying Neon's platform-issued `X-Neon-Trigger-Invocation-Id` header. Neon removes client-supplied `X-Neon-*` headers, so this guard must remain behind the Neon Functions runtime. It directly imports the application's existing `refreshNews({ force: true })` implementation, preserving its rights checks, bounded feed requests, deduplication, Postgres archive, source health, and shared refresh lease. The bundle uses Node built-ins and `pg`; no Next.js runtime is imported and no additional application dependency is required.

The wrapper attaches a safe `pg` idle-connection error listener to the shared pool created by the adapter. A persistent Neon Function can otherwise exit when Postgres reclaims an idle connection. The adapter itself is unchanged; the next query opens a replacement connection through the existing pool.

The owner has activated the Neon account, and the project remains on the Free plan. Deployment used an approved temporary project-scoped API key for this Vercel-managed organization. That key was revoked: its console entry is absent and a subsequent CLI request was rejected for authentication. Temporary credential files were removed. The scheduler uses Neon's runtime database connection and continues without the deployment API key. Future maintenance deployments use a new temporary project-scoped key, revoked after verification. Keep it out of source, command arguments, and logs. Use `NEON_API_KEY` only in the local deployment process environment. A separate deployment directory is preferable; do not pull environment files over existing application configuration or create another database.

From the repository root with its existing dependencies available, and with that project and branch explicitly selected:

```powershell
neon functions deploy signalnewsrefresh --src functions/signal-news-refresh.ts --project-id lingering-morning-05872742 --branch br-rough-bird-b8lr4umj
neon functions get signalnewsrefresh --project-id lingering-morning-05872742 --branch br-rough-bird-b8lr4umj
```

The CLI uses esbuild to bundle the existing ingestion modules and their dependencies. Wait for the function deployment to report `completed`. In Neon Console, open **Functions**, then the function's menu → **Manage Triggers** → **Create trigger**. Use the name `signal-news-refresh`, function path `/`, Schedule type, UTC cron `7,22,37,52 * * * *`, and enable the trigger. Inspect the function logs for `signal-news-scheduled-check`, its `scheduledAt`, Postgres storage, and a completed result. Verify at least one native scheduled invocation and a later persisted `checkedAt` before claiming activation. An initial every-minute validation schedule can be used briefly, then changed immediately to the production cadence.

The function forces a refresh on each scheduled invocation, so its cadence is independent of the public API's 15-minute cache and CDN. Overlapping deliveries return 202 and the existing Postgres lease prevents concurrent ingestion. A completed persistent refresh returns 200; source or persistence failure returns 503. Logs and responses contain only status/count/timestamps, never article data or upstream error details.

Four invocations per hour allow the Free plan's Postgres compute to suspend between runs. At the minimum 0.25 CU, an estimated five active minutes per invocation uses about 60–62 CU-hours per 30–31-day month, plus the refresh duration itself. This is an estimate, not a guaranteed budget: higher compute autoscaling, visitor traffic, other database activity, or longer idle windows increase usage. Inspect actual compute settings and usage before relying on the 100 CU-hour monthly allowance. A once-per-minute database check would keep compute awake and should not be used as the production schedule.

Functions have separate monthly Free allowances: 10 active Capacity-Hours, 400 waiting Capacity-Hours, and one million invocations per project. The schedule uses roughly 2,880–2,976 invocations a month before retries. Feed and database I/O normally count mostly as waiting time, but actual function CPU time, transfer, and database usage must be measured before declaring the workload permanently free.

The blocked GitHub Actions workflow is retained for manual dispatch only; its automatic schedule is removed in source to avoid duplicate jobs. Vercel's independent daily cron backup remains enabled. The native function does not inherit Vercel-only environment configuration: mirror any `NEWS_BLOCKED_ARTICLE_IDS` suppression setting when configured, and do not override the injected `DATABASE_URL` with another application's connection. Deploying an updated website does not update this separate function bundle: redeploy the function whenever `app/lib/news` or its dependencies change.

References: [Neon Functions getting started](https://neon.com/docs/compute/functions/get-started), [scheduled Function Triggers](https://neon.com/docs/compute/functions/triggers/schedule), [deploying functions](https://neon.com/docs/compute/functions/deploy), [Neon plan allowances](https://neon.com/docs/introduction/plans).
