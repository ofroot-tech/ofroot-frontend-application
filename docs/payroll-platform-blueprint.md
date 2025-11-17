# Ofroot Payroll Platform Blueprint

A product brief and technical plan for delivering a Gusto-like payroll, benefits, and HR experience inside the Ofroot stack (Laravel API + Next.js dashboard).

---

## 1. Product vision & experience pillars

| Pillar | What it means inside Ofroot |
| --- | --- |
| **Trustworthy** | Every surface communicates financial accuracy: deterministic calculations, explicit audit logs, inline explanations for taxes/deductions, consistent typography/colors. |
| **Efficient** | Multi-step flows collapse into wizard-like dialogs with autosave, keyboard shortcuts, and smart defaults (pay period detection, bulk edits, reusable templates). |
| **Professional** | Layouts mirror enterprise finance tools: dense tables, KPIs, restrained motion, Inter type scale, complementary blue/teal palette, persistent branding controls. |

Primary personas & access levels:

- **Owner/Admin** – full control over payroll, benefits, branding, reports.
- **Payroll/HR manager** – manage employees, run payroll, approve time/benefits.
- **People manager** – approve time off, view team data only.
- **Employee self-serve** – view pay stubs, submit time, manage benefits.

---

## 2. Core modules & flows

1. **Employee Management**
   - Single source of truth for identity, job details, compensation, bank/tax data, employment status, docs.
   - Flow: Dashboard → Employee List → Add/Edit Drawer → Save → optimistic update + toast.
   - Supports lifecycle changes (activation, termination, rehire) with effective dates.

2. **Payroll Processing**
   - Pay schedules (weekly/biweekly/semi-monthly/monthly), per-tenant calendar.
   - Run payroll wizard: select period → preview employees/hours → adjust earnings/deductions → calculate taxes → approvals (dual control optional) → disbursement + pay stub generation.
   - Stores immutable `PayrollRun` records with audit trail.

3. **Time & Attendance**
   - Time entries (clock in/out or manual), PTO balances, approval queue.
   - Manager views include calendar heatmap and anomaly alerts (missing punches, overtime).
   - Approved hours automatically hydrate payroll preview.

4. **Benefits Administration**
   - Catalog of benefit plans (health, dental, 401k, stipends) with employer/employee contribution rules.
   - Enrollment workflows, eligibility logic, deduction sync into payroll, carrier export files.

5. **Reporting & Analytics**
   - Metrics: total payroll, taxes, headcount, PTO usage.
   - On-demand reports (CSV/PDF) with saved filters, scheduled deliveries, audit snapshots.

6. **Company Branding & Theme**
   - Settings → Company: upload logo, set brand colors (primary, accent), typography (Inter variants) with live preview.
   - CSS variables propagate across dashboard; white-label header + emails.

Edge cases baked into module requirements (empty states, conflicting edits, zero-hours employees, role-based restrictions, period rollover, etc.).

---

## 3. Backend (Laravel) architecture plan

### 3.1 Domain model overview

| Model | Key fields | Notes |
| --- | --- | --- |
| `companies` | name, slug, logo_url, primary_color, accent_color, font_choice | Tenant-level branding + settings |
| `employees` | user_id, company_id, personal info, status, hire/term dates | Denormalized snapshot for payroll |
| `compensation_profiles` | employee_id, salary_type (hourly/salary), rate, overtime_rule | Supports historical comp changes |
| `bank_accounts` | employee_id, masked account/routing, type | Multiple accounts w/ split payments |
| `tax_profiles` | employee_id, filing status, allowances, extra withholding | For calculations |
| `pay_schedules` | company_id, frequency, next_run_on, timezone | Controls payroll cadence |
| `payroll_runs` | company_id, schedule_id, period_start/end, status, totals | Parent record per payroll |
| `payroll_run_entries` | payroll_run_id, employee_id, earnings, deductions, taxes, net_pay | Immutable pay stub data |
| `time_entries` | employee_id, clock_in/out, project, status | Source for hourly payroll |
| `time_off_requests` | employee_id, type, hours, status, approver_id | Impact PTO balances |
| `benefit_plans` | company_id, type, carrier_metadata, employer_pct, employee_pct | Supports pre/post-tax |
| `benefit_enrollments` | plan_id, employee_id, contribution_amount, status, effective dates | Deduction integration |
| `reports` | company_id, type, filters_json, generated_at, storage_path | For caching exports |
| `audit_logs` | actor_id, action, payload, entity_type/id | Traceability for compliance |

Migrations include soft deletes, foreign keys, JSON columns for flexible metadata. Use Laravel enums for statuses (`active`, `terminated`, `pending`, etc.).

### 3.2 Service layer & workflows

- `PayrollCalculator` – aggregates earnings, applies overtime rules, benefit deductions, employer taxes; returns line-item breakdown.
- `PayrollRunService` – orchestrates run lifecycle (draft → pending approval → processed). Emits domain events for notifications/webhooks.
- `TimeTrackingService` – validates clock events, handles auto-clock-out, overtime thresholds.
- `BenefitEnrollmentService` – eligibility checks, integration hooks for carriers.
- `BrandingService` – validates color inputs (OKLCH ranges), persists logos via S3, updates theme cache.
- Queue jobs: `ProcessPayrollRun`, `GenerateReportExport`, `SyncBenefitCarrier`, `SendPaystubEmail`.
- Scheduled commands: `company:advance-pay-schedules`, `payroll:remind-pending`, `time:close-open-shifts`.

### 3.3 API surface (REST + Sanctum)

```text
GET /api/payroll/employees
POST /api/payroll/employees
GET /api/payroll/employees/{id}
PATCH /api/payroll/employees/{id}
POST /api/payroll/employees/{id}/status

GET /api/payroll/schedules
POST /api/payroll/runs
GET /api/payroll/runs/{id}
POST /api/payroll/runs/{id}/approve
POST /api/payroll/runs/{id}/submit

GET /api/time/entries?period=
POST /api/time/entries
POST /api/time/entries/{id}/approve

GET /api/benefits/plans
POST /api/benefits/plans
POST /api/benefits/enrollments

GET /api/reports/{type}
POST /api/reports/{type}/export

GET/PUT /api/company/branding
```

- All endpoints scoped by tenant/company via middleware; role-based policies (Laravel Gates) enforce RBAC.
- Use request resources + transformers to keep response shape consistent.
- Broadcasting (Pusher/Laravel Echo) for real-time payroll status updates.
- Versioning via `/api/v1/...` once stable.

### 3.4 Compliance, quality, and testing

- Precision math through PHP `Brick\Money` or custom value objects; no floats for currency.
- Tax logic isolated for easier future integrations (IRS tables, multi-state handling).
- Feature tests per module, contract tests for API schemas, queue fakes for job orchestration.

---

## 4. Frontend (Next.js) architecture plan

### 4.1 Information architecture & routing

```text
/dashboard/payroll            – overview + KPIs
/dashboard/payroll/employees  – table + filters
/dashboard/payroll/employees/[id] – multi-tab profile
/dashboard/payroll/run        – wizard dialog (server action backed)
/dashboard/payroll/time       – time grid + approvals
/dashboard/payroll/benefits   – plan catalog + enrollment status
/dashboard/payroll/reports    – report gallery + export options
/dashboard/settings/company   – branding/theme controls
```

- Shared layout (`app/dashboard/payroll/layout.tsx`) loads company branding + nav state, injects CSS variables.
- Data fetching via server actions hitting Laravel API (bearer token stored in cookies/headers) + client hydration using React Query when interactivity needed (time tracking boards, tables).
- Role-based rendering by checking session scopes (owner/admin/hr/employee) to hide restricted cards.

### 4.2 UI system & theming

Color tokens (OKLCH) stored as CSS variables on `<html>`:

```css
--color-bg: oklch(1 0 0);
--color-card: oklch(0.98 0.005 250);
--color-muted: oklch(0.95 0.005 250);
--color-text: oklch(0.2 0 0);
--color-primary: oklch(0.45 0.09 250);
--color-accent: oklch(0.65 0.13 200);
--color-border: oklch(0.9 0.01 250);
```

Typography:

- Import Inter font via `next/font`. Tokens: `--font-display (Inter 600)`, `--font-body (Inter 400/500)`, with scale matching spec (h1 32px, h2 24px, h3 18px, body 15px, caption 13px).

Component patterns:

- **MetricCard** – KPIs on overview.
- **EmployeeTable** – virtualized table w/ sticky columns, badges for status.
- **EmployeeDrawer** – uses `Dialog` for add/edit; tabs (Profile, Compensation, Time Off, Documents).
- **PayrollRunWizard** – stepper with summary sidebar, progress indicator, skeleton states.
- **PayStubCard** – printable view w/ earnings/deductions.
- **TimeOffCalendar** – timeline with legend + manager approvals.
- **BenefitPlanCard** – plan details + enrollment CTA.
- **ReportBuilder** – filter form + preview.
- **BrandingPreview** – live preview of header/buttons using CSS variables.

Interactions/animation guidelines:

- 100–300ms transitions, ease-out for hover/focus, ease-in-out for dialogs.
- Loading states: skeleton rows for tables, shimmer cards for KPIs, progress ring for payroll run.

Responsive behavior:

- Breakpoints align with Tailwind defaults (sm/md/lg/xl). Tables convert to stacked cards under `md`. Dialogs become full-screen sheets on mobile; bottom nav emerges for employee self-serve.

### 4.3 State + validation strategy

- React Hook Form + Zod schemas for all forms (employee, payroll adjustments, benefits, branding). Inline validation plus summary toasts.
- Multi-step flows use `useFormContext` to persist state during steps; autosave to sessionStorage for drafts.
- Global notifications via `SuccessToastFromQuery`-like component, but extended to handle warnings (conflicting edits, missing data).

### 4.4 Integration points

- Auth token pulled from cookies (existing `getToken()` helper). Add `api.payroll...` methods mirroring backend endpoints.
- Use optimistic updates for employee list/time approvals; fallback to SWR revalidation.
- Downloadables (pay stubs, reports) triggered via signed URLs from API.

---

## 5. Edge cases & safeguards

- **Concurrent edits**: E-tags or `updated_at` precondition headers; warn user when stale.
- **Payroll locking**: Employee changes affecting current period prompt modal before save.
- **Zero/negative net pay**: UI flags and blocks submission until resolved.
- **Role permissions**: Server filter + client gating; sensitive pay data hidden for limited roles.
- **Incomplete onboarding**: dashboard surfaces checklist (add employees, connect bank, set schedule).
- **Time off overlaps**: validation + calendar warnings.
- **Branding validation**: enforce contrast ratios before save.

---

## 6. Implementation roadmap

1. **Foundation (Week 1-2)**
   - Database migrations + models for employees, pay schedules, payroll runs.
   - API scaffolding + auth policies.
   - Frontend routes/layout shell, global theming tokens, navigation.

2. **Employee & Branding (Week 3-4)**
   - Employee CRUD + compensation history.
   - Branding settings UI + API; propagate CSS variables.

3. **Time & Payroll (Week 5-7)**
   - Time entry + approval flows.
   - Payroll calculator service, wizard UI, pay stub generation.
   - Notifications + audit logs.

4. **Benefits & Reporting (Week 8-9)**
   - Benefit plan CRUD, enrollments, deduction sync.
   - Reporting pages + export jobs.

5. **Polish & Compliance (Week 10)**
   - Edge cases, accessibility audit, performance tuning, documentation, hand-off.

Each phase ships behind feature flags to allow progressive QA.

---

## 7. Verification plan & current status

| Layer | Command | Result | Notes |
| --- | --- | --- | --- |
| Backend (Laravel) | `php artisan test` | ✅ 12 tests passing (0.19s) | Confirms existing API surface is healthy before payroll modules extend it. |
| Frontend (Next.js) | `npx next build --turbopack` | ✅ Build succeeds (~5s) | Ensures App Router + dashboard compile cleanly prior to payroll UI work. |

Additional steps once payroll modules exist:

- Feature-specific Pest tests, queue/job fakes, contract tests with Hoppscotch collection.
- Frontend Playwright smoke flows (employee add, payroll run, time approval).
- End-to-end scenario hitting Laravel API via Next server actions in CI.

---

## 8. Next actions

1. Finalize detailed database schema + migrations in Laravel repo (`database/migrations/payroll/*.php`).
2. Extend `app/lib/api.ts` with payroll endpoints and shared DTO types.
3. Build `/dashboard/payroll` layout + overview page using MetricCard components.
4. Implement Employee Add/Edit drawer (React Hook Form + server actions) and connect to backend once endpoints land.
5. Stand up branding settings route + CSS variable injection to validate palette behavior early.

This blueprint provides the shared contract for engineering, design, and QA to ship the payroll platform confidently while honoring the requested experience qualities.
