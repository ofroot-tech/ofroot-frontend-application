# Decisions

## Decision: Keep Automation Build as the implementation authority
- Date: 2026-08-06
- Status: accepted
- Context: The repository already exposes authenticated automation onboarding and delivery progress at `/dashboard/automation-build`.
- Decision: Add `/dashboard/ai-process` as the broader audit-to-ROI journey and link to Automation Build for build details.
- Evidence: `app/dashboard/automation-build/page.tsx` and `app/lib/automation-progress.ts`.

## Decision: Reuse the current attributed audit intake
- Date: 2026-08-06
- Status: accepted
- Context: `/book` persists inquiries through `/api/sales-inquiry` and captures `source` or `focus` as CTA attribution.
- Decision: Send public audit CTAs to `/book?focus=ai-process-audit&source=<section>`.
- Evidence: `app/book/page.tsx` and `components/growth/GrowthAuditForm.tsx`.

## Decision: Static typed client journey for release one
- Date: 2026-08-06
- Status: accepted
- Context: No repository data contract represents audit stages, ROI values, or audit documents.
- Decision: Use typed stage metadata and explicit empty states. Do not infer ROI or audit completion from lead or build status.
- Evidence: `app/lib/automation-progress.ts` only represents automation delivery progress.
