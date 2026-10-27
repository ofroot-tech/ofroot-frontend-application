# Signal operations

The application routes are `/news`, `/news/sources`, and `/news/methodology`. The desktop/mobile structural wireframe is `/news-wireframe.svg`. See `news-hub-plan.md` for the research and product decisions.

## Local verification

Use the existing project dependencies:

```powershell
node node_modules/typescript/bin/tsc --noEmit
node scripts/check-news-ingestion.cjs
node scripts/check-news-cache.cjs
node node_modules/jest/bin/jest.js --runInBand __tests__/news-auth.test.ts __tests__/news-ingestion.test.ts __tests__/news-cache.test.ts
```

The ingestion checker verifies metadata safety and probes the actual approved feeds; its result depends on upstream availability. The cache checker simulates concurrent readers, failures, stale retention, and suppression without requiring a database or live feeds. The Jest suites cover additional regression cases. The check scripts transpile TypeScript only for execution; run the separate TypeScript check too.

If OneDrive has offlined generated build files, an isolated disposable dev output can be used:

```powershell
$env:OFROOT_PREVIEW_DIST_DIR = '.next-news-preview'
node node_modules/next/dist/bin/next dev --turbopack --port 3010
```

This keeps the default `.next` output untouched. It cannot repair offline dependencies: hydrate the installed packages if their files cannot be read. Keep the package versions and lockfile unchanged when restoring dependency files.

## Production setup

Source implementation does not activate hosting or a scheduler. Deploy the existing OfRoot application through its normal release process.

Configure server-only environment variables in the intended deployment environment:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` or `DIRECT_URL` | Postgres connection for the metadata archive. Without it the server has a temporary memory index. Use the appropriate database for this environment. |
| `CRON_SECRET` | Strong random bearer secret for `/api/news/refresh`. Never prefix it with `NEXT_PUBLIC_`. |
| `NEWS_BLOCKED_ARTICLE_IDS` | Optional comma-separated IDs of references to suppress. IDs appear in `/api/news`. Suppression also applies on cached reads. |

The archive adapter creates only the additive `ofroot_news_items` and `ofroot_news_snapshot` tables on the first refresh. Verify connection permissions and inspect `/news/sources` for the actual storage result. A database failure is exposed as a memory fallback; adapter existence does not establish persistence.

Merge the `crons` entry from `news-vercel-cron.example.json` into the project's real `vercel.json` when deploying on a plan that supports a 15-minute schedule. Vercel sends the configured `CRON_SECRET` as the bearer token. Alternatively use a scheduler that can send that header. Keep secrets out of URLs and logs. The protected endpoint accepts GET and POST; missing or incorrect authorization returns 401.

Verify `/api/news` returns metadata with correct source health and `storage: "postgres"`; then inspect at least two scheduled refreshes and their success timestamps. Cache freshness is 15 minutes per server process. A local in-flight guard avoids duplicate work within one instance; larger deployments should add a shared refresh lease and upstream conditional requests before scaling ingestion across many instances.

## Source rights and removals

Only sources with both `enabled: true` and `rights.status: "approved"` are ingested or served. Change `app/lib/news/sources.ts` to pause an entire source. TechCrunch is enabled under its feed-specific terms: complete feed headlines, original links, source/author attribution, no copied bodies or images, and no feed ads. Review those terms before introducing monetization or summaries. The Verge and the currently broken FTC feed remain disabled.

Use `NEWS_BLOCKED_ARTICLE_IDS` for item-level display suppression and redeploy configuration as required by the host. It applies on read and refresh, including records loaded from the archive. Cached HTTP/browser responses can remain until their expiry or next poll; invalidate host caches for urgent requests. Display suppression does not permanently erase an archived row. Handle archival purge, retention, and a rights-change audit trail as explicit operations.

The UI displays a source's supplied publication date separately from fetch health. Date-only agency records retain their calendar date rather than inventing a time or shifting it to the previous Chicago date. Research, reporting, release, policy, and advisory labels describe different evidence types.

## Verification recorded October 27, 2026

TypeScript checking and the direct ingestion/cache checks passed. All eight approved endpoints responded successfully. Enterprise reporting returned a valid feed with no integration-specific matches. Federal Register results are filtered to technology-relevant titles; source search alone also returned unrelated records. The read path removes those older false positives and corrects cached publisher classifications.

The actual component was visually inspected at desktop and 390px mobile widths, with no page overflow. The main Next.js `/news` route also returned HTTP 200 and displayed real metadata. Full application interaction verification is incomplete: the existing Sentry Edge instrumentation repeatedly encounters OneDrive cloud-file timeouts, including an unreadable `@sentry/vercel-edge` metadata path, and interrupts client refreshes. This is a concrete local dependency/environment failure, not a successful production build. A production database connection, scheduled runs, and deployment have not been verified or activated.
