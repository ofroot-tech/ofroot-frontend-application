import {
  ClinicSuccessContractError,
  createLifecycleEventSignature,
  createSignedReferralUrl,
  verifyLifecycleEventRequest,
  verifyReferralToken,
} from '../app/lib/clinic-success/security';
import {
  CLINIC_SUCCESS_CONTRACT_VERSION,
  type LifecycleEventEnvelope,
  type ReferralTokenPayload,
} from '../app/lib/clinic-success/contract';

const secret = 'technology-test-secret-that-is-at-least-thirty-two-bytes';
const now = new Date('2026-07-28T12:00:00.000Z');
const clinicId = '11111111-1111-4111-8111-111111111111';
const referralId = '22222222-2222-4222-8222-222222222222';
const eventId = '33333333-3333-4333-8333-333333333333';

const referralPayload: ReferralTokenPayload = {
  schema_version: CLINIC_SUCCESS_CONTRACT_VERSION,
  key_id: 'technology-referrals-2026-07',
  clinic_id: clinicId,
  clinic_referral_id: referralId,
  expires_at: '2026-07-29T12:00:00.000Z',
  return_url: 'https://ofroot.technology/clinic-success/referrals',
};

const event: LifecycleEventEnvelope = {
  event_id: eventId,
  event_type: 'clinic_referral.activated',
  clinic_id: clinicId,
  clinic_referral_id: referralId,
  occurred_at: '2026-07-28T11:59:30.000Z',
  schema_version: CLINIC_SUCCESS_CONTRACT_VERSION,
};

function signedEvent(overrides: Partial<LifecycleEventEnvelope> = {}) {
  const body = JSON.stringify({ ...event, ...overrides });
  const timestamp = String(Math.floor(now.getTime() / 1000));
  return {
    body,
    headers: {
      'X-OfRoot-Event-ID': String(overrides.event_id ?? event.event_id),
      'X-OfRoot-Signature': createLifecycleEventSignature({ rawBody: body, timestamp, secret }),
      'X-OfRoot-Timestamp': timestamp,
      'X-OfRoot-Version': CLINIC_SUCCESS_CONTRACT_VERSION,
    },
  };
}

describe('Clinic Success referral signing', () => {
  it('creates an opaque signed URL containing only the minimal referral contract', () => {
    const url = new URL(createSignedReferralUrl({
      healthClaimUrl: 'https://ofroot.health/clinic-referral',
      payload: referralPayload,
      secret,
    }));

    expect(url.search).toBe('');
    expect(url.hash).toMatch(/^#referral=/);
    const fragment = new URLSearchParams(url.hash.slice(1));
    const parsed = verifyReferralToken({
      token: fragment.get('referral')!,
      secret,
      now,
    });
    expect(parsed).toEqual(referralPayload);
    expect(JSON.stringify(parsed)).not.toMatch(/diagnosis|symptom|medication|report_content/i);
  });

  it('rejects tampered and expired referral tokens', () => {
    const url = new URL(createSignedReferralUrl({
      healthClaimUrl: 'https://ofroot.health/clinic-referral',
      payload: referralPayload,
      secret,
    }));
    const token = new URLSearchParams(url.hash.slice(1)).get('referral')!;

    expect(() => verifyReferralToken({ token: `${token}x`, secret, now }))
      .toThrow(expect.objectContaining({ code: 'invalid_signature' }));
    expect(() => verifyReferralToken({
      token,
      secret,
      now: new Date('2026-07-30T12:00:00.000Z'),
    })).toThrow(expect.objectContaining({ code: 'token_expired' }));
  });
});

describe('Clinic Success event authentication', () => {
  it.each([
    'clinic_referral.account_created',
    'clinic_referral.activated',
  ] as const)('accepts the approved %s lifecycle milestone', (eventType) => {
    const request = signedEvent({ event_type: eventType });
    expect(verifyLifecycleEventRequest({
      rawBody: request.body,
      headers: request.headers,
      secret,
      now,
    }).event.event_type).toBe(eventType);
  });

  it('verifies raw-body HMAC, timestamp, version, and matching event ID', () => {
    const request = signedEvent();
    const result = verifyLifecycleEventRequest({
      rawBody: request.body,
      headers: request.headers,
      secret,
      now,
    });

    expect(result.event).toEqual(event);
    expect(result.rawBodySha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it('rejects altered, stale, replay-window, and version-invalid input', () => {
    const request = signedEvent();
    expect(() => verifyLifecycleEventRequest({
      rawBody: `${request.body} `,
      headers: request.headers,
      secret,
      now,
    })).toThrow(expect.objectContaining({ code: 'invalid_signature' }));

    expect(() => verifyLifecycleEventRequest({
      rawBody: request.body,
      headers: { ...request.headers, 'X-OfRoot-Timestamp': '1785239000' },
      secret,
      now,
    })).toThrow(expect.objectContaining({ code: 'stale_event' }));

    expect(() => verifyLifecycleEventRequest({
      rawBody: request.body,
      headers: { ...request.headers, 'X-OfRoot-Version': '2.0' },
      secret,
      now,
    })).toThrow(expect.objectContaining({ code: 'unsupported_version' }));
  });

  it('rejects health-bearing or otherwise unknown payload fields', () => {
    const body = JSON.stringify({ ...event, symptoms: ['private'] });
    const timestamp = String(Math.floor(now.getTime() / 1000));
    const headers = {
      'X-OfRoot-Event-ID': event.event_id,
      'X-OfRoot-Signature': createLifecycleEventSignature({ rawBody: body, timestamp, secret }),
      'X-OfRoot-Timestamp': timestamp,
      'X-OfRoot-Version': CLINIC_SUCCESS_CONTRACT_VERSION,
    };

    try {
      verifyLifecycleEventRequest({ rawBody: body, headers, secret, now });
      throw new Error('Expected contract rejection');
    } catch (error) {
      expect(error).toBeInstanceOf(ClinicSuccessContractError);
      expect((error as ClinicSuccessContractError).code).toBe('invalid_event');
    }
  });

  it('rejects a header/body event ID mismatch before persistence', () => {
    const request = signedEvent();
    expect(() => verifyLifecycleEventRequest({
      rawBody: request.body,
      headers: {
        ...request.headers,
        'X-OfRoot-Event-ID': '44444444-4444-4444-8444-444444444444',
      },
      secret,
      now,
    })).toThrow(expect.objectContaining({ code: 'invalid_event' }));
  });
});
