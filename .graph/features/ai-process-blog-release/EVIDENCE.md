# Evidence

## E-1: Repository and provider boundary
- Date: 2026-08-07
- Graph node: N1
- Command or verification method: Git remote/status, GitHub repository inspection, Vercel project inspection, and Vercel project API readback.
- Result: Repository is `ofroot-tech/ofroot-frontend-application`; Vercel project is `ofroot-tech/main-website`; production branch is `main`; canonical alias is `www.ofroot.technology`.
- Exit status: 0
- Remaining uncertainty: No publication or new deployment has occurred.

## E-2: Blog architecture and release design
- Date: 2026-08-07
- Graph node: N2
- Command or verification method: Focused inspection of blog index/detail, static Insights model, sitemap, llms.txt, AI Process page, and deployment documentation.
- Result: A source-controlled static blog route plus featured index card is the smallest reproducible approach and avoids an unverified database write.
- Exit status: 0
- Remaining uncertainty: Implementation and runtime quality remain to be validated.

## E-3: Article and reciprocal-link implementation
- Date: 2026-08-07
- Graph node: N3
- Command or verification method: Source review plus focused Jest contract suite.
- Result: Added the source-controlled article, resilient featured blog index, AI Process and automation backlinks, sitemap and llms.txt entries, metadata, structured data, and attributed audit links. The focused 12-test suite passed.
- Exit status: 0
- Remaining uncertainty: No publication has occurred.

## E-4: Combined release validation
- Date: 2026-08-07
- Graph node: N4
- Command or verification method: Full Jest suite, TypeScript, Next lint, cache-disabled production build, production-server HTTP checks, canonical/link extraction, and desktop/mobile browser screenshots.
- Result: 20 suites and 83 tests passed; TypeScript passed; lint passed with five pre-existing warnings; the production build generated 168 pages; every release route returned HTTP 200; the protected dashboard returned the expected login redirect; canonical metadata, discovery entries, and reciprocal links were rendered; desktop and mobile layouts showed no clipping or broken composition.
- Exit status: 0
- Remaining uncertainty: Provider preview and canonical production remain unverified until publication.

## E-5: Pre-push grill-me gate
- Date: 2026-08-07
- Graph node: N5
- Command or verification method: Exact status/diff review, clean diff check, release-boundary review, deployment-path review, and rollback analysis.
- Result: Gate resolved. The release will include only product source, focused tests, and durable feature records; screenshots and per-run artifacts are excluded. Preview commit matching is required before merge, and merged-commit matching plus canonical readback is required afterward. Rollback is a single merge revert followed by the normal Vercel deployment.
- Exit status: 0
- Remaining uncertainty: Preview and production verification are necessarily pending publication.

## E-6: GitHub publication and protected preview
- Date: 2026-08-07
- Graph node: N6
- Command or verification method: GitHub PR/status readback, Vercel deployment API, authenticated preview requests, and merge readback.
- Result: Commit `911b158cba443cd65f51be71231444a2b12121c8` passed GitGuardian and Vercel checks. The protected preview returned application HTTP 200 for the page, blog index, article, sitemap, and llms.txt, with expected headings, metadata, links, and discovery entries. PR #17 merged as `98e52a83dc4f1d937090fa111f2fae993f1058e8`.
- Exit status: 0
- Remaining uncertainty: Production deployment was still pending at merge time.

## E-7: Matching production deployment and canonical readback
- Date: 2026-08-07
- Graph node: N7
- Command or verification method: Vercel deployment/alias API readback, direct no-cache HTTPS requests, semantic HTML checks, and Chrome desktop/mobile screenshots.
- Result: Production deployment `dpl_9JQEpe7XXcLEf1GepcDKVeMe9kx7` reached Ready for exact merge commit `98e52a83dc4f1d937090fa111f2fae993f1058e8`, with `www.ofroot.technology` and `ofroot.technology` attached. Canonical page, blog, article, automations, Automation Systems, sitemap, and llms.txt returned HTTP 200. Expected headings, canonical metadata, contextual backlinks, and discovery entries were present. The dashboard route returned the expected login redirect. Desktop and mobile canonical screenshots showed no broken layout.
- Exit status: 0
- Remaining uncertainty: Authenticated dashboard-persona interaction was not exercised because no test credential was required or supplied; its access boundary was verified unauthenticated.

## E-8: Security cleanup and terminal reconciliation
- Date: 2026-08-07
- Graph node: N8
- Command or verification method: Vercel project readback, targeted bypass revocation, bounded Graph Loop cleanup, and deterministic consistency checker.
- Result: The preview helper initially auto-linked the isolated worktree to the wrong Vercel project and created one temporary automation bypass. That exact bypass was revoked and read back absent. The correct `main-website` preview bypass was also revoked after use and read back absent. No bypass secret was retained. Post-publish cleanup completed with zero bytes reclaimed, and the final graph consistency check passed without issues.
- Exit status: 0
- Remaining uncertainty: None for the requested release scope.
