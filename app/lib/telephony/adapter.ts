/**
 * # Telephony adapter registry (literate scaffold)
 *
 * We keep the abstraction thin and documented so that tenants can plug in their
 * preferred provider while the rest of the app speaks in normalized events and
 * simple capability flags. Twilio is the first provider; others can be added by
 * implementing the same surface.
 */
import { createTwilioAdapter, type TwilioAdapterConfig } from './twilio';

export type TelephonyProvider = 'twilio';

export type TelephonyCapabilities = {
  supportsVoice: boolean;
  supportsMessaging: boolean;
  supportsLocalPresence: boolean;
  supportsVoicemailDrop: boolean;
};

export type PlaceCallInput = {
  to: string;
  from: string;
  campaignId?: string;
  sessionId?: string;
  metadata?: Record<string, string>;
};

export type PlaceCallResult = {
  externalId: string;
  status: 'queued' | 'initiated' | 'not-configured';
};

export type WebhookContext = {
  url: string;
  rawBody: string;
  headers: Record<string, string>;
  body: Record<string, any>;
  contentType: string;
};

export type NormalizedWebhookEvent = {
  provider: TelephonyProvider;
  externalId: string;
  type: 'call.ringing' | 'call.answered' | 'call.completed' | 'call.failed' | 'recording.available';
  payload: Record<string, any>;
};

export type TelephonyAdapter = {
  provider: TelephonyProvider;
  capabilities: TelephonyCapabilities;
  voice: {
    initiateCall(input: PlaceCallInput): Promise<PlaceCallResult>;
    hangUp(sessionExternalId: string): Promise<{ ok: boolean }>;
    dropVoicemail(sessionExternalId: string, assetUrl?: string): Promise<{ ok: boolean }>;
  };
  numbers: {
    pickLocalPresenceNumber(candidateAreaCodes: string[]): Promise<{ from: string | null }>;
  };
  messaging: {
    sendSms(params: { to: string; from: string; body: string }): Promise<{ ok: boolean; externalId?: string }>;
  };
  webhooks: {
    verifySignature(ctx: WebhookContext): Promise<boolean>;
    normalizeEvent(ctx: WebhookContext): Promise<NormalizedWebhookEvent | null>;
  };
};

export type AdapterResolution = {
  provider?: TelephonyProvider;
  tenantId?: string;
};

/**
 * Resolve the right adapter for a tenant. For now we read from environment
 * variables to keep the scaffold cheap; later this should load encrypted
 * provider credentials stored per tenant.
 */
export async function resolveAdapter(ctx: AdapterResolution): Promise<TelephonyAdapter> {
  const provider = ctx.provider ?? 'twilio';

  if (provider === 'twilio') {
    const config: TwilioAdapterConfig = {
      accountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
      authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
      voiceCallbackUrl: process.env.TWILIO_VOICE_WEBHOOK_URL,
      statusCallbackUrl: process.env.TWILIO_STATUS_WEBHOOK_URL,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
    };

    if (!config.accountSid || !config.authToken) {
      throw new Error('Twilio credentials are not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
    }

    return createTwilioAdapter(config);
  }

  throw new Error(`Unsupported telephony provider: ${provider}`);
}
