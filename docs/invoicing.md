# Invoicing: public links and reminders

This page explains how customer-facing invoice pages and automated due/overdue reminders work in OnTask.

## Public invoice links

- Every invoice has a public external ID that can be shared with customers.
- Email templates include a button to view and pay an invoice using a secure public page.
- If a custom link is set in `invoice.meta.public_url`, emails will use that link. Otherwise, a link is composed using the site URL and the invoice external ID, e.g. `/invoice/<externalId>`.

## Automated reminders

- The system sends due-soon and overdue reminders automatically on a daily schedule.
- Default cadence: 7, 3, 1, and 0 days relative to the invoice due date (0 = day due).
- Default send time: around 09:00 (local server time).
- Each invoice is reminded at most once per day; sends are tracked to avoid duplicates.

## Configuration (admin)

These settings are configured in the backend environment and can be adjusted by the system admin:

- ALERTS_INVOICE_REMINDER_DAYS: comma-separated list of offsets (e.g., `7,3,1,0`).
- ALERTS_INVOICE_SEND_TIME: HH:MM (24h) time to send reminders daily (e.g., `09:00`).
- FRONTEND_URL (or APP_FRONTEND_URL): used to build public invoice links in emails when a custom `meta.public_url` is not present.

Changes to these values apply to all tenants. If you need different cadences per tenant, reach out to the OfRoot team.

## Related

- Admin dashboard → Billing → Invoice detail shows the public invoice link and controls to send/re-send an invoice.
- Billing index shows an info banner with a link back to this doc.
- For deeper technical details, see the API documentation (ofroot-api/docs/invoicing.md) in the server repository.

## Roadmap

- Optional SMS and push channels for reminders (feature-flagged by environment).
- Repeat overdue reminders (e.g., every 7 days) with smart pause when a payment is pending.
