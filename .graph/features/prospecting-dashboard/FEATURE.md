# Feature: Prospecting dashboard

## Status
Implemented — action-queue update awaiting production verification

## Objective

Give an authenticated operator one private workspace to import business prospects, rank vertical fit, separate facts from hypotheses, and prepare manual email and call outreach.

## Acceptance criteria

- The route requires the existing server-side dashboard session and redirects unauthenticated users to sign in.
- CSV rows become local browser prospects and are deduplicated by website, email, phone, or business plus market.
- The queue defaults to work due today and separates overdue, upcoming, and unplanned follow-up. Scores use only vertical fit, available contact detail, and verified evidence.
- Email and call drafts are editable by copying into a manual workflow; the application does not send messages or place calls.
- Empty and import-result states accurately distinguish no connected directory from browser-local imports.

## Non-goals

- Connecting a business directory, sending email, placing calls, or storing prospect data remotely.
- Altering existing authentication accounts or credentials.

## Next bounded action

Verify the updated action queue in production with an authenticated session, then record the deployment and rollback commit.

## Last reviewed
2026-09-06
