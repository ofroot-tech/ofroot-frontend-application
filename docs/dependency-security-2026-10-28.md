# Dependency security maintenance — October 28, 2026

The fresh npm audit baseline reported 35 affected package entries: two critical, 18 high, six moderate, and nine low. This release removes the affected unused ORM stack, upgrades the active validation library, and resolves compatible transitive fixes in both lockfiles. It does not change database schemas or authentication configuration.

## Remediation

| Area | Change |
| --- | --- |
| Validation | Zod 3.25.76 → 4.6.7; explicit record key schemas and bounded onboarding collections. Regression tests preserve normal payloads, defaults, and field errors. |
| Unused dependencies | Remove `prisma`, `@prisma/client`, `@auth/prisma-adapter`, and `next-auth`; tracked application code has no imports of these packages. Preserve schema/migration reference files and the existing `NEXTAUTH_SECRET` used directly for report signatures. |
| p5 / test transformer | p5 2.0.5 → 2.3.4 uses patched Zod; ts-jest 29.4.4 → 29.4.15 raises the Handlebars dependency floor. |
| Critical development chains | Handlebars 4.7.8 → 4.7.10 and tar 7.4.3 → 7.5.22. |
| CSS processing | Resolve PostCSS 8.5.32, including Next.js's pinned nested copy through a scoped override. Keep the existing Next.js 15.5.28 release. |
| Other transitive fixes | Update the compatible Babel, filesystem, glob matching, YAML, archive, source map, ID generation, Lodash, Moment, query string, and WebSocket dependencies recorded in the lockfiles. |

## Unreleased deepmerge fix

The remaining low-severity [deepmerge advisory](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) has no patched upstream release at the time of this work. Jest's suggested downgrade is not used. Instead, `vendor/deepmerge` contains the integrity-verified 4.3.1 distribution with a narrowly documented source backport: all three object-copy assignments write `__proto__` as an own data property instead of invoking its legacy setter. The original version, MIT license, types, and provenance are retained.

The backport is installed from a local packaged archive to avoid directory-link failures in clean Windows installs. Its upstream package name and version remain unchanged, so registry audits still associate it and Jest's dependent packages with the single low-severity advisory. This is recorded rather than suppressed or represented as an upstream release fix. `npm run test:dependency-security` follows Jest's actual dependency resolution, checks that its installed implementation matches the reviewed source bytes, and tests the reported poisoning cases plus normal merge behavior. The original unpatched package fails the first security regression; the backport passes all 16 provenance/security/compatibility checks and all 117 assertions from the upstream 4.3.1 JavaScript test suite. Remove the backport when an adequate maintained upstream release is available. See `vendor/deepmerge/README.md` for its source and maintenance instructions.

## Validation

- npm production-only audit reports zero findings. Full npm audit retains seven low-severity package labels; pnpm reports one low-severity advisory. Both refer only to the upstream deepmerge signature and its Jest dependency chain; the installed source is patched and independently verified as described above. Critical, high, and moderate findings are resolved.
- Cold npm 10 and npm 12 installations, actual Jest resolution, and pnpm frozen-lockfile validation pass with the packaged backport.
- Production build passes, generating 189 static pages; changed-file lint passes with no warnings or errors.
- The complete Jest suite passes: 36 suites, 186 tests. A pre-existing blog-page CSS-module test setup was corrected without replacing rendered components or content assertions.
- News cache checks, persistence/lease/archive failure checks, and live ingestion checks pass; all eight approved feeds are healthy.

The isolated local build uses the documented local `NEXT_PUBLIC_API_BASE_URL` setting, without copying production credentials. Vercel builds use the existing project configuration. Existing unrelated lint/deprecation warnings remain outside the dependency security changes.

The reviewed local archive is `vendor/deepmerge-4.3.1.tgz`, with integrity `sha512-HDm6sEExY6Pu09bEKnYfX6DccEj1YzaFdt0yyHCnVLNvXpGU/xnDx8EQ/JDqo9NzCMfiHi22JTyTL5jXsCJlqA==`. It is explicitly included in Vercel source uploads. Source text is pinned to LF so the installed-byte provenance check remains portable across Windows and Linux.

## News scheduler compatibility

Neither the ingestion source nor the native Neon handler changes. All 14 packages in the `pg` dependency closure retain the same versions and integrity hashes as the deployed scheduler bundle. A Neon redeployment or new deployment key is unnecessary. The existing 15-minute native schedule and daily Vercel backup remain configured.
