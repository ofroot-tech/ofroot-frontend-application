# Decisions

## Decision: use the observed www redirect destination as the canonical host
- Date: 2026-07-27
- Status: accepted
- Context: `https://ofroot.technology` returned HTTP 307 to `https://www.ofroot.technology/`, while repository-generated canonical URLs used the naked host.
- Decision: Define `https://www.ofroot.technology` once in `app/config/site.ts` and consume it for site metadata, SEO route generation, and schema helpers.
- Evidence: Live header check and focused repository search captured in E-1 and E-2.

## Decision: do not implement redirects in application code
- Date: 2026-07-27
- Status: accepted
- Context: The live redirect already exists and domain redirect behavior is deployment/infrastructure owned.
- Decision: Preserve current redirect behavior; report that its continued ownership must be verified in Vercel/domain settings after deployment.
- Evidence: E-1.

## Decision: publish with blocked local build validation
- Date: 2026-07-27
- Status: accepted with explicit user waiver
- Context: The canonical-host source contract, diff check, and Graph consistency check passed, but Jest, TypeScript, and the production build could not run because local executables are absent.
- Decision: The user explicitly requested “publish, bypass gate.” Create an isolated branch, commit, and push without a deployment. CI or a dependency-complete checkout must still run the blocked validations before merge or production release.
- Evidence: E-4 and user authorization.
