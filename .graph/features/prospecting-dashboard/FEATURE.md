# Feature: Prospecting dashboard

## Status
Refresh repair validated; release pending

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
- An authenticated operator can import a bounded batch of current Harris County A/C contractor licenses from Texas TDLR in one click.
- TDLR imports preserve license evidence and source recency, exclude expired records, and never imply that a contact route has been found.

## Non-goals

- Paid contact enrichment, automated sending or calling, and remote prospect persistence.
- Altering existing authentication accounts or credentials.

## Next bounded action

Connect a governed website and contact-enrichment provider for the highest-priority licensed businesses; enrich only a bounded batch and preserve field-level provenance.

## Last reviewed
2026-09-07
