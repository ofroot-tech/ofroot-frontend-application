# Optional native Neon schedule

This function is prepared locally; its presence in the repository does not deploy or activate a schedule. It requires an authenticated Neon account, a supported Neon Functions region, and a deployed function on the production database branch. No Vercel cron secret needs to be copied into its configuration. Neon automatically injects the branch's pooled `DATABASE_URL`.

The handler accepts only scheduled POST invocations carrying Neon's platform-issued `X-Neon-Trigger-Invocation-Id` header. Neon removes client-supplied `X-Neon-*` headers, so this guard must remain behind the Neon Functions runtime. It directly imports the application's existing `refreshNews({ force: true })` implementation, preserving its rights checks, bounded feed requests, deduplication, Postgres archive, source health, and shared refresh lease. The bundle uses Node built-ins and `pg`; no Next.js runtime is imported and no additional application dependency is required.

The wrapper attaches a safe `pg` idle-connection error listener to the shared pool created by the adapter. A persistent Neon Function can otherwise exit when Postgres reclaims an idle connection. The adapter itself is unchanged; the next query opens a replacement connection through the existing pool.

The owner has activated the Neon account. The verified production project is `lingering-morning-05872742` (`ofroot-signal-news`), branch `br-rough-bird-b8lr4umj` (`main`), AWS US East 1, on the Free plan. Deployment requires a Neon project-scoped API key for this Vercel-managed organization. Use a temporary deployment key and revoke it after verification. Keep it out of source, command arguments, and logs. Use `NEON_API_KEY` only in the local deployment process environment. A separate deployment directory is preferable; do not pull environment files over existing application configuration or create another database.

From the repository root with its existing dependencies available, and with that project and branch explicitly selected:

```powershell
neon functions deploy signalnewsrefresh --src functions/signal-news-refresh.ts --project-id lingering-morning-05872742 --branch br-rough-bird-b8lr4umj
neon functions get signalnewsrefresh --project-id lingering-morning-05872742 --branch br-rough-bird-b8lr4umj
```

The CLI uses esbuild to bundle the existing ingestion modules and their dependencies. Wait for the function deployment to report `completed`. In Neon Console, open **Functions**, then the function's menu → **Manage Triggers** → **Create trigger**. Use the name `signal-news-refresh`, function path `/`, Schedule type, UTC cron `7,22,37,52 * * * *`, and enable the trigger. Inspect the function logs for `signal-news-scheduled-check`, its `scheduledAt`, Postgres storage, and a completed result. Verify at least one native scheduled invocation and a later persisted `checkedAt` before claiming activation. An initial every-minute validation schedule can be used briefly, then changed immediately to the production cadence.

The function forces a refresh on each scheduled invocation, so its cadence is independent of the public API's 15-minute cache and CDN. Overlapping deliveries return 202 and the existing Postgres lease prevents concurrent ingestion. A completed persistent refresh returns 200; source or persistence failure returns 503. Logs and responses contain only status/count/timestamps, never article data or upstream error details.

Four invocations per hour allow the Free plan's Postgres compute to suspend between runs. At the minimum 0.25 CU, an estimated five active minutes per invocation uses about 60–62 CU-hours per 30–31-day month, plus the refresh duration itself. This is an estimate, not a guaranteed budget: higher compute autoscaling, visitor traffic, other database activity, or longer idle windows increase usage. Inspect actual compute settings and usage before relying on the 100 CU-hour monthly allowance. A once-per-minute database check would keep compute awake and should not be used as the production schedule.

Functions have separate monthly Free allowances: 10 active Capacity-Hours, 400 waiting Capacity-Hours, and one million invocations per project. The schedule uses roughly 2,880–2,976 invocations a month before retries. Feed and database I/O normally count mostly as waiting time, but actual function CPU time, transfer, and database usage must be measured before declaring the workload permanently free.

Once the native schedule is verified, the blocked GitHub Actions schedule can be disabled to avoid duplicate jobs. Keep Vercel's independent daily cron backup enabled. The native function does not inherit Vercel-only environment configuration: mirror any `NEWS_BLOCKED_ARTICLE_IDS` suppression setting when configured, and do not override the injected `DATABASE_URL` with another application's connection. Deploying an updated website does not update this separate function bundle: redeploy the function whenever `app/lib/news` or its dependencies change.

References: [Neon Functions getting started](https://neon.com/docs/compute/functions/get-started), [scheduled Function Triggers](https://neon.com/docs/compute/functions/triggers/schedule), [deploying functions](https://neon.com/docs/compute/functions/deploy), [Neon plan allowances](https://neon.com/docs/introduction/plans).
