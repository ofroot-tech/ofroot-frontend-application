# Payroll Frontend Implementation Plan

This document outlines the MVP scope for exposing the new payroll/time APIs inside the Next.js dashboard.

## Goals

- Provide operations and HR admins with a unified payroll workspace under `/dashboard/payroll`.
- Surface the new Laravel endpoints (schedules, runs, time entries, time off) with clear tenant scoping.
- Support creation of pay schedules and draft payroll runs plus approval of time entries.
- Establish reusable UI patterns (cards, tables, drawers) that satisfy the PRD’s trust/efficiency/professionalism qualities.

## Initial Scope (Sprint 1)

1. **Navigation & Layout**
   - Add “Payroll” nav item (CurrencyDollar icon) under the authenticated dashboard menu.
   - Create `app/dashboard/payroll/layout.tsx` for shared shell, tenant switcher, and page tabs (Overview, Time, Settings).

2. **Overview Page** (`/dashboard/payroll`)
   - Tenant selector (dropdown) to scope API calls.
   - Metric cards: active employees (placeholder), draft payroll total, pending approvals.
   - Tables:
     - Pay Schedules list with status badge.
     - Recent Payroll Runs (status pill, period, total gross).
   - Primary CTA: “Run Payroll” (opens drawer to create draft run).

3. **Time View** (`/dashboard/payroll/time`)
   - Tabs for “Time Entries” and “Time Off”.
   - Table showing entries with approve/reject buttons.
   - Basic filters: status, date range (future enhancement); initial version uses status select + search.

4. **Forms & Actions**
   - Server actions for creating pay schedules, creating payroll runs, approving/rejecting time entries, deciding time off.
   - Inline validation + friendly error banners.

5. **API Client Enhancements**
   - Types: `PaySchedule`, `PayrollRun`, `PayrollRunEntry`, `TimeEntry`, `TimeOffRequest`.
   - Methods for listing/creating resources and advancing workflow steps.

6. **Styling Alignment**
   - Introduce theme tokens mirroring PRD palette (deep blue, teal accent) scoped to payroll layout via CSS variables.
   - Ensure typography hierarchy (Inter, weights/sizes) matches spec for page titles/cards/tables.

## Future Enhancements (Sprint 2+)

- Employee roster/compensation editor integrated with payroll.
- Benefits management UI (plans, enrollment, deductions).
- Reporting dashboard with exportable visuals.
- White-label settings (logo upload, color picker) that propagate through dashboard shell.
- Mobile-first responsive refinements.

## Dependencies

- Backend payroll API (completed).
- Tenant list endpoint (already present) for dropdown population.
- Auth cookie access for server actions.

## Risks & Mitigations

- **Large payloads**: use pagination and `Suspense` boundaries to keep UI snappy.
- **Role enforcement**: rely on backend middleware; show inline error if forbidden.
- **Missing employee data**: until dedicated employee module ships, display employee IDs and allow CSV export for clarity.

## Acceptance Criteria

- Navigating to `/dashboard/payroll` renders without console errors.
- Creating a pay schedule via UI results in persisted record (verified by API response and refreshed table).
- Draft payroll run creation triggers auto-hydration summary and surfaces in runs table.
- Approving a time entry updates status immediately after action completes.
- All new pages pass `npm test` (existing suites) and `npm run build`.
