import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import type { CreateLeadInput, Lead, User } from '@/app/lib/api';

const SESSION_TTL_DAYS = 30;

type DbUserRow = {
  id: number | string;
  name: string;
  email: string;
  tenant_id: number | string | null;
  plan: string | null;
  billing_cycle: 'monthly' | 'yearly' | null;
  created_at: string;
  updated_at: string;
};

type DbLeadRow = {
  id: number | string;
  tenant_id: number | string | null;
  name: string | null;
  email: string | null;
  phone: string;
  service: string;
  zip: string;
  source: string | null;
  status: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type DbAutomationAbandonmentRow = {
  id: number | string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  stage: string;
  reason: string | null;
  payload: Record<string, unknown> | null;
  first_seen_at: string;
  last_seen_at: string;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
};

type DbAutomationAbandonmentWithLeadRow = DbAutomationAbandonmentRow & {
  lead_id: number | string | null;
  lead_created_at: string | null;
};

type DbAutomationFunnelSummaryRow = {
  total_signups: number | string;
  signups_30d: number | string;
  total_abandons: number | string;
  abandons_30d: number | string;
  abandons_converted: number | string;
};

type DbSalesInquiryRow = {
  id: number | string;
  name: string;
  email: string;
  business_name: string | null;
  business_formation_status: string | null;
  llc_upsell_opportunity: boolean;
  payload: Record<string, unknown> | null;
  created_at: string;
};

type DbFeatureRequestRow = {
  id: number | string;
  user_id: number | string;
  email: string;
  feature_key: string;
  status: string;
  add_on_price_cents: number;
  auto_enrolled: boolean;
  enrollment_started_at: string | null;
  trial_ends_at: string | null;
  review_status: string;
  created_at: string;
  updated_at: string;
};

export type SalesInquiryRecord = {
  id: number;
  name: string;
  email: string;
  business_name: string | null;
  business_formation_status: string | null;
  llc_upsell_opportunity: boolean;
  payload: Record<string, unknown>;
  created_at: string;
};

export type FeatureRequestRecord = {
  id: number;
  user_id: number;
  email: string;
  feature_key: string;
  status: string;
  add_on_price_cents: number;
  auto_enrolled: boolean;
  enrollment_started_at: string | null;
  trial_ends_at: string | null;
  review_status: string;
  created_at: string;
  updated_at: string;
};

export type AutomationAbandonmentRecord = {
  id: number;
  email: string;
  full_name: string | null;
  company_name: string | null;
  stage: string;
  reason: string | null;
  payload: Record<string, unknown> | null;
  first_seen_at: string;
  last_seen_at: string;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
  converted: boolean;
  lead_id: number | null;
  lead_created_at: string | null;
};

export type AutomationFunnelSummary = {
  total_signups: number;
  signups_30d: number;
  total_abandons: number;
  abandons_30d: number;
  abandons_converted: number;
};

function toNum(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return Number.parseInt(String(value), 10) || 0;
}

function mapUser(row: DbUserRow): User {
  return {
    id: toNum(row.id),
    name: row.name,
    email: row.email,
    tenant_id: row.tenant_id == null ? null : toNum(row.tenant_id),
    plan: row.plan,
    billing_cycle: row.billing_cycle,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapLead(row: DbLeadRow): Lead {
  return {
    id: toNum(row.id),
    tenant_id: row.tenant_id == null ? null : toNum(row.tenant_id),
    name: row.name,
    email: row.email,
    phone: row.phone,
    service: row.service,
    zip: row.zip,
    source: row.source,
    status: row.status || 'new',
    meta: row.meta || {},
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapAutomationAbandonment(row: DbAutomationAbandonmentWithLeadRow): AutomationAbandonmentRecord {
  const leadId = row.lead_id == null ? null : toNum(row.lead_id);
  return {
    id: toNum(row.id),
    email: row.email,
    full_name: row.full_name,
    company_name: row.company_name,
    stage: row.stage,
    reason: row.reason,
    payload: row.payload || {},
    first_seen_at: row.first_seen_at,
    last_seen_at: row.last_seen_at,
    notified_at: row.notified_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    converted: leadId != null && leadId > 0,
    lead_id: leadId,
    lead_created_at: row.lead_created_at,
  };
}

function mapSalesInquiry(row: DbSalesInquiryRow): SalesInquiryRecord {
  return {
    id: toNum(row.id),
    name: row.name,
    email: row.email,
    business_name: row.business_name,
    business_formation_status: row.business_formation_status,
    llc_upsell_opportunity: Boolean(row.llc_upsell_opportunity),
    payload: row.payload || {},
    created_at: row.created_at,
  };
}

function mapFeatureRequest(row: DbFeatureRequestRow): FeatureRequestRecord {
  return {
    id: toNum(row.id),
    user_id: toNum(row.user_id),
    email: row.email,
    feature_key: row.feature_key,
    status: row.status,
    add_on_price_cents: Number(row.add_on_price_cents || 0),
    auto_enrolled: Boolean(row.auto_enrolled),
    enrollment_started_at: row.enrollment_started_at,
    trial_ends_at: row.trial_ends_at,
    review_status: row.review_status || 'pending_manual_review',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

async function listRoleSlugsForUser(userId: number): Promise<string[]> {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<{ slug: string }>(
    `
      SELECT r.slug
      FROM ofroot_user_roles ur
      JOIN ofroot_roles r ON r.id = ur.role_id
      WHERE ur.user_id = $1
      ORDER BY r.slug ASC
    `,
    [userId]
  );
  return result.rows.map((row) => String(row.slug || '').trim()).filter(Boolean);
}

function deriveTopRole(roleSlugs: string[]): string {
  if (roleSlugs.includes('owner')) return 'owner';
  if (roleSlugs.includes('admin')) return 'admin';
  if (roleSlugs.includes('client')) return 'client';
  return 'client';
}

function dbUrl(): string {
  return process.env.DATABASE_URL || process.env.DIRECT_URL || '';
}

export function isSupabaseStoreConfigured(): boolean {
  return Boolean(dbUrl());
}

declare global {
  // eslint-disable-next-line no-var
  var __ofrootDbPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __ofrootDbReadyPromise: Promise<void> | undefined;
}

function getPool(): Pool {
  const url = dbUrl();
  if (!url) {
    throw Object.assign(new Error('DATABASE_URL is not configured'), { status: 503 });
  }

  if (!global.__ofrootDbPool) {
    global.__ofrootDbPool = new Pool({
      connectionString: url,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
    });
  }
  return global.__ofrootDbPool;
}

async function ensureSchema(): Promise<void> {
  if (!global.__ofrootDbReadyPromise) {
    global.__ofrootDbReadyPromise = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_auth_users (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          tenant_id BIGINT NULL,
          plan TEXT NULL DEFAULT 'free',
          billing_cycle TEXT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_auth_sessions (
          id BIGSERIAL PRIMARY KEY,
          token TEXT NOT NULL UNIQUE,
          user_id BIGINT NOT NULL REFERENCES ofroot_auth_users(id) ON DELETE CASCADE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_roles (
          id BIGSERIAL PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_user_roles (
          user_id BIGINT NOT NULL REFERENCES ofroot_auth_users(id) ON DELETE CASCADE,
          role_id BIGINT NOT NULL REFERENCES ofroot_roles(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (user_id, role_id)
        );
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_auth_sessions_user_id ON ofroot_auth_sessions(user_id);
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_auth_sessions_expires_at ON ofroot_auth_sessions(expires_at);
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_leads (
          id BIGSERIAL PRIMARY KEY,
          tenant_id BIGINT NULL,
          name TEXT NULL,
          email TEXT NULL,
          phone TEXT NOT NULL,
          service TEXT NOT NULL,
          zip TEXT NOT NULL,
          source TEXT NULL,
          status TEXT NOT NULL DEFAULT 'new',
          meta JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_leads_email ON ofroot_leads(email);
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_leads_source ON ofroot_leads(source);
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_leads_status ON ofroot_leads(status);
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_leads_created_at ON ofroot_leads(created_at DESC);
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_automation_abandonments (
          id BIGSERIAL PRIMARY KEY,
          email TEXT NOT NULL,
          full_name TEXT NULL,
          company_name TEXT NULL,
          stage TEXT NOT NULL,
          reason TEXT NULL,
          payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          notified_at TIMESTAMPTZ NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (email, stage)
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_sales_inquiries (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          business_name TEXT NULL,
          business_formation_status TEXT NULL,
          llc_upsell_opportunity BOOLEAN NOT NULL DEFAULT FALSE,
          payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_feature_requests (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES ofroot_auth_users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          feature_key TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'requested',
          add_on_price_cents INT NOT NULL DEFAULT 500,
          auto_enrolled BOOLEAN NOT NULL DEFAULT FALSE,
          enrollment_started_at TIMESTAMPTZ NULL,
          trial_ends_at TIMESTAMPTZ NULL,
          review_status TEXT NOT NULL DEFAULT 'pending_manual_review',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (user_id, feature_key)
        );
      `);

      await pool.query(`
        ALTER TABLE ofroot_feature_requests
        ADD COLUMN IF NOT EXISTS auto_enrolled BOOLEAN NOT NULL DEFAULT FALSE;
      `);

      await pool.query(`
        ALTER TABLE ofroot_feature_requests
        ADD COLUMN IF NOT EXISTS enrollment_started_at TIMESTAMPTZ NULL;
      `);

      await pool.query(`
        ALTER TABLE ofroot_feature_requests
        ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ NULL;
      `);

      await pool.query(`
        ALTER TABLE ofroot_feature_requests
        ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'pending_manual_review';
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_sales_inquiries_email
        ON ofroot_sales_inquiries(email);
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_sales_inquiries_llc_upsell
        ON ofroot_sales_inquiries(llc_upsell_opportunity, created_at DESC);
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_feature_requests_user_id
        ON ofroot_feature_requests(user_id, created_at DESC);
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_automation_abandonments_email
        ON ofroot_automation_abandonments(email);
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ofroot_automation_abandonments_stage
        ON ofroot_automation_abandonments(stage);
      `);

      await pool.query(`
        ALTER TABLE ofroot_auth_users ADD COLUMN IF NOT EXISTS tenant_id BIGINT NULL;
      `);

      await pool.query(`
        ALTER TABLE ofroot_auth_users ADD COLUMN IF NOT EXISTS plan TEXT NULL DEFAULT 'free';
      `);

      await pool.query(`
        ALTER TABLE ofroot_auth_users ADD COLUMN IF NOT EXISTS billing_cycle TEXT NULL;
      `);

      await pool.query(`
        ALTER TABLE ofroot_leads ADD COLUMN IF NOT EXISTS tenant_id BIGINT NULL;
      `);

      await pool.query(`
        ALTER TABLE ofroot_leads ADD COLUMN IF NOT EXISTS source TEXT NULL;
      `);

      await pool.query(`
        ALTER TABLE ofroot_leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';
      `);

      await pool.query(`
        ALTER TABLE ofroot_leads ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}'::jsonb;
      `);

      await pool.query(`
        UPDATE ofroot_auth_users SET email = LOWER(email) WHERE email <> LOWER(email);
      `);

      await pool.query(`
        UPDATE ofroot_leads SET email = LOWER(email) WHERE email IS NOT NULL AND email <> LOWER(email);
      `);

      await pool.query(`
        UPDATE ofroot_automation_abandonments
        SET email = LOWER(email)
        WHERE email <> LOWER(email);
      `);

      await pool.query(`
        UPDATE ofroot_sales_inquiries
        SET email = LOWER(email)
        WHERE email <> LOWER(email);
      `);

      await pool.query(`
        INSERT INTO ofroot_roles (slug, name)
        VALUES
          ('owner', 'Owner'),
          ('admin', 'Admin'),
          ('client', 'Client')
        ON CONFLICT (slug) DO NOTHING;
      `);
    })();
  }

  await global.__ofrootDbReadyPromise;
}

export async function assignRoleToUser(userId: number, roleSlug: 'owner' | 'admin' | 'client') {
  await ensureSchema();
  const pool = getPool();
  await pool.query(
    `
      INSERT INTO ofroot_user_roles (user_id, role_id)
      SELECT $1, r.id
      FROM ofroot_roles r
      WHERE r.slug = $2
      ON CONFLICT (user_id, role_id) DO NOTHING
    `,
    [userId, roleSlug]
  );
}

export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  plan?: 'free' | 'pro' | 'business';
  billingCycle?: 'monthly' | 'yearly';
  roleSlug?: 'owner' | 'admin' | 'client';
}): Promise<User> {
  await ensureSchema();
  const pool = getPool();
  const email = normalizeEmail(params.email);
  const passwordHash = await bcrypt.hash(params.password, 10);

  const inserted = await pool.query<DbUserRow>(
    `
      INSERT INTO ofroot_auth_users (name, email, password_hash, plan, billing_cycle)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name, email, tenant_id, plan, billing_cycle, created_at, updated_at
    `,
    [params.name.trim(), email, passwordHash, params.plan || 'free', params.billingCycle || null]
  );

  const row = inserted.rows[0];
  if (!row) {
    throw Object.assign(new Error('An account with this email already exists'), { status: 409 });
  }

  const user = mapUser(row);
  await assignRoleToUser(user.id, params.roleSlug || 'client');
  const roles = await listRoleSlugsForUser(user.id);
  return {
    ...user,
    roles,
    top_role: deriveTopRole(roles),
  } as User;
}

export async function findUserByEmail(emailInput: string): Promise<User | null> {
  await ensureSchema();
  const pool = getPool();
  const email = normalizeEmail(emailInput);

  const found = await pool.query<DbUserRow>(
    `
      SELECT id, name, email, tenant_id, plan, billing_cycle, created_at, updated_at
      FROM ofroot_auth_users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  const row = found.rows[0];
  if (!row) return null;
  const user = mapUser(row);
  const roles = await listRoleSlugsForUser(user.id);
  return {
    ...user,
    roles,
    top_role: deriveTopRole(roles),
  } as User;
}

export async function authenticateUser(emailInput: string, password: string): Promise<User | null> {
  await ensureSchema();
  const pool = getPool();
  const email = normalizeEmail(emailInput);

  const found = await pool.query<DbUserRow & { password_hash: string }>(
    `
      SELECT id, name, email, password_hash, tenant_id, plan, billing_cycle, created_at, updated_at
      FROM ofroot_auth_users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  const row = found.rows[0];
  if (!row) return null;

  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return null;

  const user = mapUser(row);
  const roles = await listRoleSlugsForUser(user.id);
  return {
    ...user,
    roles,
    top_role: deriveTopRole(roles),
  } as User;
}

export async function createSessionForUser(userId: number): Promise<string> {
  await ensureSchema();
  const pool = getPool();
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await pool.query(
    `
      INSERT INTO ofroot_auth_sessions (token, user_id, expires_at)
      VALUES ($1, $2, $3)
    `,
    [token, userId, expiresAt.toISOString()]
  );

  return token;
}

export async function getUserFromSessionToken(token: string): Promise<User | null> {
  await ensureSchema();
  const pool = getPool();

  const result = await pool.query<DbUserRow>(
    `
      SELECT u.id, u.name, u.email, u.tenant_id, u.plan, u.billing_cycle, u.created_at, u.updated_at
      FROM ofroot_auth_sessions s
      JOIN ofroot_auth_users u ON u.id = s.user_id
      WHERE s.token = $1
        AND s.expires_at > NOW()
      LIMIT 1
    `,
    [token]
  );

  const row = result.rows[0];
  if (!row) return null;
  const user = mapUser(row);
  const roles = await listRoleSlugsForUser(user.id);
  return {
    ...user,
    roles,
    top_role: deriveTopRole(roles),
  } as User;
}

export async function deleteSessionToken(token: string): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  await pool.query('DELETE FROM ofroot_auth_sessions WHERE token = $1', [token]);
}

export async function createLeadRecord(input: CreateLeadInput): Promise<Lead> {
  await ensureSchema();
  const pool = getPool();

  const res = await pool.query<DbLeadRow>(
    `
      INSERT INTO ofroot_leads (
        tenant_id,
        name,
        email,
        phone,
        service,
        zip,
        source,
        status,
        meta
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
      RETURNING id, tenant_id, name, email, phone, service, zip, source, status, meta, created_at, updated_at
    `,
    [
      input.tenant_id ?? null,
      input.name?.trim() || null,
      input.email ? normalizeEmail(input.email) : null,
      input.phone,
      input.service,
      input.zip,
      input.source || null,
      input.status || 'new',
      JSON.stringify(input.meta || {}),
    ]
  );

  return mapLead(res.rows[0]);
}

export async function listLeadsPaginated(params: {
  page?: number;
  per_page?: number;
  q?: string;
  status?: string;
  zip?: string;
  tenant_id?: number | null;
}) {
  await ensureSchema();
  const pool = getPool();

  const page = Math.max(1, Math.floor(params.page || 1));
  const perPage = Math.max(1, Math.min(500, Math.floor(params.per_page || 25)));
  const offset = (page - 1) * perPage;

  const where: string[] = [];
  const args: unknown[] = [];

  if (params.q?.trim()) {
    const q = `%${params.q.trim().toLowerCase()}%`;
    args.push(q);
    where.push(`(
      LOWER(COALESCE(name, '')) LIKE $${args.length}
      OR LOWER(COALESCE(email, '')) LIKE $${args.length}
      OR LOWER(COALESCE(phone, '')) LIKE $${args.length}
      OR LOWER(COALESCE(service, '')) LIKE $${args.length}
    )`);
  }

  if (params.status?.trim()) {
    args.push(params.status.trim().toLowerCase());
    where.push(`LOWER(COALESCE(status, '')) = $${args.length}`);
  }

  if (params.zip?.trim()) {
    args.push(params.zip.trim());
    where.push(`zip = $${args.length}`);
  }

  if (params.tenant_id != null) {
    args.push(params.tenant_id);
    where.push(`tenant_id = $${args.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*)::int AS total FROM ofroot_leads ${whereSql}`;
  const countRes = await pool.query<{ total: number }>(countSql, args);
  const total = Number(countRes.rows[0]?.total || 0);

  const selectSql = `
    SELECT id, tenant_id, name, email, phone, service, zip, source, status, meta, created_at, updated_at
    FROM ofroot_leads
    ${whereSql}
    ORDER BY created_at DESC, id DESC
    LIMIT $${args.length + 1}
    OFFSET $${args.length + 2}
  `;

  const rowsRes = await pool.query<DbLeadRow>(selectSql, [...args, perPage, offset]);
  const data = rowsRes.rows.map(mapLead);

  return {
    data,
    meta: {
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.max(1, Math.ceil(total / perPage)),
    },
  };
}

export async function findLatestAutomationLeadByEmail(emailInput: string): Promise<Lead | null> {
  await ensureSchema();
  const pool = getPool();
  const email = normalizeEmail(emailInput);

  const result = await pool.query<DbLeadRow>(
    `
      SELECT id, tenant_id, name, email, phone, service, zip, source, status, meta, created_at, updated_at
      FROM ofroot_leads
      WHERE LOWER(COALESCE(email, '')) = $1
        AND source = 'automation-onboarding'
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `,
    [email]
  );

  const row = result.rows[0];
  if (!row) return null;
  return mapLead(row);
}

export async function listRecentAutomationOnboardingLeads(params?: { limit?: number }): Promise<Lead[]> {
  await ensureSchema();
  const pool = getPool();
  const limit = Math.max(1, Math.min(500, Math.floor(params?.limit || 100)));

  const result = await pool.query<DbLeadRow>(
    `
      SELECT id, tenant_id, name, email, phone, service, zip, source, status, meta, created_at, updated_at
      FROM ofroot_leads
      WHERE source = 'automation-onboarding'
      ORDER BY created_at DESC, id DESC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows.map(mapLead);
}

export async function listRecentAutomationAbandonments(params?: { limit?: number }): Promise<AutomationAbandonmentRecord[]> {
  await ensureSchema();
  const pool = getPool();
  const limit = Math.max(1, Math.min(500, Math.floor(params?.limit || 100)));

  const result = await pool.query<DbAutomationAbandonmentWithLeadRow>(
    `
      SELECT
        a.id,
        a.email,
        a.full_name,
        a.company_name,
        a.stage,
        a.reason,
        a.payload,
        a.first_seen_at,
        a.last_seen_at,
        a.notified_at,
        a.created_at,
        a.updated_at,
        l.id AS lead_id,
        l.created_at AS lead_created_at
      FROM ofroot_automation_abandonments a
      LEFT JOIN LATERAL (
        SELECT id, created_at
        FROM ofroot_leads l
        WHERE LOWER(COALESCE(l.email, '')) = a.email
          AND l.source = 'automation-onboarding'
        ORDER BY l.created_at DESC, l.id DESC
        LIMIT 1
      ) l ON TRUE
      ORDER BY a.last_seen_at DESC, a.id DESC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows.map(mapAutomationAbandonment);
}

export async function getAutomationFunnelSummary(): Promise<AutomationFunnelSummary> {
  await ensureSchema();
  const pool = getPool();

  const result = await pool.query<DbAutomationFunnelSummaryRow>(
    `
      SELECT
        (SELECT COUNT(*) FROM ofroot_leads WHERE source = 'automation-onboarding') AS total_signups,
        (SELECT COUNT(*) FROM ofroot_leads WHERE source = 'automation-onboarding' AND created_at >= NOW() - INTERVAL '30 days') AS signups_30d,
        (SELECT COUNT(*) FROM ofroot_automation_abandonments) AS total_abandons,
        (SELECT COUNT(*) FROM ofroot_automation_abandonments WHERE last_seen_at >= NOW() - INTERVAL '30 days') AS abandons_30d,
        (
          SELECT COUNT(*)
          FROM ofroot_automation_abandonments a
          WHERE EXISTS (
            SELECT 1
            FROM ofroot_leads l
            WHERE LOWER(COALESCE(l.email, '')) = a.email
              AND l.source = 'automation-onboarding'
          )
        ) AS abandons_converted
    `
  );

  const row = result.rows[0] || {
    total_signups: 0,
    signups_30d: 0,
    total_abandons: 0,
    abandons_30d: 0,
    abandons_converted: 0,
  };

  return {
    total_signups: toNum(row.total_signups),
    signups_30d: toNum(row.signups_30d),
    total_abandons: toNum(row.total_abandons),
    abandons_30d: toNum(row.abandons_30d),
    abandons_converted: toNum(row.abandons_converted),
  };
}

export async function upsertAutomationAbandonment(input: {
  email: string;
  stage: 'start' | 'services';
  full_name?: string;
  company_name?: string;
  reason?: string;
  payload?: Record<string, unknown>;
}) {
  await ensureSchema();
  const pool = getPool();
  const email = normalizeEmail(input.email);

  const result = await pool.query<DbAutomationAbandonmentRow>(
    `
      INSERT INTO ofroot_automation_abandonments (
        email,
        full_name,
        company_name,
        stage,
        reason,
        payload
      )
      VALUES ($1, NULLIF($2, ''), NULLIF($3, ''), $4, NULLIF($5, ''), $6::jsonb)
      ON CONFLICT (email, stage)
      DO UPDATE SET
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), ofroot_automation_abandonments.full_name),
        company_name = COALESCE(NULLIF(EXCLUDED.company_name, ''), ofroot_automation_abandonments.company_name),
        reason = COALESCE(NULLIF(EXCLUDED.reason, ''), ofroot_automation_abandonments.reason),
        payload = COALESCE(ofroot_automation_abandonments.payload, '{}'::jsonb) || COALESCE(EXCLUDED.payload, '{}'::jsonb),
        last_seen_at = NOW(),
        updated_at = NOW()
      RETURNING
        id, email, full_name, company_name, stage, reason, payload,
        first_seen_at, last_seen_at, notified_at, created_at, updated_at
    `,
    [
      email,
      (input.full_name || '').trim(),
      (input.company_name || '').trim(),
      input.stage,
      (input.reason || '').trim(),
      JSON.stringify(input.payload || {}),
    ]
  );

  return result.rows[0];
}

export async function markAutomationAbandonmentNotified(input: {
  email: string;
  stage: 'start' | 'services';
}) {
  await ensureSchema();
  const pool = getPool();
  const email = normalizeEmail(input.email);

  await pool.query(
    `
      UPDATE ofroot_automation_abandonments
      SET notified_at = NOW(), updated_at = NOW()
      WHERE email = $1 AND stage = $2
    `,
    [email, input.stage]
  );
}

export async function createSalesInquiryRecord(input: {
  name: string;
  email: string;
  business_name?: string | null;
  business_formation_status?: string | null;
  llc_upsell_opportunity?: boolean;
  payload?: Record<string, unknown>;
}): Promise<SalesInquiryRecord> {
  await ensureSchema();
  const pool = getPool();

  const result = await pool.query<DbSalesInquiryRow>(
    `
      INSERT INTO ofroot_sales_inquiries (
        name,
        email,
        business_name,
        business_formation_status,
        llc_upsell_opportunity,
        payload
      )
      VALUES ($1, $2, NULLIF($3, ''), NULLIF($4, ''), $5, $6::jsonb)
      RETURNING id, name, email, business_name, business_formation_status, llc_upsell_opportunity, payload, created_at
    `,
    [
      input.name.trim(),
      normalizeEmail(input.email),
      String(input.business_name || '').trim(),
      String(input.business_formation_status || '').trim(),
      Boolean(input.llc_upsell_opportunity),
      JSON.stringify(input.payload || {}),
    ]
  );

  return mapSalesInquiry(result.rows[0]);
}

export async function listRecentLlcUpsellOpportunities(params?: { limit?: number }): Promise<SalesInquiryRecord[]> {
  await ensureSchema();
  const pool = getPool();
  const limit = Math.max(1, Math.min(500, Math.floor(params?.limit || 100)));

  const result = await pool.query<DbSalesInquiryRow>(
    `
      SELECT id, name, email, business_name, business_formation_status, llc_upsell_opportunity, payload, created_at
      FROM ofroot_sales_inquiries
      WHERE llc_upsell_opportunity = TRUE
      ORDER BY created_at DESC, id DESC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows.map(mapSalesInquiry);
}

export async function createFeatureRequest(input: {
  user_id: number;
  email: string;
  feature_key: string;
  add_on_price_cents?: number;
}): Promise<FeatureRequestRecord> {
  await ensureSchema();
  const pool = getPool();
  const trialDays = 7;
  const result = await pool.query<DbFeatureRequestRow>(
    `
      INSERT INTO ofroot_feature_requests (
        user_id,
        email,
        feature_key,
        add_on_price_cents,
        status,
        auto_enrolled,
        enrollment_started_at,
        trial_ends_at,
        review_status
      )
      VALUES ($1, $2, $3, $4, 'trial_active', TRUE, NOW(), NOW() + ($5::text || ' days')::interval, 'pending_manual_review')
      ON CONFLICT (user_id, feature_key)
      DO UPDATE SET
        status = 'trial_active',
        auto_enrolled = TRUE,
        enrollment_started_at = COALESCE(ofroot_feature_requests.enrollment_started_at, NOW()),
        trial_ends_at = COALESCE(ofroot_feature_requests.trial_ends_at, NOW() + ($5::text || ' days')::interval),
        review_status = 'pending_manual_review',
        updated_at = NOW()
      RETURNING id, user_id, email, feature_key, status, add_on_price_cents, auto_enrolled, enrollment_started_at, trial_ends_at, review_status, created_at, updated_at
    `,
    [
      input.user_id,
      normalizeEmail(input.email),
      String(input.feature_key || '').trim(),
      Number.isFinite(input.add_on_price_cents as number) ? Number(input.add_on_price_cents) : 500,
      trialDays,
    ]
  );
  return mapFeatureRequest(result.rows[0]);
}

export async function listRecentFeatureRequests(params?: { limit?: number }): Promise<FeatureRequestRecord[]> {
  await ensureSchema();
  const pool = getPool();
  const limit = Math.max(1, Math.min(500, Math.floor(params?.limit || 100)));
  const result = await pool.query<DbFeatureRequestRow>(
    `
      SELECT id, user_id, email, feature_key, status, add_on_price_cents, auto_enrolled, enrollment_started_at, trial_ends_at, review_status, created_at, updated_at
      FROM ofroot_feature_requests
      ORDER BY created_at DESC, id DESC
      LIMIT $1
    `,
    [limit]
  );
  return result.rows.map(mapFeatureRequest);
}
