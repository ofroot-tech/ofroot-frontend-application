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

The release targets Vercel team `ofroot-techs-projects`, project `main-website` (`prj_vYX0oIVtZqkm3iZKyeXgHmgNWaAp`), which owns `www.ofroot.technology`. Do not deploy this source to the unused similarly named `ofroot-frontend-application` Vercel project. Release source and review are in [PR #57](https://github.com/ofroot-tech/ofroot-frontend-application/pull/57).

Configure server-only environment variables in the intended deployment environment:

| Variable | Purpose |
| --- | --- |
| `NEWS_DATABASE_URL` | Preferred dedicated Postgres connection for the metadata archive. Falls back to `DATABASE_URL`, `DIRECT_URL`, or `POSTGRES_URL`. Use environment-specific database connections. |
| `CRON_SECRET` | Strong random bearer secret for `/api/news/refresh`. Never prefix it with `NEXT_PUBLIC_`. |
| `NEWS_BLOCKED_ARTICLE_IDS` | Optional comma-separated IDs of references to suppress. IDs appear in `/api/news`. Suppression also applies on cached reads. |

The archive adapter creates only the additive `ofroot_news_items`, `ofroot_news_snapshot`, and `ofroot_news_refresh_leases` tables and an index on the first refresh. Schema initialization uses a transaction advisory lock; an expiring lease coordinates refreshes across server instances. Only newly fetched metadata is upserted, while the active reading index is bounded to 500 records. Verify connection permissions and inspect `/news/sources` for actual storage status. A configured database failure retains available data and fails the scheduled refresh; it is not treated as a successful persistent update.

The Vercel team is on Hobby, which permits native cron only once daily. The actual `vercel.json` configures a daily 06:00 UTC backup; Vercel sends `CRON_SECRET` as the bearer token. The primary 15-minute schedule is `.github/workflows/refresh-news.yml`, running at minutes 7, 22, 37, and 52 on a standard GitHub-hosted runner. The repository is public, so standard runner usage is free under GitHub's current billing rules. Schedule timing is best effort, not an exact delivery guarantee.

Set the repository Actions secret `OFROOT_NEWS_CRON_SECRET` to the same production-only value as Vercel `CRON_SECRET`; both were configured during release preparation without storing the value in source. The workflow sends the bearer token in an HTTPS request header and prints only result metadata. Do not add secrets to URLs or command arguments. The endpoint accepts GET and POST; incorrect authorization returns 401, a completed refresh returns 200, an overlapping refresh returns 202, and source/persistence failures return 503.

Verify `/api/news` returns correct source health and `storage: "postgres"`; then inspect a manual workflow dispatch and a scheduled run with distinct success timestamps. Warm instances check the shared snapshot at most every 60 seconds; source freshness is 15 minutes. GitHub only schedules workflows from the default branch and may disable scheduled workflows in public repositories after 60 days without repository activity. Keep that status visible operationally; the independent daily Vercel backup continues to provide unattended refreshes.

## Source rights and removals

Only sources with both `enabled: true` and `rights.status: "approved"` are ingested or served. Change `app/lib/news/sources.ts` to pause an entire source. TechCrunch is enabled under its feed-specific terms: complete feed headlines, original links, source/author attribution, no copied bodies or images, and no feed ads. Review those terms before introducing monetization or summaries. The Verge and the currently broken FTC feed remain disabled.

Use `NEWS_BLOCKED_ARTICLE_IDS` for item-level display suppression and redeploy configuration as required by the host. It applies on read and refresh, including records loaded from the archive. Cached HTTP/browser responses can remain until their expiry or next poll; invalidate host caches for urgent requests. Display suppression does not permanently erase an archived row. Handle archival purge, retention, and a rights-change audit trail as explicit operations.

The UI displays a source's supplied publication date separately from fetch health. Date-only agency records retain their calendar date rather than inventing a time or shifting it to the previous Chicago date. Research, reporting, release, policy, and advisory labels describe different evidence types.

## Verification recorded October 27, 2026

TypeScript checking and the direct ingestion/cache checks passed. All eight approved endpoints responded successfully. Enterprise reporting returned a valid feed with no integration-specific matches. Federal Register results are filtered to technology-relevant titles; source search alone also returned unrelated records. The read path removes those older false positives and corrects cached publisher classifications.

The component was visually inspected at desktop and 390px mobile widths with no page overflow. The earlier OneDrive dependency failures were resolved for release by installing the exact lockfile dependencies and building outside OneDrive. The final source preserves production branding through main commit `4eba8b7`.

The production build passes with 190 static pages. Nine focused suites (52 tests) and the persistence/lease harness pass after updating Next.js, Sharp, Sentry, Auth.js packages, Axios, and DOMPurify. Production dependency auditing reports zero critical findings; 14 high findings remain, including Zod/Prisma-related dependency chains whose fixes require separate major-version migrations. Two remaining full-audit critical findings are development-only build/test chains.

A Vercel preview deployment is available and returns HTTP 200. At this verification stage its news response reports configured persistence unavailable, correctly displaying no fabricated stories. Dedicated Neon provisioning is waiting for the account owner to accept the provider terms. Production promotion, database-backed refresh verification, and scheduled-run verification remain pending until that setup completes.
