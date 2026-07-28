import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/lib/logger';
import {
  ClinicSuccessConfigurationError,
  getClinicSuccessRuntimeConfig,
} from '@/app/lib/clinic-success/config';
import {
  ClinicSuccessContractError,
  verifyLifecycleEventRequest,
} from '@/app/lib/clinic-success/security';
import {
  ClinicSuccessPersistenceError,
  ingestClinicSuccessEvent,
} from '@/app/lib/clinic-success/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function errorResponse(error: unknown): NextResponse {
  if (error instanceof ClinicSuccessConfigurationError) {
    logger.error('clinic_success.receiver.configuration_error', { code: error.code });
    return NextResponse.json(
      { ok: false, error: { code: 'receiver_unavailable' } },
      { status: 503 },
    );
  }

  if (error instanceof ClinicSuccessContractError) {
    const status = error.code === 'invalid_signature' ? 401 : 422;
    logger.warn('clinic_success.receiver.contract_rejected', { code: error.code });
    return NextResponse.json(
      { ok: false, error: { code: error.code } },
      { status },
    );
  }

  if (error instanceof ClinicSuccessPersistenceError) {
    const status = error.code === 'event_id_conflict' ? 409 : 503;
    logger.error('clinic_success.receiver.persistence_error', { code: error.code });
    return NextResponse.json(
      { ok: false, error: { code: error.code } },
      { status },
    );
  }

  logger.error('clinic_success.receiver.unexpected_error', {
    errorType: error instanceof Error ? error.name : 'unknown',
  });
  return NextResponse.json(
    { ok: false, error: { code: 'receiver_error' } },
    { status: 500 },
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const config = getClinicSuccessRuntimeConfig();
    const rawBody = await request.text();
    const verified = verifyLifecycleEventRequest({
      rawBody,
      headers: Object.fromEntries(request.headers.entries()),
      secret: config.eventHmacSecretV1,
    });

    const result = await ingestClinicSuccessEvent({
      databaseUrl: config.databaseUrl,
      event: verified.event,
      rawBodySha256: verified.rawBodySha256,
    });

    logger.info('clinic_success.receiver.accepted', {
      eventId: result.eventId,
      eventType: verified.event.event_type,
      clinicId: verified.event.clinic_id,
      duplicate: result.duplicate,
    });
    return NextResponse.json(
      {
        ok: true,
        data: {
          accepted: true,
          duplicate: result.duplicate,
          event_id: result.eventId,
        },
      },
      { status: result.duplicate ? 200 : 202 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
