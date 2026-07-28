import type { PoolClient } from 'pg';
import {
  ClinicSuccessPersistenceError,
  persistVerifiedClinicSuccessEvent,
} from '../app/lib/clinic-success/store';
import {
  CLINIC_SUCCESS_CONTRACT_VERSION,
  type LifecycleEventEnvelope,
} from '../app/lib/clinic-success/contract';

const event: LifecycleEventEnvelope = {
  event_id: '33333333-3333-4333-8333-333333333333',
  event_type: 'clinic_referral.activated',
  clinic_id: '11111111-1111-4111-8111-111111111111',
  clinic_referral_id: '22222222-2222-4222-8222-222222222222',
  occurred_at: '2026-07-28T11:59:30.000Z',
  schema_version: CLINIC_SUCCESS_CONTRACT_VERSION,
};
const rawBodySha256 = 'a'.repeat(64);

type QueryResult = {
  rowCount: number | null;
  rows: Array<Record<string, unknown>>;
};

function queuedClient(results: QueryResult[]) {
  const query = jest.fn(async (_statement: unknown, _values?: unknown[]) => {
    const result = results.shift();
    if (!result) throw new Error('Unexpected query');
    return result;
  });
  return {
    client: { query } as unknown as Pick<PoolClient, 'query'>,
    query,
  };
}

describe('Clinic Success transactional persistence', () => {
  it('records the receipt, lifecycle event, and aggregate exactly once', async () => {
    const { client, query } = queuedClient([
      { rowCount: null, rows: [] },
      { rowCount: 1, rows: [{ event_id: event.event_id }] },
      { rowCount: 1, rows: [] },
      { rowCount: 1, rows: [] },
      { rowCount: null, rows: [] },
    ]);

    await expect(
      persistVerifiedClinicSuccessEvent(client, event, rawBodySha256),
    ).resolves.toEqual({
      accepted: true,
      duplicate: false,
      eventId: event.event_id,
    });

    const statements = query.mock.calls.map(([statement]) => String(statement));
    expect(statements).toHaveLength(5);
    expect(statements[0]).toBe('BEGIN');
    expect(statements[1]).toContain('ON CONFLICT (event_id) DO NOTHING');
    expect(statements[2]).toContain('referral_lifecycle_events');
    expect(statements[3]).toContain('clinic_lifecycle_aggregates');
    expect(statements[4]).toBe('COMMIT');
  });

  it('accepts an identical event retry without incrementing the aggregate', async () => {
    const { client, query } = queuedClient([
      { rowCount: null, rows: [] },
      { rowCount: 0, rows: [] },
      {
        rowCount: 1,
        rows: [{
          clinic_id: event.clinic_id,
          clinic_referral_id: event.clinic_referral_id,
          event_type: event.event_type,
          schema_version: event.schema_version,
          signature_version: 'v1',
          raw_body_sha256: rawBodySha256,
          occurred_at: event.occurred_at,
        }],
      },
      { rowCount: null, rows: [] },
    ]);

    await expect(
      persistVerifiedClinicSuccessEvent(client, event, rawBodySha256),
    ).resolves.toEqual({
      accepted: true,
      duplicate: true,
      eventId: event.event_id,
    });

    const statements = query.mock.calls.map(([statement]) => String(statement));
    expect(statements).toHaveLength(4);
    expect(statements.some((statement) => statement.includes('clinic_lifecycle_aggregates'))).toBe(false);
    expect(statements[3]).toBe('COMMIT');
  });

  it('rolls back when an event ID is reused with different content', async () => {
    const { client, query } = queuedClient([
      { rowCount: null, rows: [] },
      { rowCount: 0, rows: [] },
      {
        rowCount: 1,
        rows: [{
          clinic_id: event.clinic_id,
          clinic_referral_id: event.clinic_referral_id,
          event_type: 'clinic_referral.opened',
          schema_version: event.schema_version,
          signature_version: 'v1',
          raw_body_sha256: 'b'.repeat(64),
          occurred_at: event.occurred_at,
        }],
      },
      { rowCount: null, rows: [] },
    ]);

    await expect(
      persistVerifiedClinicSuccessEvent(client, event, rawBodySha256),
    ).rejects.toEqual(expect.objectContaining<Partial<ClinicSuccessPersistenceError>>({
      code: 'event_id_conflict',
    }));

    expect(query.mock.calls.at(-1)?.[0]).toBe('ROLLBACK');
  });
});
