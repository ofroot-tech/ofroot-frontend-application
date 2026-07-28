# Decisions

## Decision: Keep the pilot public page Technology-only
- Date: 2026-07-28
- Status: accepted
- Context: The approved contract separates Technology clinic-growth work from Health patient data.
- Decision: The page will discuss referral links, aggregate operations, and the requirement for separate approval before any Health-data access. It will not include patient accounts, patient records, or a dashboard backed by patient-level data.
- Evidence: User-provided shared contract and focused repository audit found no existing Clinic Success public route.

## Decision: Use a standalone page with the existing public design language
- Date: 2026-07-28
- Status: accepted
- Context: The existing `GrowthPage` is suitable for standard service content but cannot clearly express the pilot's explicit data boundary and service phases without overloading its generic content contract.
- Decision: Build `app/clinic-success/page.tsx` using existing colors, typography, CTA tracking, metadata patterns, and schema conventions; update only page discovery surfaces required for the route.
- Evidence: `components/growth/GrowthPage.tsx`, `app/lib/growth-content.ts`, `app/sitemap.ts`, and LLM routes.
