export const HOUSTON_AC_OFFER = {
  id: 'houston_rental_ac_sprint',
  name: 'Houston Rental A/C & Maintenance Control Sprint',
  path: '/solutions/houston-rental-ac-maintenance-sprint',
  bookingId: 'workflow-review',
  cta: 'Book a 20-minute workflow review',
  events: {
    view: 'houston_ac_sprint_viewed',
    cta: 'houston_ac_review_cta_clicked',
    start: 'houston_ac_review_form_started',
    submit: 'houston_ac_review_request_submitted',
  },
} as const;

export const HOUSTON_AC_ROLES = {
  hvac: 'HVAC contractor',
  property_manager: 'Property manager or owner',
} as const;

export const HOUSTON_AC_FIELD_LIMITS = {
  company: 120,
  email: 254,
  size: 100_000,
  software: 180,
  bottleneck: 800,
} as const;
