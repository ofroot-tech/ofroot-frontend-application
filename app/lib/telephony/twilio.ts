/**
 * # Twilio adapter (first-class, cost-aware)
 *
 * This module wraps the Twilio SDK behind the shared telephony interface. The
 * implementation is intentionally slim: we only exercise the primitives needed
 * for the MVP dialer while keeping signature verification and event mapping in
 * one place. Voice calls fall back to a stub when callback URLs are not yet
 * configured so local development stays cheap.
 */
import crypto from 'node:crypto';
import twilio, { validateRequest, validateRequestWithBody } from 'twilio';
import type {
  NormalizedWebhookEvent,
  PlaceCallInput,
  PlaceCallResult,
  TelephonyAdapter,
  WebhookContext,
} from './adapter';

export type TwilioAdapterConfig = {
  accountSid: string;
  authToken: string;
  voiceCallbackUrl?: string;
  statusCallbackUrl?: string;
  messagingServiceSid?: string;
};

function mapStatusToEvent(status: string): NormalizedWebhookEvent['type'] {
  const normalized = status.toLowerCase();
  if (normalized === 'ringing' || normalized === 'queued' || normalized === 'initiated') return 'call.ringing';
  if (normalized === 'in-progress' || normalized === 'answered') return 'call.answered';
  if (normalized === 'completed' || normalized === 'busy' || normalized === 'no-answer') return 'call.completed';
  return 'call.failed';
}

function pickFromHeader(headers: Record<string, string>, key: string) {
  const lowerKey = key.toLowerCase();
  const entry = Object.entries(headers).find(([header]) => header.toLowerCase() === lowerKey);
  return entry ? entry[1] : undefined;
}

export function createTwilioAdapter(config: TwilioAdapterConfig): TelephonyAdapter {
  const client = twilio(config.accountSid, config.authToken, { lazyLoading: true });

  async function initiateCall(input: PlaceCallInput): Promise<PlaceCallResult> {
    if (!config.voiceCallbackUrl) {
      return { externalId: `stub-${crypto.randomUUID()}`, status: 'not-configured' };
    }

    const call = await client.calls.create({
      to: input.to,
      from: input.from,
      url: config.voiceCallbackUrl,
      statusCallback: config.statusCallbackUrl ?? config.voiceCallbackUrl,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['queued', 'initiated', 'ringing', 'answered', 'completed', 'busy', 'failed', 'no-answer'],
      machineDetection: 'Enable',
      record: true,
      recordingStatusCallback: config.statusCallbackUrl ?? config.voiceCallbackUrl,
      recordingStatusCallbackMethod: 'POST',
      recordingStatusCallbackEvent: ['completed'],
    });

    return { externalId: call.sid, status: 'queued' };
  }

  async function hangUp(sessionExternalId: string) {
    await client.calls(sessionExternalId).update({ status: 'completed' });
    return { ok: true };
  }

  async function dropVoicemail(sessionExternalId: string, assetUrl?: string) {
    // Twilio voicemail drop typically uses <Play> within a new outbound leg or
    // <Redirect> to a TwiML bin. We surface the hook but leave the concrete
    // implementation to the forthcoming dialer flow.
    await client.calls(sessionExternalId).update({ url: assetUrl ?? config.voiceCallbackUrl, method: 'POST' });
    return { ok: true };
  }

  async function pickLocalPresenceNumber(candidateAreaCodes: string[]) {
    // Local presence will evolve into a pool-based selector; for now, pick the
    // first verified outgoing number and ignore area codes.
    const numbers = await client.outgoingCallerIds.list({ limit: 5 });
    const first = numbers[0]?.phoneNumber ?? null;
    return { from: first };
  }

  async function sendSms(params: { to: string; from: string; body: string }) {
    const from = params.from || config.messagingServiceSid;
    if (!from) {
      return { ok: false };
    }

    const message = await client.messages.create({
      to: params.to,
      from,
      body: params.body,
      ...(config.messagingServiceSid ? { messagingServiceSid: config.messagingServiceSid } : {}),
    });

    return { ok: true, externalId: message.sid };
  }

  async function verifySignature(ctx: WebhookContext) {
    const signature = pickFromHeader(ctx.headers, 'x-twilio-signature');
    if (!signature) return false;

    const contentType = ctx.contentType.toLowerCase();
    if (contentType.includes('json')) {
      return validateRequestWithBody(config.authToken, signature, ctx.url, ctx.rawBody);
    }

    return validateRequest(config.authToken, signature, ctx.url, ctx.body);
  }

  async function normalizeEvent(ctx: WebhookContext): Promise<NormalizedWebhookEvent | null> {
    const body = ctx.body;
    const externalId = String(body.CallSid || body.CallSid || body.sid || body.callSid || 'unknown');
    const status = String(body.CallStatus || body.callStatus || body.status || 'unknown');
    const type = mapStatusToEvent(status);

    const payload = {
      callStatus: status,
      callSid: externalId,
      recordingSid: body.RecordingSid,
      recordingUrl: body.RecordingUrl,
      to: body.To,
      from: body.From,
      timestamp: body.Timestamp ?? new Date().toISOString(),
    };

    return { provider: 'twilio', externalId, type, payload };
  }

  return {
    provider: 'twilio',
    capabilities: {
      supportsVoice: true,
      supportsMessaging: true,
      supportsLocalPresence: true,
      supportsVoicemailDrop: true,
    },
    voice: { initiateCall, hangUp, dropVoicemail },
    numbers: { pickLocalPresenceNumber },
    messaging: { sendSms },
    webhooks: { verifySignature, normalizeEvent },
  };
}
