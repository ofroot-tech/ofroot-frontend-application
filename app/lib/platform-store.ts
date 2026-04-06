import { Pool } from 'pg';
import { PLATFORM_EDITIONS, PLATFORM_EDITION_CATALOG, type PlatformEdition } from '@/app/lib/platform-access';

function dbUrl(): string {
  return process.env.DATABASE_URL || process.env.DIRECT_URL || '';
}

declare global {
  // eslint-disable-next-line no-var
  var __ofrootPlatformDbPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __ofrootPlatformDbReadyPromise: Promise<void> | undefined;
}

function toNum(value: unknown): number {
  if (typeof value === 'number') return value;
  return Number.parseInt(String(value || 0), 10) || 0;
}

function getPool(): Pool {
  const url = dbUrl();
  if (!url) throw Object.assign(new Error('DATABASE_URL is not configured'), { status: 503 });

  if (!global.__ofrootPlatformDbPool) {
    global.__ofrootPlatformDbPool = new Pool({
      connectionString: url,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
    });
  }

  return global.__ofrootPlatformDbPool;
}

export type TenantFeatureState = {
  tenant_id: number;
  feature_key: string;
  enabled: boolean;
  updated_at: string;
};

export type ReviewRequestStatus = 'draft' | 'sent' | 'completed' | 'dismissed';
export type ReviewRequestSource = 'manual' | 'invoice_paid' | 'payment_event' | 'workflow';

export type ReviewRequestRecord = {
  id: number;
  tenant_id: number | null;
  contact_id: number | null;
  invoice_id: number | null;
  payment_id: number | null;
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  source: ReviewRequestSource;
  status: ReviewRequestStatus;
  review_url: string | null;
  notes: string | null;
  sent_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

const SHARED_PLATFORM_FEATURES = ['crm_lifecycle', 'workflow_engine_mvp'] as const;

export function listDefaultFeatureKeysForEdition(edition: PlatformEdition): string[] {
  return Array.from(
    new Set([
      `edition_${edition}`,
      ...PLATFORM_EDITION_CATALOG[edition].featureKeys,
      ...SHARED_PLATFORM_FEATURES,
    ])
  );
}

export async function ensurePlatformSchema(): Promise<void> {
  if (!global.__ofrootPlatformDbReadyPromise) {
    global.__ofrootPlatformDbReadyPromise = (async () => {
      const pool = getPool();

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_tenant_features (
          id BIGSERIAL PRIMARY KEY,
          tenant_id BIGINT NOT NULL,
          feature_key TEXT NOT NULL,
          enabled BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (tenant_id, feature_key)
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_review_requests (
          id BIGSERIAL PRIMARY KEY,
          tenant_id BIGINT NULL,
          contact_id BIGINT NULL,
          invoice_id BIGINT NULL,
          payment_id BIGINT NULL,
          recipient_name TEXT NULL,
          recipient_email TEXT NULL,
          recipient_phone TEXT NULL,
          source TEXT NOT NULL DEFAULT 'manual',
          status TEXT NOT NULL DEFAULT 'draft',
          review_url TEXT NULL,
          notes TEXT NULL,
          sent_at TIMESTAMPTZ NULL,
          completed_at TIMESTAMPTZ NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (invoice_id, recipient_email)
        );
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_tenant_features_tenant
        ON ofroot_tenant_features(tenant_id, feature_key);
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_review_requests_tenant
        ON ofroot_review_requests(tenant_id, created_at DESC);
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_review_requests_invoice
        ON ofroot_review_requests(invoice_id);
      `);
    })();
  }

  await global.__ofrootPlatformDbReadyPromise;
}

function mapFeatureRow(row: any): TenantFeatureState {
  return {
    tenant_id: toNum(row.tenant_id),
    feature_key: String(row.feature_key || '').trim().toLowerCase(),
    enabled: Boolean(row.enabled),
    updated_at: String(row.updated_at),
  };
}

function mapReviewRequestRow(row: any): ReviewRequestRecord {
  return {
    id: toNum(row.id),
    tenant_id: row.tenant_id == null ? null : toNum(row.tenant_id),
    contact_id: row.contact_id == null ? null : toNum(row.contact_id),
    invoice_id: row.invoice_id == null ? null : toNum(row.invoice_id),
    payment_id: row.payment_id == null ? null : toNum(row.payment_id),
    recipient_name: row.recipient_name || null,
    recipient_email: row.recipient_email || null,
    recipient_phone: row.recipient_phone || null,
    source: (row.source || 'manual') as ReviewRequestSource,
    status: (row.status || 'draft') as ReviewRequestStatus,
    review_url: row.review_url || null,
    notes: row.notes || null,
    sent_at: row.sent_at || null,
    completed_at: row.completed_at || null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function listTenantFeatureStates(tenantId: number): Promise<TenantFeatureState[]> {
  await ensurePlatformSchema();
  const pool = getPool();
  const result = await pool.query(
    `
      SELECT tenant_id, feature_key, enabled, updated_at
      FROM ofroot_tenant_features
      WHERE tenant_id = $1
      ORDER BY feature_key ASC
    `,
    [tenantId]
  );

  return result.rows.map(mapFeatureRow);
}

export async function listEnabledFeatureKeysForTenant(tenantId: number | null | undefined): Promise<string[]> {
  if (tenantId == null) return [];
  const rows = await listTenantFeatureStates(tenantId);
  return rows.filter((row) => row.enabled).map((row) => row.feature_key);
}

export async function setTenantFeatureEnabled(tenantId: number, featureKey: string, enabled: boolean): Promise<void> {
  await ensurePlatformSchema();
  const pool = getPool();
  const normalized = String(featureKey || '').trim().toLowerCase();
  if (!normalized) throw new Error('feature key is required');

  await pool.query(
    `
      INSERT INTO ofroot_tenant_features (tenant_id, feature_key, enabled)
      VALUES ($1, $2, $3)
      ON CONFLICT (tenant_id, feature_key)
      DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = NOW()
    `,
    [tenantId, normalized, enabled]
  );
}

export async function setTenantFeaturesEnabled(tenantId: number, featureKeys: string[], enabled: boolean): Promise<void> {
  for (const featureKey of featureKeys) {
    await setTenantFeatureEnabled(tenantId, featureKey, enabled);
  }
}

export async function enableEditionForTenant(tenantId: number, edition: PlatformEdition): Promise<void> {
  await setTenantFeaturesEnabled(tenantId, listDefaultFeatureKeysForEdition(edition), true);
}

export function listManageableFeatureKeys(): string[] {
  return Array.from(
    new Set([
      ...SHARED_PLATFORM_FEATURES,
      ...PLATFORM_EDITIONS.flatMap((edition) => listDefaultFeatureKeysForEdition(edition)),
      'competitive_analysis',
      'quotes',
      'payments',
      'jobs',
      'reviews',
    ])
  ).sort();
}

export async function createOrUpdateReviewRequest(input: {
  tenant_id?: number | null;
  contact_id?: number | null;
  invoice_id?: number | null;
  payment_id?: number | null;
  recipient_name?: string | null;
  recipient_email?: string | null;
  recipient_phone?: string | null;
  source?: ReviewRequestSource;
  status?: ReviewRequestStatus;
  review_url?: string | null;
  notes?: string | null;
  markSent?: boolean;
  markCompleted?: boolean;
}): Promise<ReviewRequestRecord> {
  await ensurePlatformSchema();
  const pool = getPool();

  const result = await pool.query(
    `
      INSERT INTO ofroot_review_requests (
        tenant_id,
        contact_id,
        invoice_id,
        payment_id,
        recipient_name,
        recipient_email,
        recipient_phone,
        source,
        status,
        review_url,
        notes,
        sent_at,
        completed_at
      )
      VALUES ($1, $2, $3, $4, $5, LOWER(NULLIF($6, '')), NULLIF($7, ''), $8, $9, $10, $11, $12, $13)
      ON CONFLICT (invoice_id, recipient_email)
      DO UPDATE SET
        tenant_id = EXCLUDED.tenant_id,
        contact_id = COALESCE(EXCLUDED.contact_id, ofroot_review_requests.contact_id),
        payment_id = COALESCE(EXCLUDED.payment_id, ofroot_review_requests.payment_id),
        recipient_name = COALESCE(EXCLUDED.recipient_name, ofroot_review_requests.recipient_name),
        recipient_phone = COALESCE(EXCLUDED.recipient_phone, ofroot_review_requests.recipient_phone),
        source = EXCLUDED.source,
        status = EXCLUDED.status,
        review_url = COALESCE(EXCLUDED.review_url, ofroot_review_requests.review_url),
        notes = COALESCE(EXCLUDED.notes, ofroot_review_requests.notes),
        sent_at = COALESCE(EXCLUDED.sent_at, ofroot_review_requests.sent_at),
        completed_at = COALESCE(EXCLUDED.completed_at, ofroot_review_requests.completed_at),
        updated_at = NOW()
      RETURNING *
    `,
    [
      input.tenant_id ?? null,
      input.contact_id ?? null,
      input.invoice_id ?? null,
      input.payment_id ?? null,
      input.recipient_name || null,
      input.recipient_email || null,
      input.recipient_phone || null,
      input.source || 'manual',
      input.status || 'draft',
      input.review_url || null,
      input.notes || null,
      input.markSent ? new Date().toISOString() : null,
      input.markCompleted ? new Date().toISOString() : null,
    ]
  );

  return mapReviewRequestRow(result.rows[0]);
}

export async function listReviewRequests(opts?: {
  tenant_id?: number | null;
  status?: ReviewRequestStatus | null;
  invoice_id?: number | null;
}): Promise<ReviewRequestRecord[]> {
  await ensurePlatformSchema();
  const pool = getPool();
  const where: string[] = [];
  const args: unknown[] = [];

  if (opts?.tenant_id != null) {
    args.push(opts.tenant_id);
    where.push(`tenant_id = $${args.length}`);
  }
  if (opts?.status) {
    args.push(opts.status);
    where.push(`status = $${args.length}`);
  }
  if (opts?.invoice_id != null) {
    args.push(opts.invoice_id);
    where.push(`invoice_id = $${args.length}`);
  }

  const result = await pool.query(
    `
      SELECT *
      FROM ofroot_review_requests
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY created_at DESC
      LIMIT 250
    `,
    args
  );

  return result.rows.map(mapReviewRequestRow);
}

export async function getReviewRequestByInvoice(invoiceId: number): Promise<ReviewRequestRecord | null> {
  const items = await listReviewRequests({ invoice_id: invoiceId });
  return items[0] || null;
}

export async function updateReviewRequestStatus(id: number, status: ReviewRequestStatus): Promise<ReviewRequestRecord | null> {
  await ensurePlatformSchema();
  const pool = getPool();
  const result = await pool.query(
    `
      UPDATE ofroot_review_requests
      SET status = $2,
          sent_at = CASE WHEN $2 = 'sent' AND sent_at IS NULL THEN NOW() ELSE sent_at END,
          completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, status]
  );

  return result.rows[0] ? mapReviewRequestRow(result.rows[0]) : null;
}
