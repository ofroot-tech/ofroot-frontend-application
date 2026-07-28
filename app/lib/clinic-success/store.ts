import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import type { LifecycleEventEnvelope } from './contract';

declare global {
  var __ofrootClinicSuccessDbPool: Pool | undefined;
  var __ofrootClinicSuccessDbPoolUrl: string | undefined;
}

type ReceiptRow = QueryResultRow & {
  clinic_id: string;
  clinic_referral_id: string;
  event_type: string;
  schema_version: string;
  signature_version: string;
  raw_body_sha256: string;
  occurred_at: Date | string;
};

export type ClinicSuccessIngestResult = {
  accepted: true;
  duplicate: boolean;
  eventId: string;
};

export class ClinicSuccessPersistenceError extends Error {
  constructor(
    public readonly code: 'event_id_conflict' | 'persistence_failed',
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ClinicSuccessPersistenceError';
  }
}

function getPool(databaseUrl: string): Pool {
  if (
    !global.__ofrootClinicSuccessDbPool
    || global.__ofrootClinicSuccessDbPoolUrl !== databaseUrl
  ) {
    global.__ofrootClinicSuccessDbPool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 3,
    });
    global.__ofrootClinicSuccessDbPoolUrl = databaseUrl;
  }
  return global.__ofrootClinicSuccessDbPool;
}

function sameInstant(left: Date | string, right: string): boolean {
  return new Date(left).getTime() === new Date(right).getTime();
}

function isSameReceipt(
  receipt: ReceiptRow,
  event: LifecycleEventEnvelope,
  rawBodySha256: string,
): boolean {
  return receipt.clinic_id === event.clinic_id
    && receipt.clinic_referral_id === event.clinic_referral_id
    && receipt.event_type === event.event_type
    && receipt.schema_version === event.schema_version
    && receipt.signature_version === 'v1'
    && receipt.raw_body_sha256 === rawBodySha256
    && sameInstant(receipt.occurred_at, event.occurred_at);
}

export async function persistVerifiedClinicSuccessEvent(
  client: Pick<PoolClient, 'query'>,
  event: LifecycleEventEnvelope,
  rawBodySha256: string,
): Promise<ClinicSuccessIngestResult> {
  await client.query('BEGIN');
  try {
    const receiptInsert = await client.query<{ event_id: string }>(
      `
        INSERT INTO clinic_success.referral_event_receipts (
          event_id,
          clinic_id,
          clinic_referral_id,
          event_type,
          schema_version,
          signature_version,
          raw_body_sha256,
          occurred_at
        )
        VALUES ($1, $2, $3, $4, $5, 'v1', $6, $7)
        ON CONFLICT (event_id) DO NOTHING
        RETURNING event_id
      `,
      [
        event.event_id,
        event.clinic_id,
        event.clinic_referral_id,
        event.event_type,
        event.schema_version,
        rawBodySha256,
        event.occurred_at,
      ],
    );

    if (receiptInsert.rowCount === 0) {
      const existing = await client.query<ReceiptRow>(
        `
          SELECT
            clinic_id,
            clinic_referral_id,
            event_type,
            schema_version,
            signature_version,
            raw_body_sha256,
            occurred_at
          FROM clinic_success.referral_event_receipts
          WHERE event_id = $1
        `,
        [event.event_id],
      );
      if (existing.rowCount !== 1 || !isSameReceipt(existing.rows[0], event, rawBodySha256)) {
        throw new ClinicSuccessPersistenceError(
          'event_id_conflict',
          'Event ID is already associated with different immutable content',
        );
      }

      await client.query('COMMIT');
      return { accepted: true, duplicate: true, eventId: event.event_id };
    }

    await client.query(
      `
        INSERT INTO clinic_success.referral_lifecycle_events (
          event_id,
          clinic_id,
          clinic_referral_id,
          event_type,
          occurred_at
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        event.event_id,
        event.clinic_id,
        event.clinic_referral_id,
        event.event_type,
        event.occurred_at,
      ],
    );

    const utcBucketDate = new Date(event.occurred_at).toISOString().slice(0, 10);
    await client.query(
      `
        INSERT INTO clinic_success.clinic_lifecycle_aggregates (
          clinic_id,
          event_type,
          bucket_date,
          event_count,
          last_event_at,
          source_fresh_at
        )
        VALUES ($1, $2, $3, 1, $4, NOW())
        ON CONFLICT (clinic_id, event_type, bucket_date)
        DO UPDATE SET
          event_count = clinic_success.clinic_lifecycle_aggregates.event_count + 1,
          last_event_at = GREATEST(
            clinic_success.clinic_lifecycle_aggregates.last_event_at,
            EXCLUDED.last_event_at
          ),
          source_fresh_at = NOW(),
          updated_at = NOW()
      `,
      [event.clinic_id, event.event_type, utcBucketDate, event.occurred_at],
    );

    await client.query('COMMIT');
    return { accepted: true, duplicate: false, eventId: event.event_id };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof ClinicSuccessPersistenceError) {
      throw error;
    }
    throw new ClinicSuccessPersistenceError(
      'persistence_failed',
      'Clinic Success event persistence failed',
      { cause: error },
    );
  }
}

export async function ingestClinicSuccessEvent(params: {
  databaseUrl: string;
  event: LifecycleEventEnvelope;
  rawBodySha256: string;
}): Promise<ClinicSuccessIngestResult> {
  const client = await getPool(params.databaseUrl).connect();
  try {
    return await persistVerifiedClinicSuccessEvent(
      client,
      params.event,
      params.rawBodySha256,
    );
  } finally {
    client.release();
  }
}
