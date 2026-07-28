import { z } from 'zod';

export const CLINIC_SUCCESS_CONTRACT_VERSION = '1.0-draft' as const;
export const CLINIC_SUCCESS_SIGNATURE_VERSION = 'v1' as const;

export const REFERRAL_LIFECYCLE_EVENT_TYPES = [
  'clinic_referral.opened',
  'clinic_referral.signup_started',
  'clinic_referral.account_created',
  'clinic_referral.activated',
  'clinic_referral.timeline_viewed',
  'clinic_referral.report_generated',
] as const;

const opaqueId = z.string().uuid();
const secureUrl = z.string().url().superRefine((value, context) => {
  const parsed = new URL(value);
  const localHttp = parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !localHttp) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'URL must use HTTPS' });
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'URL must not contain credentials, query parameters, or a fragment',
    });
  }
});

export const referralTokenPayloadSchema = z.object({
  schema_version: z.literal(CLINIC_SUCCESS_CONTRACT_VERSION),
  key_id: z.string().min(1).max(64),
  clinic_id: opaqueId,
  clinic_referral_id: opaqueId,
  campaign_id: opaqueId.optional(),
  expires_at: z.string().datetime({ offset: true }),
  return_url: secureUrl,
}).strict();

export const lifecycleEventEnvelopeSchema = z.object({
  event_id: opaqueId,
  event_type: z.enum(REFERRAL_LIFECYCLE_EVENT_TYPES),
  clinic_id: opaqueId,
  clinic_referral_id: opaqueId,
  campaign_id: opaqueId.optional(),
  occurred_at: z.string().datetime({ offset: true }),
  schema_version: z.literal(CLINIC_SUCCESS_CONTRACT_VERSION),
}).strict();

export type ReferralTokenPayload = z.infer<typeof referralTokenPayloadSchema>;
export type LifecycleEventEnvelope = z.infer<typeof lifecycleEventEnvelopeSchema>;
export type ReferralLifecycleEventType = LifecycleEventEnvelope['event_type'];
