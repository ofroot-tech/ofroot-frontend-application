# Evidence

## Evidence: live redirect destination
- Date: 2026-07-27
- Graph node: N1
- Command or verification method: `curl -sSI https://ofroot.technology`
- Result: HTTP 307 with `location: https://www.ofroot.technology/`.
- Exit status: 0
- Remaining uncertainty: This confirms current live behavior only; it does not identify or protect the Vercel/domain redirect configuration.

## Evidence: repository URL inventory
- Date: 2026-07-27
- Graph node: N1
- Command or verification method: `rg -n -i 'ofroot\\.technology|www\\.ofroot|NEXT_PUBLIC_SITE_URL|SITE_URL|metadataBase|canonical|sitemap|robots' app components`
- Result: Shared URL fallbacks in `app/config/site.ts`, `app/lib/growth-content.ts`, `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts`; hard-coded schema URLs in `app/lib/schemas.ts` and consulting-book metadata.
- Exit status: 0
- Remaining uncertainty: No production deployment is authorized in this feature.

## Evidence: scoped implementation and static contract
- Date: 2026-07-27
- Graph node: N3, N4
- Command or verification method: `node -e "..."` over `app/config/site.ts`, `app/lib/growth-content.ts`, `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/lib/schemas.ts`, and `app/consulting/book/page.tsx`.
- Result: Passed. A single `CANONICAL_SITE_URL` is `https://www.ofroot.technology`; each changed source uses it, and no naked absolute host or `NEXT_PUBLIC_SITE_URL` override remains in those files.
- Exit status: 0
- Remaining uncertainty: This is a static source check, not compiler, test, or build evidence.

## Evidence: local validation dependency gap
- Date: 2026-07-27
- Graph node: N4
- Command or verification method: `test -x node_modules/.bin/{next,jest,tsc}` and `npm run build`.
- Result: No local executable exists for Next.js, Jest, or TypeScript. The build stopped with `sh: next: command not found`; the attempted `npx jest` and `npx tsc` were cancelled after they waited without a local executable.
- Exit status: build 127; focused-test/typecheck attempts 130 after cancellation
- Remaining uncertainty: Install dependencies or run CI to obtain compiler, test, and production-build proof. No manifest or lockfile changes were made.

## Evidence: live redirect unchanged
- Date: 2026-07-27
- Graph node: N4
- Command or verification method: `curl -sSI https://ofroot.technology` and `curl -sSI https://www.ofroot.technology`.
- Result: The naked host still returned HTTP 307 with `location: https://www.ofroot.technology/`; www returned HTTP 200.
- Exit status: 0
- Remaining uncertainty: This verifies existing production routing only. The source change has not been deployed and does not control Vercel/domain redirect settings.

## Evidence: pre-push gate waiver
- Date: 2026-07-27
- Graph node: N4
- Command or verification method: Required grill-me review and explicit user direction.
- Result: Highest unresolved risk is the missing compiler/test/build evidence. Recommended path is CI or a dependency-complete checkout before merge; the user explicitly waived the pre-push gate and authorized publishing without deployment.
- Exit status: not applicable
- Remaining uncertainty: The push cannot prove merge, CI success, deployment, or production behavior.
