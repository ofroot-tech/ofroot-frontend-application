# Signal operations

The application routes are `/news`, `/news/sources`, and `/news/methodology`. The desktop/mobile structural wireframe is `/news-wireframe.svg`. See `news-hub-plan.md` for the research and product decisions.

## Local verification

Use the existing project dependencies:

```powershell
node node_modules/typescript/bin/tsc --noEmit
node scripts/check-news-ingestion.cjs
node scripts/check-news-cache.cjs
node scripts/check-news-persistence.cjs
node node_modules/jest/bin/jest.js --runInBand __tests__/news-auth.test.ts __tests__/news-ingestion.test.ts __tests__/news-cache.test.ts __tests__/news-refresh-status.test.ts
```

The ingestion checker verifies metadata safety and probes the actual approved feeds; its result depends on upstream availability. The cache checker simulates concurrent readers, failures, stale retention, and suppression without requiring a database or live feeds. The Jest suites cover additional regression cases. The check scripts transpile TypeScript only for execution; run the separate TypeScript check too.

If OneDrive has offlined generated build files, an isolated disposable dev output can be used:

```powershell
$env:OFROOT_PREVIEW_DIST_DIR = '.next-news-preview'
node node_modules/next/dist/bin/next dev --turbopack --port 3010
```

This keeps the default `.next` output untouched. It cannot repair offline dependencies: hydrate the installed packages if their files cannot be read. Keep the package versions and lockfile unchanged when restoring dependency files.

## Production setup

The release targets Vercel team `ofroot-techs-projects`, project `main-website` (`prj_vYX0oIVtZqkm3iZKyeXgHmgNWaAp`), which owns `www.ofroot.technology`. Do not deploy this source to the unused similarly named `ofroot-frontend-application` Vercel project. The initial release is in [PR #57](https://github.com/ofroot-tech/ofroot-frontend-application/pull/57); the deployed native scheduler source and operating instructions are in [PR #59](https://github.com/ofroot-tech/ofroot-frontend-application/pull/59).

Neon Free database `ofroot-signal-news` is provisioned and connected to `main-website` for Production and Preview with the `NEWS` prefix and Secret settings. The connection provides `NEWS_DATABASE_URL` and `NEWS_DATABASE_URL_UNPOOLED`; connection values stay in Vercel environment settings. Resource metadata:

| Resource | Identifier |
| --- | --- |
| Neon project | `lingering-morning-05872742` |
| Vercel store | `store_ZLqUGxkLc423xhkD` |
| Vercel integration configuration | `icfg_zoDI9ZpZsuw3YG3ifB934NgF` |

The dedicated news connection leaves existing application authentication and its database configuration unchanged. Refresh authentication continues to use the existing `CRON_SECRET` bearer check.

Configure server-only environment variables in the intended deployment environment:

| Variable | Purpose |
| --- | --- |
| `NEWS_DATABASE_URL` | Preferred dedicated Postgres connection for the metadata archive. Falls back to `DATABASE_URL`, `DIRECT_URL`, or `POSTGRES_URL`. Use environment-specific database connections. |
| `CRON_SECRET` | Strong random bearer secret for `/api/news/refresh`. Never prefix it with `NEXT_PUBLIC_`. |
| `NEWS_BLOCKED_ARTICLE_IDS` | Optional comma-separated IDs of references to suppress. IDs appear in `/api/news`. Suppression also applies on cached reads. |

The archive adapter creates only the additive `ofroot_news_items`, `ofroot_news_snapshot`, and `ofroot_news_refresh_leases` tables and an index on the first refresh. Schema initialization uses a transaction advisory lock; an expiring lease coordinates refreshes across server instances. Only newly fetched metadata is upserted, while the active reading index is bounded to 500 records. Verify connection permissions and inspect `/news/sources` for actual storage status. A configured database failure retains available data and fails the scheduled refresh; it is not treated as a successful persistent update.

The primary refresh schedule is an enabled native Neon Function trigger at minutes 7, 22, 37, and 52 every hour (UTC). Function `signalnewsrefresh`, deployment `1`, runs on Node.js 24 with 2048 MiB in project `lingering-morning-05872742`, production branch `br-rough-bird-b8lr4umj` (`main`). Its trigger is `signal-news-refresh` (`trigger-5a691009-6281-484e-87eb-e0ace2dc2a0b`). The function calls the existing ingestion module directly using Neon's injected database connection; it needs no Vercel cron secret. See `functions/signal-news-refresh.md` for its endpoint, deployment procedure, Free allowances, and separate bundle maintenance.

The Vercel team is on Hobby, which permits native cron only once daily. `vercel.json` retains the independent daily 06:00 UTC backup; Vercel sends `CRON_SECRET` as the bearer token, and Hobby has a one-hour execution window. Reader requests also refresh the index after its 15-minute freshness period. Schedule timing is best effort, not an exact delivery guarantee.

`.github/workflows/refresh-news.yml` is retained for manual dispatch only; its automatic schedule is removed to avoid duplicate jobs. GitHub currently prevents its runner from starting because of an account-level billing lock. The existing repository Actions secret `OFROOT_NEWS_CRON_SECRET` matches production Vercel `CRON_SECRET`; neither value is stored in source. The manual workflow sends the bearer token in an HTTPS request header and prints only result metadata. Do not add secrets to URLs or command arguments. The Vercel endpoint accepts GET and POST; incorrect authorization returns 401, a completed refresh returns 200, an overlapping refresh returns 202, and source/persistence failures return 503.

Monitor the Neon trigger's enabled status and function logs, and verify `/api/news` reports `storage: "postgres"` with advancing `checkedAt` and `lastSuccessfulAt` timestamps and healthy sources. Warm instances check the shared snapshot at most every 60 seconds; source freshness is 15 minutes. Website deployment does not update the native function bundle: redeploy it whenever `app/lib/news` or its dependencies change, and mirror `NEWS_BLOCKED_ARTICLE_IDS` when configured. The temporary project-scoped deployment key was revoked: its console entry is absent and a subsequent CLI request was rejected for authentication. Temporary credential files were removed. Scheduled execution uses Neon's runtime database connection and does not require that deployment key.

## Source rights and removals

Only sources with both `enabled: true` and `rights.status: "approved"` are ingested or served. Change `app/lib/news/sources.ts` to pause an entire source. TechCrunch is enabled under its feed-specific terms: complete feed headlines, original links, source/author attribution, no copied bodies or images, and no feed ads. Review those terms before introducing monetization or summaries. The Verge and the currently broken FTC feed remain disabled.

Use `NEWS_BLOCKED_ARTICLE_IDS` for item-level display suppression and redeploy configuration as required by the host. It applies on read and refresh, including records loaded from the archive. Cached HTTP/browser responses can remain until their expiry or next poll; invalidate host caches for urgent requests. Display suppression does not permanently erase an archived row. Handle archival purge, retention, and a rights-change audit trail as explicit operations.

The UI displays a source's supplied publication date separately from fetch health. Date-only agency records retain their calendar date rather than inventing a time or shifting it to the previous Chicago date. Research, reporting, release, policy, and advisory labels describe different evidence types.

## Verification recorded October 27, 2026

TypeScript checking and the direct ingestion/cache checks passed. All eight approved endpoints responded successfully. Enterprise reporting returned a valid feed with no integration-specific matches. Federal Register results are filtered to technology-relevant titles; source search alone also returned unrelated records. The read path removes those older false positives and corrects cached publisher classifications.

The component was visually inspected at desktop and 390px mobile widths with no page overflow. The earlier OneDrive dependency failures were resolved for release by installing the exact lockfile dependencies and building outside OneDrive. The scheduler source branch incorporates main through `fb6f785`, preserving the public-page branding, popup removal, and homepage animation changes from PRs #58 and #60–64.

The production build passes with 190 static pages. Nine focused suites (52 tests) and the persistence/lease harness pass after updating Next.js, Sharp, Sentry, Auth.js packages, Axios, and DOMPurify. Production dependency auditing reports zero critical findings; 14 high findings remain, including Zod/Prisma-related dependency chains whose fixes require separate major-version migrations. Two remaining full-audit critical findings are development-only build/test chains.

PR #57 was merged as `263e3cd58be042c19a32ad0dd39a096bcea91efd`. Its production deployment `dpl_5Zwg8QdAcuyUwwvtRQDsb3XE75bf` reached Ready and released `https://www.ofroot.technology/news`. The newsroom, source and methodology pages, and public API returned HTTP 200. That verification reported `storage: "postgres"`, a completed refresh, 152 references, and eight healthy enabled feeds. A second preview and production both read the same snapshot from the archive, verifying persistence across deployments. Unauthenticated refresh requests returned HTTP 401.

The Vercel Cron Jobs dashboard shows the enabled `/api/news/refresh` job with `0 6 * * *`. Its manual Run action completed a production refresh and advanced both `checkedAt` and `lastSuccessfulAt` from `2026-10-27T16:17:01.978Z` to `2026-10-27T16:26:02.493Z`, preserving 152 references and eight healthy feeds. This verifies the production cron credential and persistence path.

[GitHub workflow run 40540589037](https://github.com/ofroot-tech/ofroot-frontend-application/actions/runs/40540589037) failed before a runner or step started. Its check annotation states: "The job was not started because your account is locked due to a billing issue." GitHub is now only a manual fallback in source; the native Neon trigger supplies the automatic cadence.

Neon function deployment `1` completed successfully. A platform-scheduled invocation at `2026-10-27T20:10:00Z`, using a brief every-minute validation schedule, completed at `20:10:02Z`. Its status-only log reported `ok: true`, live/completed/Postgres storage, 157 references, and `checkedAt` / `lastSuccessfulAt` of `2026-10-27T20:10:01.574Z`. An independent public API request confirmed that persisted snapshot and eight healthy enabled feeds. The trigger was immediately changed to enabled production cron `7,22,37,52 * * * *`, with the next invocation shown as `20:22:00Z`. The native schedule is active; this record distinguishes the verified scheduled invocation from the subsequently configured 15-minute cadence.
