# Feature: Prospecting dashboard

## Status
Released and verified in production

## Objective

Give an authenticated operator one private workspace to import business prospects, rank vertical fit, separate facts from hypotheses, and prepare manual email and call outreach.

## Acceptance criteria

- The route requires the existing server-side dashboard session and redirects unauthenticated users to sign in.
- CSV rows become local browser prospects and are deduplicated by website, email, phone, or business plus market.
- The queue defaults to work due today and separates overdue, upcoming, and unplanned follow-up. Scores use only vertical fit, available contact detail, and verified evidence.
- Email and call drafts are editable by copying into a manual workflow; the application does not send messages or place calls.
- Empty and import-result states accurately distinguish no connected directory from browser-local imports.
- The default worklist shows at most five actionable prospects, ordered by urgency and score, while future follow-ups and stopped prospects stay out of the immediate queue.
- Email, phone, and website routes are directly actionable, and common outcomes update contact state and advance the worklist in one click.

## Non-goals

- Connecting a business directory, sending email, placing calls, or storing prospect data remotely.
- Altering existing authentication accounts or credentials.

## Next bounded action

Connect one governed business-discovery source behind a saved targeting profile without weakening evidence labels or stop rules.

## Last reviewed
2026-09-07
