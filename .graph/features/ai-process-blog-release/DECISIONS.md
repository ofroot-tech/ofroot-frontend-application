# Decisions

## D-3: Release only durable product and feature records
- Date: 2026-08-07
- Decision: Commit the page, article, navigation, analytics, discovery, tests, and durable `.graph/features` records. Exclude screenshots and `.graph-runs` operational artifacts.
- Reason: This preserves reviewable product truth without publishing local validation output or ephemeral execution state.
- Rollback: Revert the single release merge and let Vercel redeploy `main`.

## D-4: Preview before merge; canonical readback after merge
- Date: 2026-08-07
- Decision: Require the Vercel preview to match the branch commit before merging, then require the Ready production deployment to match the merged commit before declaring the site live.
- Reason: Local success and provider success are separate evidence states; neither proves canonical production alone.

## Decision: Publish the article from source
- Date: 2026-08-07
- Status: accepted
- Context: The general blog is backed by an external API, so database publication would require separate credentials and saved-record proof.
- Decision: Add a concrete static route under `/blog`, and surface it on the existing dynamic blog index.
- Evidence: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, and repository deployment architecture.

## Decision: Use reciprocal contextual links
- Date: 2026-08-07
- Status: accepted
- Context: The supporting article should explain the methodology while the service page converts qualified intent.
- Decision: Link the service page to the guide, the guide to the service and booking flow, and adjacent automation pages to the most relevant destination.
- Evidence: User request and current route taxonomy.

## Decision: Publish through GitHub main and linked Vercel production
- Date: 2026-08-07
- Status: accepted
- Context: Vercel project `main-website` is linked to the exact GitHub repository and uses `main` as its production branch.
- Decision: Validate, run grill-me, publish with the `ofroot-tech` GitHub profile, merge to `main`, wait for the matching Vercel deployment, and verify canonical routes.
- Evidence: Vercel project API and GitHub repository inspection.
