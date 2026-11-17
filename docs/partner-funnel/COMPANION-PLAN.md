# Engineering Companion: separate Phase A plan

Build after the partner funnel has been reviewed. Use one internal synthetic tenant and a second adversarial test tenant. No customer data, external AI provider, issue-tracker connection, deployment agent or commercial commitment.

1. Define canonical tenant/user/request IDs independent of slugs. Reserve names; do not configure DNS in the prototype.
2. Implement sign-in fixtures and server-side requester/approver/OfRoot engineer/admin checks. Every read and mutation must include the authenticated tenant; test cross-tenant IDs, uploads, exports and revoked users.
3. Build Feature/Bug/Integration/Question/Change intake with editable objective, current/desired behavior, impact, constraints and acceptance criteria. Start with scripted clarification and an explicit manual fallback.
4. Save durable draft/submitted request IDs, revisions and append-only history. Keep client scope approval separate from OfRoot acceptance. No generated quote or deadline becomes binding.
5. Add bounded synthetic prompt evaluation, untrusted-document handling and a provider adapter disabled by default. Record model/version, token/cost estimate and corrections without logging private request content.
6. Enforce per-request/token/time budgets, tenant cost caps, bounded retries and duplicate protection. Failed AI runs preserve manual drafts; retries never duplicate submitted requests.
7. Provide reviewed, sanitized manual JSON/Markdown export. Prohibit shell execution, code merges, deployments and external notifications.
8. Verify permissions, persistence, correction/retry, AI unavailable, malicious document text, accessibility and responsive use. Review security, privacy, retention, subprocessors, region and recovery before choosing a consenting pilot.

Pilot gates: founder-selected customer; signed permission; approved provider terms; data region/retention/deletion; incident process; backups/restore; costs and support burden measured. Multi-tenant launch, SSO and custom domains remain later phases.
