import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import {
  CLINIC_SUCCESS_CONTRACT_VERSION,
  CLINIC_SUCCESS_SIGNATURE_VERSION,
  lifecycleEventEnvelopeSchema,
  referralTokenPayloadSchema,
  type LifecycleEventEnvelope,
  type ReferralTokenPayload,
} from './contract';

const DEFAULT_EVENT_TOLERANCE_SECONDS = 5 * 60;
const MAX_EVENT_BODY_BYTES = 16 * 1024;
const SECRET_MINIMUM_BYTES = 32;

export type ClinicSuccessHeaders = Record<string, string | undefined>;

export class ClinicSuccessContractError extends Error {
  constructor(
    public readonly code:
      | 'invalid_body'
      | 'invalid_event'
      | 'invalid_headers'
      | 'invalid_signature'
      | 'invalid_timestamp'
      | 'invalid_token'
      | 'invalid_url'
      | 'secret_too_short'
      | 'stale_event'
      | 'token_expired'
      | 'unsupported_version',
    message: string,
  ) {
    super(message);
    this.name = 'ClinicSuccessContractError';
  }
}

function secretBuffer(secret: string | Buffer): Buffer {
  const value = Buffer.isBuffer(secret) ? secret : Buffer.from(secret, 'utf8');
  if (value.byteLength < SECRET_MINIMUM_BYTES) {
    throw new ClinicSuccessContractError('secret_too_short', 'Signing secret must be at least 32 bytes');
  }
  return value;
}

function equalText(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left, 'utf8');
  const rightBytes = Buffer.from(right, 'utf8');
  return leftBytes.byteLength === rightBytes.byteLength && timingSafeEqual(leftBytes, rightBytes);
}

function normalizedHeaders(headers: ClinicSuccessHeaders): Map<string, string> {
  return new Map(
    Object.entries(headers)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .map(([name, value]) => [name.toLowerCase(), value.trim()]),
  );
}

function parseUnixTimestamp(value: string): number {
  if (!/^\d{10}$/.test(value)) {
    throw new ClinicSuccessContractError('invalid_timestamp', 'Event timestamp must be Unix seconds');
  }
  const seconds = Number(value);
  if (!Number.isSafeInteger(seconds)) {
    throw new ClinicSuccessContractError('invalid_timestamp', 'Event timestamp is invalid');
  }
  return seconds;
}

export function createReferralToken(params: {
  payload: ReferralTokenPayload;
  secret: string | Buffer;
}): string {
  const payload = referralTokenPayloadSchema.parse(params.payload);
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = createHmac('sha256', secretBuffer(params.secret))
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyReferralToken(params: {
  token: string;
  secret: string | Buffer;
  now?: Date;
}): ReferralTokenPayload {
  const parts = params.token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new ClinicSuccessContractError('invalid_token', 'Referral token format is invalid');
  }
  const [encodedPayload, suppliedSignature] = parts;
  const expectedSignature = createHmac('sha256', secretBuffer(params.secret))
    .update(encodedPayload)
    .digest('base64url');
  if (!equalText(suppliedSignature, expectedSignature)) {
    throw new ClinicSuccessContractError('invalid_signature', 'Referral token signature is invalid');
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    throw new ClinicSuccessContractError('invalid_token', 'Referral token payload is invalid');
  }

  const parsed = referralTokenPayloadSchema.safeParse(decoded);
  if (!parsed.success) {
    throw new ClinicSuccessContractError('invalid_token', 'Referral token payload does not match the contract');
  }
  const now = params.now ?? new Date();
  if (Date.parse(parsed.data.expires_at) <= now.getTime()) {
    throw new ClinicSuccessContractError('token_expired', 'Referral token has expired');
  }
  return parsed.data;
}

export function createSignedReferralUrl(params: {
  healthClaimUrl: string;
  payload: ReferralTokenPayload;
  secret: string | Buffer;
}): string {
  let url: URL;
  try {
    url = new URL(params.healthClaimUrl);
  } catch {
    throw new ClinicSuccessContractError('invalid_url', 'Health claim URL is invalid');
  }
  const localHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !localHttp) || url.username || url.password || url.search || url.hash) {
    throw new ClinicSuccessContractError('invalid_url', 'Health claim URL must be a safe HTTPS URL');
  }
  url.hash = new URLSearchParams({
    referral: createReferralToken({ payload: params.payload, secret: params.secret }),
  }).toString();
  return url.toString();
}

export function createLifecycleEventSignature(params: {
  rawBody: string;
  timestamp: string;
  secret: string | Buffer;
}): string {
  parseUnixTimestamp(params.timestamp);
  const digest = createHmac('sha256', secretBuffer(params.secret))
    .update(`${params.timestamp}.${params.rawBody}`, 'utf8')
    .digest('hex');
  return `${CLINIC_SUCCESS_SIGNATURE_VERSION}=${digest}`;
}

export function verifyLifecycleEventRequest(params: {
  rawBody: string;
  headers: ClinicSuccessHeaders;
  secret: string | Buffer;
  now?: Date;
  toleranceSeconds?: number;
}): { event: LifecycleEventEnvelope; rawBodySha256: string } {
  if (Buffer.byteLength(params.rawBody, 'utf8') > MAX_EVENT_BODY_BYTES) {
    throw new ClinicSuccessContractError('invalid_body', 'Event body exceeds the allowed size');
  }

  const headers = normalizedHeaders(params.headers);
  const eventId = headers.get('x-ofroot-event-id');
  const signature = headers.get('x-ofroot-signature');
  const timestamp = headers.get('x-ofroot-timestamp');
  const version = headers.get('x-ofroot-version');
  if (!eventId || !signature || !timestamp || !version) {
    throw new ClinicSuccessContractError('invalid_headers', 'Required event headers are missing');
  }
  if (version !== CLINIC_SUCCESS_CONTRACT_VERSION) {
    throw new ClinicSuccessContractError('unsupported_version', 'Event contract version is unsupported');
  }

  const timestampSeconds = parseUnixTimestamp(timestamp);
  const nowSeconds = Math.floor((params.now ?? new Date()).getTime() / 1000);
  const toleranceSeconds = params.toleranceSeconds ?? DEFAULT_EVENT_TOLERANCE_SECONDS;
  if (!Number.isInteger(toleranceSeconds) || toleranceSeconds <= 0) {
    throw new ClinicSuccessContractError('invalid_timestamp', 'Event tolerance must be a positive integer');
  }
  if (Math.abs(nowSeconds - timestampSeconds) > toleranceSeconds) {
    throw new ClinicSuccessContractError('stale_event', 'Event timestamp is outside the replay window');
  }

  const expectedSignature = createLifecycleEventSignature({
    rawBody: params.rawBody,
    timestamp,
    secret: params.secret,
  });
  if (!equalText(signature, expectedSignature)) {
    throw new ClinicSuccessContractError('invalid_signature', 'Event signature is invalid');
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(params.rawBody);
  } catch {
    throw new ClinicSuccessContractError('invalid_body', 'Event body must be valid JSON');
  }
  const parsed = lifecycleEventEnvelopeSchema.safeParse(decoded);
  if (!parsed.success) {
    throw new ClinicSuccessContractError('invalid_event', 'Event body does not match the minimal contract');
  }
  if (parsed.data.event_id !== eventId) {
    throw new ClinicSuccessContractError('invalid_event', 'Event ID header does not match the body');
  }
  if (Date.parse(parsed.data.occurred_at) > (nowSeconds + toleranceSeconds) * 1000) {
    throw new ClinicSuccessContractError('invalid_event', 'Event occurrence time is in the future');
  }

  return {
    event: parsed.data,
    rawBodySha256: createHash('sha256').update(params.rawBody, 'utf8').digest('hex'),
  };
}
