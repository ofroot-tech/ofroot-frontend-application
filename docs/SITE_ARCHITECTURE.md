# Site Architecture: Home vs. Service Landing Pages

Date: 2025-10-15
Owner: Growth/Marketing + Frontend

## Goals
- Maximize qualified conversions to the $1 trial and audit requests
- Capture SEO traffic across distinct intents ("development automation", "marketing automation", "AI audit", etc.)
- Keep a simple, fast home experience that orients visitors and routes them to the right service

## Services delivery model (product vision)
- Future-state offering includes dedicated account managers and marketers alongside developers.
- Companies can subscribe and then flex capacity by adding service modules over time:
  - Add features (product engineering sprints)
  - Add marketing (landing pages, content, campaigns)
  - Add development (extra capacity for backlogs)
  - Add automation (workflows, integrations, assistants)
- Each account has a primary owner (account manager) coordinating priorities across engineering and marketing.
- Website IA should support this: clear paths to “start” plus callouts that modules can be added later.

## Recommendation
- Home: Broad value, directional routing. Don’t list every detail. Give a clear top value prop, social proof, and 3–5 primary entry points to service pages.
- Dedicated service pages: One page per service (rankable for specific intent), with deep content:
  - Who it’s for, pains solved, outcomes, features, pricing/CTA, FAQs, proof (logos/testimonials/case studies), and a lead magnet (free audit or checklist).
- Avoid a monolithic SPA for all content. Use server-rendered pages (Next.js App Router) for SEO and speed; keep smooth in-page navigation for the home sections if desired.

## Information Architecture
- / (Home): Overall value, social proof, service cards, brief comparison, primary CTA (Start $1 trial) + secondary (Request AI audit).
- /services (Overview): Optional index with all services and comparisons.
- /services/development-automation (Service page)
- /services/marketing-automation (Service page)
- /services/ai-audit (Service page, aligns with free audit capture)
 - /services/add-ons (Optional: describe adding features, marketing, dev, automation)
- /case-studies (Index) and /case-studies/<slug>
- /pricing (Optional detailed plans if needed) → CTA to /subscribe?product=<id>
- /subscribe (Trial flow)
- /onboarding/bluepro (Switch flow stub already present)

## Page contracts (per service)
Inputs:
- Hero: one-liner outcome + subhead (pain → outcome)
- Proof: 1–3 testimonials/logos
- Outcomes: 3 bullets (measurable)
- Features: 5–7 bullets
- CTA: Start $1 trial (links to /subscribe?product=<service>)
- Secondary CTA: Request AI audit or Talk to sales (for Business)
- FAQ: 4–6 items

Success criteria:
- +CTR from Home → Service pages
- +CVR on service CTAs vs. Home generic CTA
- Time on page ≥ 1:30 for service pages

## Routing and SEO
- Unique titles/H1/meta per service.
- Canonicals to the primary URL to prevent cannibalization.
- Internal links: Home → service pages; service pages cross-link where relevant.
- Schema: Product/SoftwareApplication or Service schema where applicable; FAQ schema on service pages.

## Analytics
- Track: home_service_card_click(service), service_cta_click(primary/secondary), audit_request_submitted, subscribe_cta_click(product).
- Attribute: preserve UTM through to /subscribe via query string.

## Implementation notes (Next.js)
- Keep Home light: server component with small client islands (promo banner, view ping).
- Create a `ServiceLandingLayout` and `ServiceHero`, `ServiceProof`, `ServiceFAQ` reusable components.
- Route examples:
  - app/services/development-automation/page.tsx
  - app/services/marketing-automation/page.tsx
  - app/services/ai-audit/page.tsx
- Wire CTAs to `/subscribe?product=<service>` and to the audit dialog where relevant.

## Next steps
1) Create the /services folder and scaffold 2–3 service pages (MVP copy + CTA).
2) Add ServiceCards to Home linking to those pages.
3) Add basic FAQ schema to service pages.
4) Add analytics events listed above.
