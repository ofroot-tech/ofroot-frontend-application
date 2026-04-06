# Product Platform Strategy

**Date:** April 6, 2026  
**Owner:** Product

## Decision

OfRoot should operate as **one platform** with:

- one backend
- one web portal
- one iOS companion app
- multiple product editions on top of the same core

For the current portfolio, **OnTask** and **Helpr** should be treated as **sub-products / product modes**, not as fully separate apps.

## Plain-language definition

### OnTask

OnTask is the **operations product**.

It is for service businesses that need to run day-to-day work:

- capture leads
- follow up automatically
- generate estimates and invoices
- collect payments
- manage reporting and operational workflows

### Helpr

Helpr is the **lead generation and growth product**.

It is for service businesses that need to generate and convert demand:

- landing pages
- inbound lead capture
- fast follow-up
- review generation
- attribution and routing

Helpr should not be positioned as a separate marketplace app right now. The current codebase and product maturity support a **shared service-business growth module**, not a standalone two-sided network.

## Why this is the right decision

### Shared foundation is already in the product

The app already has one shared foundation for:

- auth
- tenants
- subscribers / billing
- CRM
- invoicing
- automation
- dashboards

This is already reflected in [docs/multi-tenant-setup.md](/Users/ofroot/projects/ofroot-frontend-application/docs/multi-tenant-setup.md).

### Separate apps would create waste

If OnTask and Helpr are split into separate apps now, the team would duplicate:

- onboarding
- account management
- billing
- mobile work
- analytics
- support overhead

That is not justified by the current scope.

### Helpr is not mature enough to justify a separate product stack

If Helpr later becomes a true marketplace with:

- homeowner-facing demand
- provider bidding
- matching and ranking
- marketplace trust/safety workflows

then it may warrant a separate app experience.

That is **not** the right product boundary today.

## Product model going forward

### Platform

**OfRoot Platform**

Shared capabilities:

- identity and auth
- tenant management
- subscriptions and billing
- CRM data model
- workflow automation
- reporting
- payments and invoicing

### Product editions

**OnTask**

- operations-first edition
- focused on workflow execution
- lead-to-cash workflows

**Helpr**

- acquisition-first edition
- focused on lead capture and conversion
- routes demand into the same CRM and operations core

## Mobile strategy

Build **one iOS app** that matches the same platform account and entitlements.

Recommended split:

- web portal = setup, reporting, billing, administration, content, complex workflows
- iOS app = notifications, quick CRM actions, lead response, status updates, field workflows, payment visibility

Do **not** build separate iOS apps for OnTask and Helpr right now.

## Immediate execution decisions

1. Treat `/ontask` and `/helpr` as product-specific entry points into the same subscription funnel.
2. Position Helpr as a growth module, not a separate marketplace app.
3. Keep product differentiation in:
   - pricing
   - onboarding
   - copy
   - feature flags / entitlements
   - default workflows
4. Keep data, accounts, and billing on one platform model.

## When to revisit this decision

Revisit only if one of these becomes true:

1. Helpr becomes a real two-sided marketplace with materially different user journeys.
2. The mobile UX for one product becomes incompatible with the other.
3. App Store positioning requires separate acquisition funnels.
4. Operational complexity from shared navigation becomes worse than duplicated product cost.

## Current implementation changes

This strategy is now reflected in the app by:

- routing both `/ontask` and `/helpr` into the shared subscription flow
- keeping both products in the shared product catalog
- updating Helpr positioning away from a separate marketplace story
