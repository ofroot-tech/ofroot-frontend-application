# Decisions

## Decision: Use the existing Git-to-Vercel production path
- Date: 2026-08-09
- Status: accepted
- Context: The canonical site is owned by Vercel project `main-website`; its production domain is `www.ofroot.technology`, and its production environment contains `NEXT_PUBLIC_API_BASE_URL`.
- Decision: Commit the isolated branch, merge a scoped PR to `main`, wait for the matching Vercel production deployment, and verify the canonical host.
- Evidence: Vercel project inspection, deployment inspection, environment-name listing, GitHub repository inspection, and SSH write-identity check.

## Decision: Keep rollback explicit
- Date: 2026-08-09
- Status: accepted
- Context: A public navigation logo is high visibility even though the code change is small.
- Decision: Retain the prior production deployment ID `dpl_2GKbiReM6D2MA1eC9ViK4ufzStGY` as the immediate provider rollback target; Git revert remains the source rollback.
- Evidence: Vercel inspection of the canonical production alias before publication.
