import {
  CLINIC_SUCCESS_DATABASE_URL_ENV,
  CLINIC_SUCCESS_EVENT_HMAC_SECRET_V1_ENV,
  CLINIC_SUCCESS_REFERRAL_SIGNING_SECRET_V1_ENV,
  getClinicSuccessReferralSigningConfig,
  getClinicSuccessRuntimeConfig,
} from '../app/lib/clinic-success/config';

const secret = 'technology-clinic-success-secret-at-least-thirty-two-bytes';

describe('Clinic Success server-only configuration', () => {
  it('accepts a serverless pooler URL only when it identifies the Technology project', () => {
    const config = getClinicSuccessRuntimeConfig({
      [CLINIC_SUCCESS_DATABASE_URL_ENV]: [
        'postgresql://postgres.mkgycihcekojbvmsexgv:password',
        '@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
      ].join(''),
      [CLINIC_SUCCESS_EVENT_HMAC_SECRET_V1_ENV]: secret,
    });

    expect(config.technologyProjectRef).toBe('mkgycihcekojbvmsexgv');
    expect(config.eventHmacKeyId).toBe('v1');
  });

  it('rejects a database URL that identifies the Health project', () => {
    expect(() => getClinicSuccessRuntimeConfig({
      [CLINIC_SUCCESS_DATABASE_URL_ENV]:
        'postgresql://postgres.jbbqpztlqsernvhkztbw:password@db.jbbqpztlqsernvhkztbw.supabase.co/postgres',
      [CLINIC_SUCCESS_EVENT_HMAC_SECRET_V1_ENV]: secret,
    })).toThrow(expect.objectContaining({ code: 'database_target_mismatch' }));
  });

  it('defines a separate versioned secret contract for referral-token issuance', () => {
    expect(getClinicSuccessReferralSigningConfig({
      [CLINIC_SUCCESS_REFERRAL_SIGNING_SECRET_V1_ENV]: secret,
    })).toEqual({
      referralSigningSecretV1: secret,
      referralSigningKeyId: 'v1',
    });
  });
});
