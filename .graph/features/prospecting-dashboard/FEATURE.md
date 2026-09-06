# Feature: Prospecting dashboard

## Status
Implemented — authenticated visual verification pending

## Objective

Give an authenticated operator one private workspace to import business prospects, rank vertical fit, separate facts from hypotheses, and prepare manual email and call outreach.

## Acceptance criteria

- The route requires the existing server-side dashboard session and redirects unauthenticated users to sign in.
- CSV rows become local browser prospects and are deduplicated by website, email, phone, or business plus market.
- The queue supports vertical, market, and text filters; scores are derived from fit, contactability, evidence, and an internal hypothesis.
- Email and call drafts are editable by copying into a manual workflow; the application does not send messages or place calls.
- Empty and import-result states accurately distinguish no connected directory from browser-local imports.

## Non-goals

- Connecting a business directory, sending email, placing calls, or storing prospect data remotely.
- Altering existing authentication accounts or credentials.

## Next bounded action

Use a configured authenticated session in Preview to inspect the protected dashboard at desktop and mobile widths, then record the live deployment and rollback commit.

## Last reviewed
2026-09-06
