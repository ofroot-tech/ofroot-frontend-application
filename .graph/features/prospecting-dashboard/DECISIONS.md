# Decisions

## Decision: Reuse dashboard session authentication
- Date: 2026-09-06
- Status: accepted
- Context: The application already authenticates `/dashboard` routes with an httpOnly server session.
- Decision: Protect `/dashboard/prospecting` with that session and redirect to `/auth/login` when absent or invalid. Do not add a second password store or source-controlled credentials.
- Evidence: `app/api/auth/login/route.ts`, `app/lib/cookies.ts`, and existing dashboard routes.

## Decision: Start with browser-local CSV ingestion
- Date: 2026-09-06
- Status: accepted
- Context: Existing CRM import supports CSV, HubSpot, Facebook, and other exports, but no verified business-directory connector exists in this checkout.
- Decision: Import and deduplicate CSV prospects only in the browser. The UI says that no directory is connected.
- Evidence: `app/dashboard/crm/workflows/ImportLeadsPanel.tsx` and source inspection.

## Decision: Keep hypotheses out of claims
- Date: 2026-09-06
- Status: accepted
- Context: A prospect's likely need is not a verified fact.
- Decision: Present verified facts and internal inferences in separate editable fields. The default outreach copy uses verified facts only.
- Evidence: `app/dashboard/prospecting/prospecting-utils.ts`.


## Decision: Make follow-up and scoring operationally truthful
- Date: 2026-09-06
- Status: accepted
- Context: A ranked list without a due action is not a daily execution queue, and an inferred need is a hypothesis rather than evidence.
- Decision: Track each prospect's next step, due date, last contact date, and outcome in browser-local state. Default the queue to work due today. Score only target vertical, available contact detail, and verified facts; preserve the internal inference solely as a research prompt.
- Evidence: `app/dashboard/prospecting/ProspectingDesk.tsx`, `app/dashboard/prospecting/prospecting-utils.ts`, and `__tests__/prospecting-utils.test.ts`.

## Decision: Preserve contact context and browser-local recovery
- Date: 2026-09-06
- Status: accepted
- Decision: Import and edit contact name/title fields, use a known first name in copy, show per-source recency and reachable counts, and allow a local JSON export. No provider data is claimed or transmitted.

## Decision: Center the dashboard on five immediate conversations
- Date: 2026-09-07
- Status: accepted
- Context: The prior default could show an empty due-today queue after a successful import and required several manual fields to close one outreach attempt.
- Decision: Default to a five-prospect worklist ordered by overdue, due-today, and unscheduled priority. Exclude future follow-ups, not-a-fit records, and do-not-contact records from immediate work. Keep complete queue filters available.
- Evidence: Authenticated local browser verification with six synthetic prospects.

## Decision: Convert common outcomes into deterministic follow-up state
- Date: 2026-09-07
- Status: accepted
- Context: Requiring status, outcome, last-contact date, next action, and due date separately slows a short outreach session.
- Decision: One-click outcomes set contacted state and last-contact date. No answer schedules two business days, interested schedules the next business day, and stop outcomes clear follow-up and leave the worklist. Direct email, telephone, and website links remain manual operator actions.
- Evidence: `app/dashboard/prospecting/ProspectingDesk.tsx` and authenticated local runtime verification.
