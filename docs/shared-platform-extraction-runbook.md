# Shared Platform Extraction Runbook

**Date:** April 6, 2026  
**Owner:** Product / Platform  
**Status:** Approved execution plan

## Objective

Build one shared OfRoot platform that powers:

- `Helpr` as the growth and lead-conversion edition
- `OnTask` as the operations and billing edition

Use `SCALEIR` only as a source of architectural patterns and feature boundaries. Do not modify `SCALEIR` locally or remotely as part of this work.

## Hard Constraint

The following actions are out of bounds:

- editing files in `/Users/ofroot/projects/SCALEIR`
- committing changes in the `SCALEIR` repository
- pushing branches or deployments from the `SCALEIR` repository
- wiring the OfRoot app to import code directly from `SCALEIR`

This runbook is for extraction by reimplementation inside this repository only.

## Product Split

### Shared platform

Own these capabilities once:

- tenant model
- auth and membership
- role-based permissions
- feature entitlements
- shared CRM records
- activity timeline
- automation engine
- reporting and attribution
- observability

### Helpr

Own these edition-specific workflows:

- landing pages
- form capture
- inbound lead routing
- fast SMS and email follow-up
- review request flows
- attribution and funnel performance

### OnTask

Own these edition-specific workflows:

- estimates
- invoices
- public invoice links
- payment collection
- reminder cadences
- receipts
- service-team operational workflows

### Explicitly excluded from shared core

Do not treat these as common-platform requirements unless product direction changes:

- dialer-specific UI
- dispositions
- call QA
- call-center-only workflows

## Source Capability Map

The working assumption is that `SCALEIR` already proves out several platform modules worth copying conceptually:

### Safe to model after

- tenant and role foundations
- CRM and activity objects
- workflow automation and trigger handling
- lead ingestion and queue processing
- SMS follow-up services
- reporting, attribution, audit logging, and monitoring

### Requires adaptation before use here

- permissions, because `SCALEIR` mixes client associations and global roles
- landing pages, because ingestion exists but a complete builder/runtime is not the reusable unit
- email nurture flows, because report-email infrastructure is not the same as a general lifecycle engine
- product upgrade paths, because shared entitlements are not yet implemented end to end

### Must be built net new in OfRoot

- estimates
- invoices
- public invoice links
- Stripe Checkout subscription and payment flows
- payment reminders
- receipts
- review generation and review boost flows
- product-to-product entitlement upgrades

## Target Modules In This Repository

Use these platform boundaries in the OfRoot codebase.

### Module 1: Identity, Tenant, and Access

Primary responsibility:

- user identity
- subscriber to tenant relationship
- tenant membership
- role assignment
- feature entitlements per tenant

Relevant existing references:

- [docs/multi-tenant-setup.md](/Users/ofroot/projects/ofroot-frontend-application/docs/multi-tenant-setup.md)
- [app/dashboard/tenants/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/dashboard/tenants/page.tsx)
- [app/dashboard/subscribers/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/dashboard/subscribers/page.tsx)
- [app/dashboard/billing/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/dashboard/billing/page.tsx)

### Module 2: Shared CRM and Activity Timeline

Primary responsibility:

- leads
- contacts
- tasks
- notes
- communications
- lifecycle status
- tenant-scoped activity history

Relevant existing references:

- [app/dashboard/crm/leads/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/dashboard/crm/leads/page.tsx)
- [app/dashboard/crm/contacts/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/dashboard/crm/contacts/page.tsx)
- [app/dashboard/activity/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/dashboard/activity/page.tsx)

### Module 3: Automation and Routing

Primary responsibility:

- trigger ingestion
- queue-backed workflow execution
- lead routing
- reminders
- lifecycle automations
- product-specific workflow templates

Relevant existing references:

- [app/dashboard/crm/workflows/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/dashboard/crm/workflows/page.tsx)
- [app/dashboard/automation-build/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/dashboard/automation-build/page.tsx)
- [app/onboarding/automations/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/onboarding/automations/page.tsx)

### Module 4: Growth Surfaces

Primary responsibility:

- landing pages
- lead forms
- attribution surfaces
- growth reporting
- Helpr edition packaging

Relevant existing references:

- [app/landing/new/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/landing/new/page.tsx)
- [app/landing/[slug]/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/landing/[slug]/page.tsx)
- [app/landing/components/LeadCapture.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/landing/components/LeadCapture.tsx)
- [app/platform/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/platform/page.tsx)

### Module 5: Billing and Operations

Primary responsibility:

- estimates
- invoices
- public pay links
- receipts
- reminder cadences
- payment events
- OnTask edition packaging

Relevant existing references:

- [docs/invoicing.md](/Users/ofroot/projects/ofroot-frontend-application/docs/invoicing.md)
- [app/dashboard/billing/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/dashboard/billing/page.tsx)
- [app/invoice/[externalId]/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/invoice/[externalId]/page.tsx)
- [app/api/subscribe/checkout/route.ts](/Users/ofroot/projects/ofroot-frontend-application/app/api/subscribe/checkout/route.ts)
- [app/api/stripe/webhook/route.ts](/Users/ofroot/projects/ofroot-frontend-application/app/api/stripe/webhook/route.ts)

### Module 6: Reporting and Observability

Primary responsibility:

- funnel metrics
- source-to-revenue reporting
- audit logs
- delivery monitoring
- health dashboards

Relevant existing references:

- [docs/analytics-reporting-architecture.md](/Users/ofroot/projects/ofroot-frontend-application/docs/analytics-reporting-architecture.md)
- [app/dashboard/owner/funnel/page.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/dashboard/owner/funnel/page.tsx)
- [app/components/ResourceHealth.tsx](/Users/ofroot/projects/ofroot-frontend-application/app/components/ResourceHealth.tsx)

## Non-Negotiable Architecture Rules

1. Every platform record that is tenant-scoped gets `tenant_id`.
2. Roles and feature access must be unified into one coherent permission model.
3. Product differentiation must come from entitlements and workflow templates, not separate account systems.
4. Shared CRM objects must be edition-neutral.
5. Edition-specific UI can diverge, but shared data contracts cannot.
6. No runtime dependency on `SCALEIR` code is allowed.

## Phase Plan

### Phase 0: Inventory and Interface Contracts

Deliverables:

- inventory of current OfRoot platform surfaces
- list of `SCALEIR` concepts to mirror
- interface contracts for shared modules

Output:

- canonical table and service list
- edition-to-feature entitlement matrix
- agreed excluded scope list

Acceptance criteria:

- every shared capability has a clear owner module
- every edition-specific feature is marked `Helpr`, `OnTask`, or `Shared`
- excluded dialer features are documented as out of scope

### Phase 1: Access Model Unification

Goal:

Create one tenant-scoped permission system that supports both products.

Build:

- tenant membership model
- role catalog
- user-to-tenant role assignment
- feature entitlement checks

Acceptance criteria:

- a tenant can enable `helpr`, `ontask`, or both
- one user can hold different roles within the same tenant
- edition access is derived from entitlements, not hard-coded routes

### Phase 2: Shared CRM Foundation

Goal:

Create one edition-neutral CRM substrate.

Build:

- leads
- contacts
- tasks
- notes
- activities
- communication timeline entries

Acceptance criteria:

- a lead created by Helpr can become an OnTask operational customer without duplication
- all records resolve to one tenant and one customer timeline
- both editions read from the same customer identity model

### Phase 3: Automation and Routing Core

Goal:

Stand up the shared execution layer for automations and lead handling.

Build:

- event ingestion contracts
- workflow runner
- trigger registry
- queue-backed execution
- lead routing rules
- reminder jobs

Acceptance criteria:

- form submissions can create leads and trigger follow-up
- billing reminders can reuse the same workflow engine
- the same engine can serve Helpr and OnTask with different templates

### Phase 4: Helpr MVP on Shared Core

Goal:

Ship the growth edition first on top of the shared platform.

Build:

- lead capture pages
- attribution fields
- SMS follow-up
- email follow-up
- review request flows
- growth dashboards

Acceptance criteria:

- inbound form submits create CRM records
- leads can be routed by tenant-defined rules
- follow-up automation starts within one workflow system
- Helpr can operate without any OnTask-only screens enabled

### Phase 5: OnTask MVP on Shared Core

Goal:

Ship the operations edition using the same tenant, CRM, and automation base.

Build:

- estimates
- invoices
- public payment links
- receipts
- invoice reminder cadences
- operational workflow screens

Acceptance criteria:

- an existing Helpr customer can be invoiced without migration
- invoice reminders are automation templates, not a separate scheduler stack
- public invoice links resolve against the same tenant-owned customer data

### Phase 6: Upgrade and Cross-Sell Paths

Goal:

Allow tenants to start with one edition and add the other without replatforming.

Build:

- entitlement upgrade flow
- shared onboarding checkpoints
- edition-aware navigation
- usage-based upsell prompts

Acceptance criteria:

- `Helpr -> OnTask` enables operations screens without customer-data migration
- `OnTask -> Helpr` enables growth tooling without duplicate CRM setup
- billing reflects edition entitlements cleanly

### Phase 7: iOS Companion Planning

Goal:

Define the first shared mobile surface after the web portal model is stable.

Build:

- mobile feature matrix by edition
- shared auth and entitlement behavior
- field workflow shortlist

Acceptance criteria:

- one iOS app can authenticate against the same tenant and user system
- mobile scope is limited to rapid actions, not full admin workflows

## Execution Recipes

Use these recipes repeatedly instead of re-deciding the pattern each time.

### Recipe A: Add a shared capability

1. Define the capability as `Shared`, `Helpr`, or `OnTask`.
2. Add or confirm the tenant-scoped data contract.
3. Add the entitlement guard.
4. Add the dashboard entry point.
5. Add audit and reporting hooks.
6. Add one workflow trigger if automation applies.

### Recipe B: Add an edition-specific feature

1. Confirm the shared data model already supports it.
2. Add UI under the edition surface only.
3. Gate access with tenant feature entitlements.
4. Reuse shared CRM, activity, and workflow services.
5. Do not add a second customer record model.

### Recipe C: Extract from `SCALEIR` safely

1. Identify the concept, not the implementation file, to reuse.
2. Write the target OfRoot interface first.
3. Rebuild only the minimum behavior needed in this repo.
4. Validate it against the OfRoot tenant model.
5. Leave the `SCALEIR` repository untouched.

## Initial Backlog

### Shared core

- unify access roles and tenant entitlements
- define CRM base tables and service contracts
- define activity timeline event schema
- define workflow trigger and job interfaces
- define attribution fields on leads and contacts

### Helpr

- complete landing-page to lead pipeline
- add generalized SMS and email follow-up flows
- add review request and review boost workflows
- add conversion and attribution reporting

### OnTask

- formalize estimate model
- complete invoice lifecycle model
- standardize public invoice link generation
- standardize receipt generation and payment event handling
- convert reminder cadence into reusable workflow templates

## Risks

- permission drift if access rules are not unified first
- duplicate customer identity if Helpr and OnTask build separate lead/customer tables
- automation fragmentation if billing reminders and lead follow-up use different execution stacks
- edition confusion if feature flags are implemented in UI only and not enforced at the data layer

## Definition Of Done

The extraction is successful when:

- Helpr and OnTask run on one tenant, auth, and CRM foundation
- either product can be enabled without creating a separate account stack
- customer lifecycle data moves from lead to invoice without duplication
- operational reminders and growth follow-up share one automation system
- no code or deployment changes were required in the `SCALEIR` repository
