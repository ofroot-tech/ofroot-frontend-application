# Signal subscriptions

Signal has its own confirmed email list. Existing customer/contact records do not become subscribers. Public entry points are `/news/subscribe`, `/news/preferences`, and the subscription invitations on the news and briefs pages.

## Configuration

The app uses the existing Neon Postgres connection (`NEWS_DATABASE_URL`, with `DATABASE_URL`, `DIRECT_URL`, or `POSTGRES_URL` fallback) and Resend sender (`RESEND_API_KEY`, `RESEND_FROM`, `RESEND_FROM_NAME`). `SIGNAL_EMAIL_FROM` can override the formatted sender for this feature. Keep credentials in Vercel Secret variables.

`SIGNAL_SUBSCRIPTION_SECRET` is the preferred signing key, at least 24 characters. Existing `NEXTAUTH_SECRET` or `CRON_SECRET` is a fallback. Changing this key invalidates email links. Never publish it or put it in client configuration.

Set `SIGNAL_POSTAL_ADDRESS` to the business's valid public mailing address before enabling digest sends. No placeholder address is supplied. Without it, actual dispatch fails closed; confirmation and preferences-access mail still work.

Register a Resend webhook at `https://www.ofroot.technology/api/news/subscriptions/webhook` for `email.bounced`, `email.complained`, and `email.suppressed`. Save its signing secret as `RESEND_WEBHOOK_SECRET`; actual digest dispatch requires this configuration as well as the postal address. Unverified events are rejected. Events are reconciled against this feature's digest provider receipt IDs before suppressing a subscriber. Transactional confirmation/access bounces are still handled by Resend's own suppression, not the digest receipt ledger.

## Schedule and capacity

Production Vercel Cron calls `/api/news/digest` daily at `0 14 * * *` (UTC). The host's scheduling window can delay execution; no exact arrival time is promised. Weekly subscriptions become due on Monday; daily subscriptions become due each day. Only production sends. `CRON_SECRET` must be configured, and the route validates its bearer token. The existing news refresh schedule is independent.

Default limits are 25 attempted recipients per run and 50 per UTC day. `SIGNAL_DIGEST_BATCH_SIZE` and `SIGNAL_DIGEST_MAX_PER_DAY` can lower these within the hard 50-message ceiling. Confirmation and access requests share a separate default 40-per-day budget (`SIGNAL_TRANSACTIONAL_DAILY_LIMIT`), plus three requests per address and five per network identifier per hour, with a 60-second address cooldown. Review provider quota and queue counts before growing the audience. A run also stops preparing new recipients after approximately 200 seconds; outstanding subscribers remain due.

An authenticated production request to `/api/news/digest?dryRun=1` checks configuration, creates the additive tables, and reports due counts without sending. Never expose the cron credential in links, screenshots, command history, or logs. Normal dispatch returns counts only; recipient data remains private.

## Consent, privacy, and delivery

Signup sends a 24-hour random confirmation capability; only its hash is stored. Following the link does not confirm automatically: a button submits the confirmation. A repeated signup for an existing subscriber stages new choices until confirmation. Management links expire after 90 days; unsubscribe links after 365 days, with subscriber-version revocation. Private tokens arrive in URL fragments, are removed before requests, and stay only in component memory. Preference requests use POST/PATCH bodies. Human unsubscribe uses a button; mailbox clients can use the RFC 8058 one-click POST.

The database creates additive `ofroot_signal_*` tables lazily, with advisory locks around schema changes. Confirmation, status and preference changes are transactional. Global leases, unique due occurrences, and per-subscriber item ledgers prevent repeated digest issues/items. Ambiguous provider acknowledgements keep items reserved and advance the schedule rather than blindly resending after the provider's idempotency window.

Digests include at most five topic-matching items: ready Signal briefs from the explicitly reviewed primary-source adapters, and/or original OfRoot Insights. Publication dates determine freshness. Commercial RSS discovery metadata is excluded from email distribution. Empty editions are skipped. Delivery settings and pause/opt-out status are rechecked immediately before reserving a send.

Private subscription pages and API paths are excluded from analytics/error event collection. Rate-limit keys hash addresses and network identifiers; stale buckets are pruned after two days. Never-confirmed, expired pending records older than seven days are pruned during subsequent accepted requests. Confirmed, unsubscribed, suppressed, and delivery history records are retained to honor preferences and prevent repeats; deletion requests use the published privacy contact.

For live QA, use Resend's official simulated recipients, such as `delivered+signal-test@resend.dev`, and inspect provider receipts. Do not send test messages to real readers or import a contact list without explicit consent.
