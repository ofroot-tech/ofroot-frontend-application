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
