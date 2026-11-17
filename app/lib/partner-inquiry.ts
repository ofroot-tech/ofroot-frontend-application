import { z } from 'zod';

export const PARTNER_CONSENT_VERSION = 'partner-inquiry-2026-11-16';
export const partnerTypes = ['staffing', 'consultancy', 'direct', 'other'] as const;
export const engineeringNeeds = ['embedded', 'managed', 'project'] as const;
export const startTimeframes = ['within-month', 'one-three-months', 'planning', 'unsure'] as const;

const attributionValue = z.string().trim().max(100).regex(/^[a-zA-Z0-9_.:/ -]*$/);
export const partnerInquirySchema = z.object({
  requestId: z.uuid(),
  name: z.string().trim().min(1).max(100),
  email: z.email().max(254).transform(value => value.toLowerCase()),
  company: z.string().trim().min(1).max(160),
  partnerType: z.enum(partnerTypes),
  need: z.enum(engineeringNeeds),
  description: z.string().trim().min(20).max(3000),
  timeframe: z.enum(startTimeframes),
  budget: z.string().trim().max(120).default(''),
  consent: z.literal(true),
  website: z.string().max(200).default(''), // Honeypot, not a company URL.
  attribution: z.object({
    source: attributionValue.default(''),
    medium: attributionValue.default(''),
    campaign: attributionValue.default(''),
  }).strict(),
}).strict();

export type PartnerInquiry = z.infer<typeof partnerInquirySchema>;

export class PartnerInquiryError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

/** Campaign labels go to the restricted CRM record, never to analytics hooks.
 * Full referrer URLs, query strings and free-form source fields are excluded. */
export function partnerAttribution(params: URLSearchParams) {
  const label = (key: string) => {
    const value = (params.get(key) || '').slice(0, 100);
    return /^[a-zA-Z0-9_.:/ -]*$/.test(value) && !value.includes('://') ? value : '';
  };
  return { source: label('utm_source'), medium: label('utm_medium'), campaign: label('utm_campaign') };
}
