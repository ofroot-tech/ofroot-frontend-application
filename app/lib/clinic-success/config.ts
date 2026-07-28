const TECHNOLOGY_SUPABASE_PROJECT_REF = 'mkgycihcekojbvmsexgv';
const SECRET_MINIMUM_BYTES = 32;
type Environment = Readonly<Record<string, string | undefined>>;

export const CLINIC_SUCCESS_DATABASE_URL_ENV = 'CLINIC_SUCCESS_DATABASE_URL';
export const CLINIC_SUCCESS_EVENT_HMAC_SECRET_V1_ENV = 'CLINIC_SUCCESS_EVENT_HMAC_SECRET_V1';
export const CLINIC_SUCCESS_REFERRAL_SIGNING_SECRET_V1_ENV =
  'CLINIC_SUCCESS_REFERRAL_SIGNING_SECRET_V1';

export class ClinicSuccessConfigurationError extends Error {
  constructor(
    public readonly code:
      | 'database_not_configured'
      | 'database_target_mismatch'
      | 'hmac_secret_not_configured'
      | 'hmac_secret_too_short'
      | 'referral_secret_not_configured'
      | 'referral_secret_too_short',
    message: string,
  ) {
    super(message);
    this.name = 'ClinicSuccessConfigurationError';
  }
}

export type ClinicSuccessRuntimeConfig = {
  databaseUrl: string;
  eventHmacSecretV1: string;
  eventHmacKeyId: 'v1';
  technologyProjectRef: typeof TECHNOLOGY_SUPABASE_PROJECT_REF;
};

export type ClinicSuccessReferralSigningConfig = {
  referralSigningSecretV1: string;
  referralSigningKeyId: 'v1';
};

function targetsTechnologyProject(databaseUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    return false;
  }

  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    return false;
  }

  const username = decodeURIComponent(parsed.username);
  const targetPattern = new RegExp(
    `(^|[.:-])${TECHNOLOGY_SUPABASE_PROJECT_REF.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[.:-])`,
  );
  return targetPattern.test(parsed.hostname) || targetPattern.test(username);
}

export function getClinicSuccessRuntimeConfig(
  environment: Environment = process.env,
): ClinicSuccessRuntimeConfig {
  const databaseUrl = environment[CLINIC_SUCCESS_DATABASE_URL_ENV]?.trim();
  if (!databaseUrl) {
    throw new ClinicSuccessConfigurationError(
      'database_not_configured',
      `${CLINIC_SUCCESS_DATABASE_URL_ENV} is not configured`,
    );
  }
  if (!targetsTechnologyProject(databaseUrl)) {
    throw new ClinicSuccessConfigurationError(
      'database_target_mismatch',
      `${CLINIC_SUCCESS_DATABASE_URL_ENV} must target the OfRoot Technology Supabase project`,
    );
  }

  const eventHmacSecretV1 = environment[CLINIC_SUCCESS_EVENT_HMAC_SECRET_V1_ENV]?.trim();
  if (!eventHmacSecretV1) {
    throw new ClinicSuccessConfigurationError(
      'hmac_secret_not_configured',
      `${CLINIC_SUCCESS_EVENT_HMAC_SECRET_V1_ENV} is not configured`,
    );
  }
  if (Buffer.byteLength(eventHmacSecretV1, 'utf8') < SECRET_MINIMUM_BYTES) {
    throw new ClinicSuccessConfigurationError(
      'hmac_secret_too_short',
      `${CLINIC_SUCCESS_EVENT_HMAC_SECRET_V1_ENV} must be at least 32 bytes`,
    );
  }

  return {
    databaseUrl,
    eventHmacSecretV1,
    eventHmacKeyId: 'v1',
    technologyProjectRef: TECHNOLOGY_SUPABASE_PROJECT_REF,
  };
}

export function getClinicSuccessReferralSigningConfig(
  environment: Environment = process.env,
): ClinicSuccessReferralSigningConfig {
  const referralSigningSecretV1 =
    environment[CLINIC_SUCCESS_REFERRAL_SIGNING_SECRET_V1_ENV]?.trim();
  if (!referralSigningSecretV1) {
    throw new ClinicSuccessConfigurationError(
      'referral_secret_not_configured',
      `${CLINIC_SUCCESS_REFERRAL_SIGNING_SECRET_V1_ENV} is not configured`,
    );
  }
  if (Buffer.byteLength(referralSigningSecretV1, 'utf8') < SECRET_MINIMUM_BYTES) {
    throw new ClinicSuccessConfigurationError(
      'referral_secret_too_short',
      `${CLINIC_SUCCESS_REFERRAL_SIGNING_SECRET_V1_ENV} must be at least 32 bytes`,
    );
  }
  return {
    referralSigningSecretV1,
    referralSigningKeyId: 'v1',
  };
}
