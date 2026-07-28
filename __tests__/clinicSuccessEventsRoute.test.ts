import { NextRequest } from 'next/server';
import { createLifecycleEventSignature } from '../app/lib/clinic-success/security';
import { CLINIC_SUCCESS_CONTRACT_VERSION } from '../app/lib/clinic-success/contract';
import {
  CLINIC_SUCCESS_DATABASE_URL_ENV,
  CLINIC_SUCCESS_EVENT_HMAC_SECRET_V1_ENV,
} from '../app/lib/clinic-success/config';
import { ingestClinicSuccessEvent } from '../app/lib/clinic-success/store';
import { POST } from '../app/api/clinic-success/events/route';

jest.mock('../app/lib/clinic-success/store', () => {
  const actual = jest.requireActual('../app/lib/clinic-success/store');
  return {
    ...actual,
    ingestClinicSuccessEvent: jest.fn(),
  };
});

const mockedIngest = jest.mocked(ingestClinicSuccessEvent);
const secret = 'technology-event-secret-that-is-at-least-thirty-two-bytes';
const technologyDatabaseUrl = [
  'postgresql://postgres.mkgycihcekojbvmsexgv:password',
  '@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
].join('');

const event = {
  event_id: '33333333-3333-4333-8333-333333333333',
  event_type: 'clinic_referral.activated' as const,
  clinic_id: '11111111-1111-4111-8111-111111111111',
  clinic_referral_id: '22222222-2222-4222-8222-222222222222',
  occurred_at: new Date().toISOString(),
  schema_version: CLINIC_SUCCESS_CONTRACT_VERSION,
};

function signedRequest(payload: Record<string, unknown> = event): NextRequest {
  const rawBody = JSON.stringify(payload);
  const timestamp = String(Math.floor(Date.now() / 1000));
  return new NextRequest('https://www.ofroot.technology/api/clinic-success/events', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ofroot-event-id': String(payload.event_id ?? event.event_id),
      'x-ofroot-signature': createLifecycleEventSignature({ rawBody, timestamp, secret }),
      'x-ofroot-timestamp': timestamp,
      'x-ofroot-version': CLINIC_SUCCESS_CONTRACT_VERSION,
    },
    body: rawBody,
  });
}

describe('POST /api/clinic-success/events', () => {
  const originalEnvironment = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnvironment,
      [CLINIC_SUCCESS_DATABASE_URL_ENV]: technologyDatabaseUrl,
      [CLINIC_SUCCESS_EVENT_HMAC_SECRET_V1_ENV]: secret,
    };
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = originalEnvironment;
  });

  it('accepts a valid signed event and passes only verified data to persistence', async () => {
    mockedIngest.mockResolvedValue({
      accepted: true,
      duplicate: false,
      eventId: event.event_id,
    });

    const response = await POST(signedRequest());
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({
      ok: true,
      data: {
        accepted: true,
        duplicate: false,
        event_id: event.event_id,
      },
    });
    expect(mockedIngest).toHaveBeenCalledWith(expect.objectContaining({
      databaseUrl: technologyDatabaseUrl,
      event,
      rawBodySha256: expect.stringMatching(/^[0-9a-f]{64}$/),
    }));
  });

  it('returns an idempotent success for an already persisted identical event', async () => {
    mockedIngest.mockResolvedValue({
      accepted: true,
      duplicate: true,
      eventId: event.event_id,
    });

    const response = await POST(signedRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      data: {
        accepted: true,
        duplicate: true,
        event_id: event.event_id,
      },
    });
  });

  it('rejects a bad signature before persistence', async () => {
    const request = signedRequest();
    request.headers.set('x-ofroot-signature', `v1=${'0'.repeat(64)}`);

    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(mockedIngest).not.toHaveBeenCalled();
  });

  it('rejects health-bearing fields before persistence', async () => {
    const request = signedRequest({ ...event, symptoms: ['private'] });

    const response = await POST(request);
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      ok: false,
      error: { code: 'invalid_event' },
    });
    expect(mockedIngest).not.toHaveBeenCalled();
  });

  it('fails closed when the database URL is not explicitly bound to Technology', async () => {
    process.env[CLINIC_SUCCESS_DATABASE_URL_ENV] =
      'postgresql://postgres.jbbqpztlqsernvhkztbw:password@db.jbbqpztlqsernvhkztbw.supabase.co/postgres';

    const response = await POST(signedRequest());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      ok: false,
      error: { code: 'receiver_unavailable' },
    });
    expect(mockedIngest).not.toHaveBeenCalled();
  });
});
