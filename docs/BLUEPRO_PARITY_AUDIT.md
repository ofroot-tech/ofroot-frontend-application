# OnTask/OfRoot → BluePro Parity Audit Report

**Date:** December 9, 2025  
**Purpose:** Comprehensive assessment of current build status against BluePro feature parity goals  
**Status:** Active Development — Marketing/Infrastructure Phase

---

## Executive Summary

### Overall Progress: **~35% Complete**

**What's Built:**
- ✅ Full multi-tenant infrastructure
- ✅ Complete invoicing system with payments
- ✅ Basic CRM (contacts + leads)
- ✅ Calendar/scheduling foundation
- ✅ Payroll module (advanced, beyond BluePro scope)
- ✅ Authentication & role-based access
- ✅ Marketing site with conversion funnel

**Critical Gaps:**
- ❌ Job management lifecycle (lead → quote → job → invoice)
- ❌ Quoting/estimates engine
- ❌ Field technician mobile interface
- ❌ Workflow automation & notifications
- ❌ Analytics & reporting dashboards
- ❌ Payment integrations (Stripe setup incomplete)

---

## Feature-by-Feature Analysis

### A. Analytics & Reporting — **10% Complete** ❌

**Status:** Infrastructure only  
**What Exists:**
- Basic admin metrics endpoint (`adminMetrics`)
- Overview dashboard showing tenants, users, subscribers, MRR
- No drill-down, no export, no job profitability

**Gaps:**
- Job-level analytics
- Revenue per job/customer
- Team performance metrics
- CSV export functionality
- Custom date ranges and filters

**Recommendation:** Build after Job Management MVP is complete.

---

### B. Appointments & Scheduling — **40% Complete** ⚠️

**Status:** Foundation exists, needs enhancement  
**What Exists:**
- Calendar UI component (`app/dashboard/calendar`)
- `CalendarClient.tsx` for client-side interactions
- Basic scheduling data structures in API

**Gaps:**
- Drag-and-drop functionality
- Recurring jobs
- Technician availability management
- Google/Outlook sync
- Conflict detection

**Files:**
- `app/dashboard/calendar/page.tsx`
- `app/dashboard/calendar/CalendarClient.tsx`

**Recommendation:** MVP 2 priority after CRM + Jobs.

---

### C. Branding & Customization — **50% Complete** ⚠️

**Status:** Partial implementation via Payroll module  
**What Exists:**
- `TenantBrandSettings` type in API
- Brand settings form in payroll module
- Custom fields architecture (meta/JSONB columns)
- Multi-tenant isolation

**Gaps:**
- White-label logo upload & management
- Color customization UI
- Custom field builder for jobs/contacts
- Per-tenant theme persistence

**Files:**
- `app/lib/api.ts` (TenantBrandSettings)
- `app/dashboard/payroll/_components/forms` (BrandSettingsForm)

**Recommendation:** Extract from payroll, make tenant-wide.

---

### D. Contact Management (CRM) — **60% Complete** ✅

**Status:** Core functionality working  
**What Exists:**
- Contacts list with pagination (`app/dashboard/crm/contacts`)
- Leads list with status filtering (`app/dashboard/crm/leads`)
- Search and segmentation
- Lead conversion actions
- Full CRUD via API (`adminListContacts`, `adminListLeads`)

**Gaps:**
- Lead intake forms (public-facing)
- Customer history timeline
- Bulk import/export
- Advanced tagging system
- Activity logging

**Files:**
- `app/dashboard/crm/contacts/page.tsx`
- `app/dashboard/crm/leads/page.tsx`
- `app/lib/api.ts` (Contact, Lead types)

**Recommendation:** Add customer history view in MVP 1.

---

### E. Expenses & Timesheets — **70% Complete** ✅

**Status:** Advanced implementation (exceeds BluePro)  
**What Exists:**
- Full payroll module with time entries (`TimeEntry` type)
- Time off requests (`TimeOffRequest`)
- Pay schedules and payroll runs
- Cost tracking per employee
- Analytics and trend reporting

**Gaps (relative to BluePro):**
- Job-level expense tracking (currently employee-centric)
- Receipt attachment system
- Cost vs. revenue comparison per job

**Files:**
- `app/dashboard/payroll/page.tsx` (390 lines)
- `app/lib/api.ts` (PayrollRun, TimeEntry types)

**Recommendation:** Extend to job-level expenses after Job Management.

---

### F. Integrations — **20% Complete** ❌

**Status:** Infrastructure ready, implementations incomplete  
**What Exists:**
- API proxy system (`app/api/proxy`)
- Payment types in schema (`Payment`, `provider_payment_id`)
- Lead capture API endpoint (`app/api/leads/route.ts`)
- Webhook helpers in `app/api/_helpers`

**Gaps:**
- Stripe payment flow (checkout, webhooks, refunds)
- QuickBooks integration
- Zapier/webhook automation
- Website lead form embeds

**Files:**
- `app/api/leads/route.ts`
- `app/lib/api.ts` (Payment type, adminRecordPayment)
- `app/api/proxy/`

**Recommendation:** Critical MVP 1 priority — Stripe first.

---

### G. Invoicing — **90% Complete** ✅

**Status:** Fully functional, production-ready  
**What Exists:**
- Complete invoice CRUD (`app/dashboard/billing`)
- Public invoice pages (`app/invoice/[externalId]`)
- Payment recording (`adminRecordPayment`)
- Automated reminders (documented in `docs/invoicing.md`)
- Invoice items, due dates, statuses (draft/sent/paid/void)
- Export functionality (`app/dashboard/billing/export`)

**Gaps:**
- Stripe payment link integration (pending F. Integrations)
- Recurring invoices
- Late fee automation

**Files:**
- `app/dashboard/billing/page.tsx` (187 lines)
- `app/invoice/[externalId]/page.tsx`
- `docs/invoicing.md`

**Recommendation:** Connect to Stripe checkout immediately.

---

### H. Job Management — **5% Complete** ❌

**Status:** Critical blocker, not yet implemented  
**What Exists:**
- Marketing landing page (`app/ontask/page.tsx`)
- Job-related fields in Employee type (`job_title`)
- Conceptual documentation only

**Gaps (entire lifecycle missing):**
- Job creation and status tracking
- Lead → Quote → Job → Invoice workflow
- Job attachments and photos
- Internal notes and activity log
- Customer-facing job status page
- Technician assignment

**Recommendation:** **TOP MVP 1 PRIORITY**. Build full lifecycle.

---

### I. Mobile & Field Access — **10% Complete** ❌

**Status:** Not implemented  
**What Exists:**
- Responsive Tailwind layouts
- Mobile testing documentation (`MOBILE_TESTING.md`)
- Public invoice pages work on mobile

**Gaps:**
- Dedicated technician interface
- Mobile job status updates
- Photo/attachment upload from field
- Offline-first capabilities
- Mobile payment collection

**Recommendation:** MVP 2 after core Job Management works.

---

### J. Notifications & Workflow Automation — **15% Complete** ❌

**Status:** Manual only, no triggers  
**What Exists:**
- Invoice reminder system (documented)
- Toast notifications (`components/FlashToast.tsx`)
- Email infrastructure (inferred from invoice reminders)

**Gaps:**
- Trigger-based alerts (job status changes)
- Customer SMS/email notifications
- Internal team alerts
- Workflow automation builder
- Reminder scheduling UI

**Files:**
- `docs/invoicing.md` (reminder cadence config)
- `components/FlashToast.tsx`

**Recommendation:** MVP 2 priority — add basic job status emails.

---

### K. Payments System — **30% Complete** ⚠️

**Status:** Schema ready, integration incomplete  
**What Exists:**
- `Payment` type with provider fields
- `adminRecordPayment` API method
- Invoice payment tracking (amount_paid_cents, amount_due_cents)
- Payment history display

**Gaps:**
- Stripe checkout integration
- Deposit collection
- Refund processing
- Partial payment workflow
- Real-time payment status webhooks

**Files:**
- `app/lib/api.ts` (Payment type, lines 413-422)
- `app/dashboard/billing/page.tsx`

**Recommendation:** **Critical MVP 1 priority**. Integrate Stripe.

---

### L. Quoting & Estimates — **0% Complete** ❌

**Status:** Not implemented  
**What Exists:**
- OnTask marketing mentions "fast estimates"
- Invoice system could be adapted

**Gaps (entire feature missing):**
- Quote creation UI
- Itemized pricing builder
- Digital approval workflow
- Quote → Invoice conversion
- Quote versioning and revisions
- Customer-facing quote acceptance page

**Recommendation:** **MVP 1 priority #2** after Job Management.

---

### M. Scheduling & Routing — **40% Complete** ⚠️

**Status:** Overlaps with B. Appointments  
**What Exists:**
- Calendar component
- Team assignment concepts in Employee/Payroll

**Gaps:**
- Route optimization
- Travel time calculation
- Technician mobile schedule view
- Schedule conflict resolution

**Recommendation:** Same as B. Appointments — MVP 2.

---

### N. Website & Lead Capture — **70% Complete** ✅

**Status:** Strong foundation, needs job integration  
**What Exists:**
- Full marketing site (`app/landing`, `app/services`)
- SEO templates and schemas (`app/lib/schemas.ts`)
- Lead capture API (`app/api/leads/route.ts`)
- Customer-facing pages (invoices, public links)
- Landing page manifest system with A/B testing

**Gaps:**
- Customer portal (job status, history)
- Embedded lead forms for external sites
- Service-specific landing pages need job booking

**Files:**
- `app/landing/[slug]/page.tsx`
- `app/services/**/page.tsx`
- `app/api/leads/route.ts`
- `docs/SITE_ARCHITECTURE.md`

**Recommendation:** Build customer portal after Job Management.

---

### O. Workspace & Roles — **80% Complete** ✅

**Status:** Production-ready multi-tenant infrastructure  
**What Exists:**
- Full multi-tenant architecture (`docs/multi-tenant-setup.md`)
- User, Tenant, Subscriber model
- Role-based access (AdminUser with roles array)
- Tenant scoping in all queries
- Authentication flow with token management
- Tenant picker in payroll dashboard

**Gaps:**
- Granular permission builder UI
- Audit log display
- Role customization interface
- User invitation workflow

**Files:**
- `context/AuthContext.tsx`
- `app/lib/api.ts` (User, Tenant, AdminUser types)
- `docs/multi-tenant-setup.md`

**Recommendation:** Add audit logs in MVP 3 for compliance.

---

## Technology Stack Assessment

### Frontend
- ✅ Next.js 15 App Router
- ✅ TypeScript (strict typing)
- ✅ Tailwind CSS (responsive)
- ✅ React Server Components
- ✅ Vanta.js animations
- ✅ p5.js rendering

### Backend Integration
- ✅ Laravel API (inferred from api.ts)
- ✅ RESTful architecture
- ✅ JWT/Bearer token auth
- ✅ JSONB for flexible metadata

### Observability
- ✅ Sentry error tracking
- ✅ Instrumentation setup
- ✅ Client/server/edge monitoring

### Testing
- ✅ Jest configured
- ✅ Playwright E2E tests
- ⚠️ Test coverage incomplete

---

## MVP 1 Recommendation (Revenue-Critical)

**Goal:** Match Stripe-powered scheduling tool capability  
**Timeline:** 6-8 weeks

### Must-Build Features (Priority Order)

1. **Job Management** (H) — 3 weeks
   - Job CRUD with status lifecycle
   - Lead → Job conversion
   - Job detail page with notes
   - Basic job list view

2. **Quoting/Estimates** (L) — 2 weeks
   - Quote builder with line items
   - Customer approval page
   - Quote → Invoice conversion
   - Quote status tracking

3. **Stripe Integration** (K, F) — 2 weeks
   - Checkout session creation
   - Payment webhook handling
   - Refund/partial payment support
   - Payment status display

4. **Basic Reporting** (A) — 1 week
   - Job profitability dashboard
   - Revenue by customer
   - Simple CSV export

### Deferred to MVP 2

- Advanced scheduling (drag-drop, recurring)
- Mobile technician app
- Workflow automation
- QuickBooks integration
- Customer portal

---

## Technical Debt & Risks

### High Priority
1. **No job management schema** — Blocks all core workflows
2. **Stripe not integrated** — Can't collect payments
3. **Quote system missing** — No estimates/approvals
4. **Limited test coverage** — Risk in production

### Medium Priority
1. **Calendar needs enhancements** — No drag-drop
2. **CRM lacks activity timeline** — Poor customer context
3. **No mobile-first field app** — Technicians underserved

### Low Priority
1. **Audit logs not visible** — Compliance gap
2. **Analytics are basic** — Limited business insights

---

## Competitive Positioning

### Current State vs. BluePro

| Feature Category | OfRoot Status | BluePro Equivalent |
|-----------------|---------------|-------------------|
| Infrastructure | ✅ Superior (multi-tenant) | Standard |
| Invoicing | ✅ Complete | Complete |
| Payments | ⚠️ Partial (no Stripe) | ✅ Integrated |
| CRM | ✅ Good | ✅ Good |
| Job Management | ❌ Missing | ✅ Core feature |
| Quoting | ❌ Missing | ✅ Core feature |
| Scheduling | ⚠️ Basic | ✅ Advanced |
| Mobile | ❌ Missing | ✅ Native apps |
| Automation | ❌ Minimal | ✅ Robust |
| Payroll | ✅ Advanced (extra) | ❌ Not included |

**Verdict:** Strong foundation, critical feature gaps for market entry.

---

## Next Steps for Copilot

### Immediate Actions (This Sprint)

1. **Create Job Management Schema**
   - Database ERD and table definitions
   - Laravel migration files
   - API contract (DTOs, routes)
   - Next.js TypeScript types

2. **Build Quote System**
   - Quote builder component
   - Line item editor (reuse invoice patterns)
   - Approval workflow
   - Quote → Invoice conversion logic

3. **Integrate Stripe**
   - Checkout session API
   - Webhook handler for payment events
   - Payment status sync to invoices
   - Refund UI in dashboard

4. **Connect Job Lifecycle**
   - Lead → Quote → Job → Invoice flow
   - Status transitions with validation
   - Customer-facing job status page

### Documentation Needed

- [ ] Job Management API specification
- [ ] Quote workflow state machine diagram
- [ ] Stripe integration guide
- [ ] Customer portal UX flow

### Sprint Planning Structure

**Epic 1: Job Management Core** (3 weeks)
- Task 1.1: Design job schema & API
- Task 1.2: Build job CRUD pages
- Task 1.3: Add job status tracking
- Task 1.4: Connect to lead conversion

**Epic 2: Quoting Engine** (2 weeks)
- Task 2.1: Quote builder UI
- Task 2.2: Approval workflow
- Task 2.3: Quote → Invoice conversion
- Task 2.4: Customer approval page

**Epic 3: Stripe Integration** (2 weeks)
- Task 3.1: Checkout API setup
- Task 3.2: Webhook handling
- Task 3.3: Payment UI in dashboard
- Task 3.4: Refund processing

**Epic 4: Basic Analytics** (1 week)
- Task 4.1: Job profitability query
- Task 4.2: Dashboard widgets
- Task 4.3: CSV export

---

## Pricing Strategy Alignment

### Current Plans (from codebase)
- ✅ Starter: $25/mo (mentioned in OnTask landing)
- ✅ $1 trial offer (active in marketing)
- ⚠️ Pro/Business tiers exist in schema but not fully marketed

### Recommended Pricing (Post-MVP 1)

**Starter** — $29/mo
- 1-3 users
- Unlimited jobs, quotes, invoices
- Stripe payments
- Basic scheduling
- Email support

**Pro** — $79/mo (current "Business" tier)
- 4-10 users
- Everything in Starter
- Advanced scheduling (recurring, routing)
- Custom branding
- Priority support

**Business** — $149/mo
- 11-25 users
- Everything in Pro
- QuickBooks integration
- Workflow automation
- Dedicated account manager
- API access

---

## Conclusion

OnTask/OfRoot has an **excellent technical foundation** with:
- Production-ready multi-tenant architecture
- Complete invoicing system
- Strong payroll capabilities (bonus differentiator)
- Professional marketing site with conversion funnel

**Critical blockers for market entry:**
1. No job management (entire lifecycle missing)
2. No quoting system (can't create estimates)
3. No Stripe integration (can't collect payments)

**Recommended path:**
- Focus 100% on MVP 1 (Job Management + Quotes + Stripe)
- Defer advanced features to MVP 2
- Launch with Starter + Pro tiers
- Market as "BluePro alternative for modern teams"

**Timeline to competitive parity:**
- MVP 1: 6-8 weeks → Market entry
- MVP 2: +8 weeks → Feature parity
- MVP 3: +12 weeks → Market leader (with payroll advantage)

---

## Appendix: File Inventory

### Core Application
- `app/page.tsx` — Homepage
- `app/ontask/page.tsx` — OnTask landing page
- `app/dashboard/**` — Admin dashboard (12 subdirectories)
- `app/invoice/[externalId]/**` — Public invoice pages
- `app/api/**` — API routes (9 endpoints)

### Infrastructure
- `app/lib/api.ts` — 1068 lines, comprehensive API client
- `context/AuthContext.tsx` — Authentication state
- `middleware.ts` — A/B testing, routing
- `instrumentation*.ts` — Sentry setup

### Documentation
- `docs/multi-tenant-setup.md` — Architecture guide
- `docs/invoicing.md` — Invoice reminders
- `docs/payroll-prd.md` — Payroll product spec
- `docs/SITE_ARCHITECTURE.md` — Marketing strategy
- `WORK_COMPLETED.md` — Recent delivery log

### Key Gaps (Files Not Found)
- ❌ Job management pages/components
- ❌ Quote builder components
- ❌ Stripe integration code
- ❌ Customer portal pages
- ❌ Mobile technician interface

---

**Report Compiled:** December 9, 2025  
**Next Review:** After MVP 1 Sprint 1 (2 weeks)
