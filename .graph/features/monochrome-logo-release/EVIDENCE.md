# Evidence

## Evidence: Scope and provider identity
- Date: 2026-08-09
- Graph node: N1
- Command or verification method: Git status/diff, GitHub repository inspection, Vercel project/deployment inspection, Vercel production environment-name listing.
- Result: The diff is restricted to the logo asset, four visual placements, and the brand guide. Repository `ofroot-tech/ofroot-frontend-application`, branch `main`, Vercel team `ofroot-techs-projects`, project `main-website`, and canonical domain `www.ofroot.technology` are confirmed. Required production API-base configuration exists without exposing its value.
- Exit status: 0
- Remaining uncertainty: The new deployment has not yet been created.

## Evidence: Local implementation checks
- Date: 2026-08-07
- Graph node: N2
- Command or verification method: `xmllint --noout public/ofroot-tech-logo.svg`; unique-color search; `git diff --check`; local desktop and mobile browser verification.
- Result: SVG is valid and transparent, has one foreground color `#20B2AA`, and renders in header, mobile drawer, and footer without viewport overflow at 1440px and 390px.
- Exit status: 0
- Remaining uncertainty: Local runtime evidence is not production evidence.

## Evidence: Publication authorization and rollback
- Date: 2026-08-09
- Graph node: N4
- Command or verification method: User instruction to add the logo to the live production site; `ssh -T git@github-ofroot-tech`; `git push --dry-run`; Vercel canonical deployment inspection.
- Result: Production publication is explicitly authorized, the `ofroot-tech` SSH identity has repository write access, the branch push dry-run succeeds, and the prior production deployment is recorded for rollback.
- Exit status: 0
- Remaining uncertainty: Merge and deployment are pending.

## Evidence: Fresh release validation
- Date: 2026-08-09
- Graph node: N3
- Command or verification method: `git diff --check`; `xmllint --noout public/ofroot-tech-logo.svg`; focused ESLint; `tsc --noEmit`; `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 next build`.
- Result: Diff and SVG checks passed; focused lint reported zero errors and one pre-existing hook dependency warning; TypeScript passed; the Next.js production build compiled, collected page data, and generated 168 of 168 static pages successfully.
- Exit status: 0
- Remaining uncertainty: The local build used webpack because Turbopack rejects the isolated worktree's external dependency symlink. Vercel's exact production build remains a required deployment gate.
