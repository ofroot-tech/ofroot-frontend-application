# Phone Burner–Style Dialer Blueprint

Narrative first, code second: this document maps a lean, PhoneBurner-like power dialer into OfRoot with minimal cost while keeping compliance and extensibility. Twilio is the initial provider for speed; Telnyx can be added later without changing the UI contract.

## 1) Objectives
- Deliver a browser-based power dialer with preview/progressive calling, voicemail drop, dispositions, scripts, SMS/email follow-ups, and local presence.
- Keep infra cheap: reuse Next.js app routes + server actions, Upstash Redis for queues/rate limits, Postgres for state. No separate workers beyond lightweight cron/queue runners.
- Enforce compliance: TCPA-friendly quiet hours, DNC scrubbing, recording consent banners, SMS opt-out, audit trails.
- Provide a single telephony abstraction so tenants can bring their own provider without code changes.

## 2) Provider strategy (cost-first)
- Start with Twilio: elastic numbers, reliable webhooks, strong docs. Store recordings provider-side; fetch signed URLs on demand.
- Add Telnyx as a second adapter for cost-down; the UI reads a capability matrix (e.g., supportsLocalPresence, supportsVoicemailDrop, supportsSMS).
- Provider credentials are encrypted per tenant; number pools are scoped per provider and tagged by locale/area code.

## 3) Architecture (modules)
- Telephony adapter interface: `Voice.call`, `Voice.hangup`, `Voice.transfer`, `Voice.voicemailDrop`, `Voice.recordingUrl`, `Numbers.search|purchase|release|allocate`, `Messaging.sendSms`, `Webhooks.verifySignature`.
- Twilio driver: wraps SDK; enforces idempotency keys per outbound call; attaches `metadata: {tenantId, campaignId, sessionId}` for webhook correlation.
- Webhook ingress: Next.js route `/api/telephony/webhook/[provider]` with signature verification, idempotent persistence, enqueue-to-Redis for downstream fan-out.
- Queue + jobs: Upstash Redis list/stream; handlers for call-state updates, recording finalization, SMS follow-ups, KPI aggregation. Expose Next Cron to drain queues on schedule.
- Data layer: Postgres tables for `Campaign`, `Contact`, `List`, `CallSession`, `Disposition`, `VoicemailAsset`, `ProviderCredential`, `NumberPool`, `MessageSequence`, `ComplianceRule`, `AuditLog`.
- Frontend shell: Dialer workspace (queue + script pane + controls), Campaign builder, Numbers/Provider setup, Compliance settings, Reporting.

## 4) Data contracts (lean start)
- Campaign: id, tenantId, name, dialingMode (preview|progressive), fromStrategy (static|local-presence), provider, numberPoolId, scriptId, voicemailAssetId, quietHours, throttlePerMinute, timezonePolicy, defaultDisposition.
- Contact/List: id, listId, tenantId, name, phone, timezone, tags, consentFlags, dncFlag, lastDisposition, lastCallAt.
- CallSession: id, campaignId, contactId, agentId, provider, fromNumber, toNumber, status (queued|ringing|connected|completed|failed), startedAt, connectedAt, endedAt, durationSec, recordingId, recordingUrl, disposition, notes, webhookIdempotencyKey.
- Disposition: id, campaignId, label, outcomeType (success|callback|voicemail|bad-number), followUp (sms|email|callback), nextAt.
- VoicemailAsset: id, tenantId, provider, mediaUrl, transcription, durationSec.
- ProviderCredential: id, tenantId, provider, encryptedConfig (sid/token or API key), capabilities JSON, healthState.
- NumberPool: id, tenantId, provider, numbers[], locales[], health.
- MessageSequence: id, campaignId, step (sms/email), templateId, delayMinutes.
- ComplianceRule: tenantId, quietHours (per TZ), dncSources, recordingPolicy, consentRequired, smsOptOutKeywords.
- AuditLog: id, actorId, entityType, entityId, action, payload, createdAt.

## 5) Flows (happy path)
1) Tenant connects provider (Twilio). We store encrypted credentials and verify via a health ping.
2) Tenant purchases or links numbers; we tag by area code/locale for local presence pools.
3) Tenant creates a campaign: select list(s), dialing mode, script, voicemail, dispositions, throttle, quiet hours, local presence toggle.
4) Agent enters dialer workspace: sees next contact, script panel, disposition buttons, voicemail drop button, call controls (start/hangup/record toggle), SMS follow-up templates.
5) When agent clicks Call: server action requests adapter `Voice.call` with idempotency key; state is `queued→ringing→connected→completed` via webhooks; UI polls/streams state.
6) Agent logs disposition; optional follow-up (SMS/email) is enqueued; callbacks schedule new CallSessions.
7) Reporting aggregates per campaign/agent: attempts, connects, connect rate, talk time, voicemails, callbacks, conversions.

## 6) Compliance guardrails
- Quiet hours by contact timezone (fallback to campaign default); block calls outside window.
- DNC: tenant-level list + per-contact flag; block call + surface reason.
- Recording consent: banner + checkbox; optional pre-call notice; allow per-state override.
- Local presence caller ID rotation with spam-score check; retire flagged numbers.
- SMS: append opt-out (“Reply STOP to opt out”); honor keywords; cap per-minute sends.

## 7) Observability and safety
- Sentry on server actions + webhook handlers; span telephony call lifecycle.
- Webhook signature verification and idempotent inserts (webhookIdempotencyKey unique index).
- Dead-letter queue for failed jobs; alerting when retries exhaust.
- PII minimization: store recording URLs, not blobs; signed fetch on demand.

## 8) UX surfaces (initial)
- Provider setup & health: form for Twilio SID/Auth Token; show verified numbers and buy/link flow.
- Numbers: pool management, locale tagging, spam-score badges, release button.
- Campaigns: wizard (lists, dialing mode, local presence, script, voicemail, throttle, quiet hours, dispositions).
- Dialer: next-contact queue, script panel, call controls, voicemail drop, disposition buttons, SMS follow-up drawer, timeline of prior touches.
- Compliance: DNC upload, quiet hours, recording policy toggles, SMS opt-out keywords.
- Reporting: cards for attempts/connects/connect rate/talk time; tables by agent; export CSV.

## 9) Rollout plan (cheap-first)
- Phase 0: Telephony adapter + Twilio driver + webhook ingress + DB tables.
- Phase 1: Provider setup UI + number pool + campaign builder + dialer MVP (preview mode, dispositions, voicemail drop).
- Phase 2: Reporting basics + SMS follow-ups + callbacks scheduling.
- Phase 3: Compliance hardening (DNC import, quiet hours enforcement, recording notice) + Telnyx adapter.

## 10) Next steps to implement
- Scaffold adapter interface/types and Twilio driver in `app/api/telephony/` and shared lib.
- Add DB schema migrations for entities above; wire Prisma/ORM models if present.
- Build webhook route with signature verification + idempotency + Redis enqueue.
- Ship provider setup + number pool UI; then campaign builder and dialer workspace.
- Add reporting queries and a minimal dashboard; layer compliance checks into call start action.
