import { Pool } from 'pg';
import type {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowCondition,
  WorkflowDefinition,
  WorkflowRun,
  WorkflowRunDetail,
  WorkflowRunStep,
  WorkflowStatus,
  WorkflowTriggerType,
} from '@/app/lib/workflows/types';

function dbUrl(): string {
  return process.env.DATABASE_URL || process.env.DIRECT_URL || '';
}

declare global {
  var __ofrootWorkflowDbPool: Pool | undefined;
  var __ofrootWorkflowDbReadyPromise: Promise<void> | undefined;
}

function toNum(value: unknown): number {
  if (typeof value === 'number') return value;
  return Number.parseInt(String(value || 0), 10) || 0;
}

function toObj(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

function toConditions(value: unknown): WorkflowCondition[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((c) => {
      const condition = c as Record<string, unknown>;
      const key = String(condition.key || '').trim();
      const operator = String(condition.operator || 'equals');
      if (!key || !['equals', 'contains', 'greaterThan'].includes(operator)) return null;
      return {
        key,
        operator: operator as WorkflowCondition['operator'],
        value: (condition.value ?? '') as any,
      };
    })
    .filter(Boolean) as WorkflowCondition[];
}

function getPool(): Pool {
  const url = dbUrl();
  if (!url) throw Object.assign(new Error('DATABASE_URL is not configured'), { status: 503 });
  if (!global.__ofrootWorkflowDbPool) {
    global.__ofrootWorkflowDbPool = new Pool({
      connectionString: url,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
    });
  }
  return global.__ofrootWorkflowDbPool;
}

export async function ensureWorkflowSchema() {
  if (!global.__ofrootWorkflowDbReadyPromise) {
    global.__ofrootWorkflowDbReadyPromise = (async () => {
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
        CREATE TABLE IF NOT EXISTS ofroot_workflow_definitions (
          id BIGSERIAL PRIMARY KEY,
          tenant_id BIGINT NULL,
          name TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft',
          trigger_type TEXT NOT NULL,
          trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
          conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
          steps JSONB NOT NULL DEFAULT '[]'::jsonb,
          version INT NOT NULL DEFAULT 1,
          created_by BIGINT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_workflow_runs (
          id BIGSERIAL PRIMARY KEY,
          tenant_id BIGINT NULL,
          workflow_id BIGINT NOT NULL REFERENCES ofroot_workflow_definitions(id) ON DELETE CASCADE,
          event_type TEXT NOT NULL,
          event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          status TEXT NOT NULL DEFAULT 'queued',
          attempt_count INT NOT NULL DEFAULT 0,
          idempotency_key TEXT NOT NULL,
          started_at TIMESTAMPTZ NULL,
          finished_at TIMESTAMPTZ NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (workflow_id, idempotency_key)
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_workflow_run_steps (
          id BIGSERIAL PRIMARY KEY,
          run_id BIGINT NOT NULL REFERENCES ofroot_workflow_runs(id) ON DELETE CASCADE,
          step_key TEXT NOT NULL,
          action_type TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'queued',
          attempt INT NOT NULL DEFAULT 0,
          input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          output_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          error_message TEXT NULL,
          started_at TIMESTAMPTZ NULL,
          finished_at TIMESTAMPTZ NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_workflow_dead_letters (
          id BIGSERIAL PRIMARY KEY,
          tenant_id BIGINT NULL,
          run_id BIGINT NOT NULL REFERENCES ofroot_workflow_runs(id) ON DELETE CASCADE,
          step_key TEXT NOT NULL,
          reason TEXT NOT NULL,
          payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ofroot_workflow_queue (
          id BIGSERIAL PRIMARY KEY,
          run_id BIGINT NOT NULL REFERENCES ofroot_workflow_runs(id) ON DELETE CASCADE,
          available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          attempts INT NOT NULL DEFAULT 0,
          max_attempts INT NOT NULL DEFAULT 10,
          locked_at TIMESTAMPTZ NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`CREATE INDEX IF NOT EXISTS idx_ofroot_workflows_tenant_trigger ON ofroot_workflow_definitions(tenant_id, trigger_type);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_ofroot_workflow_runs_workflow ON ofroot_workflow_runs(workflow_id, created_at DESC);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_ofroot_workflow_queue_available ON ofroot_workflow_queue(available_at, locked_at);`);
    })();
  }

  await global.__ofrootWorkflowDbReadyPromise;
}

function mapWorkflow(row: any): WorkflowDefinition {
  return {
    id: toNum(row.id),
    tenant_id: row.tenant_id == null ? null : toNum(row.tenant_id),
    name: String(row.name || ''),
    status: row.status as WorkflowStatus,
    trigger_type: row.trigger_type as WorkflowTriggerType,
    trigger_config: toObj(row.trigger_config),
    conditions: toConditions(row.conditions),
    steps: Array.isArray(row.steps) ? row.steps : [],
    version: toNum(row.version),
    created_by: toNum(row.created_by),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function mapRun(row: any): WorkflowRun {
  return {
    id: toNum(row.id),
    tenant_id: row.tenant_id == null ? null : toNum(row.tenant_id),
    workflow_id: toNum(row.workflow_id),
    event_type: row.event_type,
    event_payload: toObj(row.event_payload),
    status: row.status,
    attempt_count: toNum(row.attempt_count),
    idempotency_key: String(row.idempotency_key || ''),
    started_at: row.started_at || null,
    finished_at: row.finished_at || null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function mapRunStep(row: any): WorkflowRunStep {
  return {
    id: toNum(row.id),
    run_id: toNum(row.run_id),
    step_key: String(row.step_key || ''),
    action_type: row.action_type,
    status: row.status,
    attempt: toNum(row.attempt),
    input_payload: toObj(row.input_payload),
    output_payload: toObj(row.output_payload),
    error_message: row.error_message || null,
    started_at: row.started_at || null,
    finished_at: row.finished_at || null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function isWorkflowFeatureEnabledForTenant(tenantId: number | null, userTopRole?: string | null): Promise<boolean> {
  await ensureWorkflowSchema();
  if (tenantId == null) {
    return userTopRole === 'owner' || userTopRole === 'admin';
  }

  const pool = getPool();
  const row = await pool.query<{ enabled: boolean }>(
    `SELECT enabled FROM ofroot_tenant_features WHERE tenant_id = $1 AND feature_key = 'workflow_engine_mvp' LIMIT 1`,
    [tenantId]
  );

  if (!row.rows[0]) return false;
  return Boolean(row.rows[0].enabled);
}

export async function enableWorkflowFeatureForTenant(tenantId: number): Promise<void> {
  await ensureWorkflowSchema();
  const pool = getPool();
  await pool.query(
    `
    INSERT INTO ofroot_tenant_features (tenant_id, feature_key, enabled)
    VALUES ($1, 'workflow_engine_mvp', TRUE)
    ON CONFLICT (tenant_id, feature_key)
    DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = NOW()
    `,
    [tenantId]
  );
}

export async function listWorkflowDefinitions(tenantId: number | null): Promise<WorkflowDefinition[]> {
  await ensureWorkflowSchema();
  const pool = getPool();
  const result = await pool.query(
    `SELECT * FROM ofroot_workflow_definitions WHERE COALESCE(tenant_id, -1) = COALESCE($1, -1) ORDER BY updated_at DESC`,
    [tenantId]
  );
  return result.rows.map(mapWorkflow);
}

export async function getWorkflowDefinition(id: number, tenantId: number | null): Promise<WorkflowDefinition | null> {
  await ensureWorkflowSchema();
  const pool = getPool();
  const result = await pool.query(
    `SELECT * FROM ofroot_workflow_definitions WHERE id = $1 AND COALESCE(tenant_id, -1) = COALESCE($2, -1) LIMIT 1`,
    [id, tenantId]
  );
  if (!result.rows[0]) return null;
  return mapWorkflow(result.rows[0]);
}

export async function createWorkflowDefinition(input: CreateWorkflowInput, tenantId: number | null, userId: number): Promise<WorkflowDefinition> {
  await ensureWorkflowSchema();
  const pool = getPool();

  const status: WorkflowStatus = input.status && ['draft', 'active', 'paused'].includes(input.status) ? input.status : 'draft';
  const conditions = toConditions(input.conditions || []);
  const steps = Array.isArray(input.steps) ? input.steps : [];
  const triggerConfig = toObj(input.trigger_config || {});

  const result = await pool.query(
    `
      INSERT INTO ofroot_workflow_definitions (tenant_id, name, status, trigger_type, trigger_config, conditions, steps, created_by)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8)
      RETURNING *
    `,
    [tenantId, input.name.trim(), status, input.trigger_type, JSON.stringify(triggerConfig), JSON.stringify(conditions), JSON.stringify(steps), userId]
  );

  return mapWorkflow(result.rows[0]);
}

export async function updateWorkflowDefinition(id: number, input: UpdateWorkflowInput, tenantId: number | null): Promise<WorkflowDefinition | null> {
  await ensureWorkflowSchema();
  const current = await getWorkflowDefinition(id, tenantId);
  if (!current) return null;

  const pool = getPool();
  const next = {
    name: input.name?.trim() || current.name,
    status: (input.status && ['draft', 'active', 'paused'].includes(input.status) ? input.status : current.status) as WorkflowStatus,
    trigger_type: input.trigger_type || current.trigger_type,
    trigger_config: toObj(input.trigger_config || current.trigger_config),
    conditions: toConditions(input.conditions || current.conditions),
    steps: Array.isArray(input.steps) ? input.steps : current.steps,
    version: current.version + 1,
  };

  const result = await pool.query(
    `
      UPDATE ofroot_workflow_definitions
      SET name = $3,
          status = $4,
          trigger_type = $5,
          trigger_config = $6::jsonb,
          conditions = $7::jsonb,
          steps = $8::jsonb,
          version = $9,
          updated_at = NOW()
      WHERE id = $1 AND COALESCE(tenant_id, -1) = COALESCE($2, -1)
      RETURNING *
    `,
    [id, tenantId, next.name, next.status, next.trigger_type, JSON.stringify(next.trigger_config), JSON.stringify(next.conditions), JSON.stringify(next.steps), next.version]
  );

  return result.rows[0] ? mapWorkflow(result.rows[0]) : null;
}

export async function setWorkflowStatus(id: number, tenantId: number | null, status: WorkflowStatus): Promise<WorkflowDefinition | null> {
  await ensureWorkflowSchema();
  const pool = getPool();
  const result = await pool.query(
    `UPDATE ofroot_workflow_definitions SET status = $3, updated_at = NOW() WHERE id = $1 AND COALESCE(tenant_id, -1)=COALESCE($2,-1) RETURNING *`,
    [id, tenantId, status]
  );
  return result.rows[0] ? mapWorkflow(result.rows[0]) : null;
}

export async function deleteWorkflowDefinition(id: number, tenantId: number | null): Promise<boolean> {
  await ensureWorkflowSchema();
  const pool = getPool();
  const result = await pool.query(`DELETE FROM ofroot_workflow_definitions WHERE id = $1 AND COALESCE(tenant_id, -1)=COALESCE($2,-1)`, [id, tenantId]);
  return (result.rowCount || 0) > 0;
}

export async function listActiveWorkflowsByTrigger(tenantId: number | null, triggerType: WorkflowTriggerType): Promise<WorkflowDefinition[]> {
  await ensureWorkflowSchema();
  const pool = getPool();
  const result = await pool.query(
    `
      SELECT * FROM ofroot_workflow_definitions
      WHERE COALESCE(tenant_id, -1) = COALESCE($1, -1)
        AND trigger_type = $2
        AND status = 'active'
      ORDER BY updated_at DESC
    `,
    [tenantId, triggerType]
  );
  return result.rows.map(mapWorkflow);
}

export async function createWorkflowRun(params: {
  tenantId: number | null;
  workflowId: number;
  eventType: WorkflowTriggerType;
  eventPayload: Record<string, unknown>;
  idempotencyKey: string;
}): Promise<WorkflowRun | null> {
  await ensureWorkflowSchema();
  const pool = getPool();
  const result = await pool.query(
    `
      INSERT INTO ofroot_workflow_runs (tenant_id, workflow_id, event_type, event_payload, idempotency_key, status)
      VALUES ($1, $2, $3, $4::jsonb, $5, 'queued')
      ON CONFLICT (workflow_id, idempotency_key) DO NOTHING
      RETURNING *
    `,
    [params.tenantId, params.workflowId, params.eventType, JSON.stringify(params.eventPayload || {}), params.idempotencyKey]
  );
  if (!result.rows[0]) return null;
  return mapRun(result.rows[0]);
}

export async function enqueueWorkflowRun(runId: number, availableAt?: Date): Promise<void> {
  await ensureWorkflowSchema();
  const pool = getPool();
  await pool.query(
    `INSERT INTO ofroot_workflow_queue (run_id, available_at) VALUES ($1, COALESCE($2, NOW()))`,
    [runId, availableAt ? availableAt.toISOString() : null]
  );
}

export async function dequeueWorkflowRun(): Promise<{ queueId: number; runId: number } | null> {
  await ensureWorkflowSchema();
  const pool = getPool();
  const result = await pool.query(
    `
      WITH picked AS (
        SELECT id, run_id
        FROM ofroot_workflow_queue
        WHERE available_at <= NOW() AND locked_at IS NULL
        ORDER BY available_at ASC, id ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE ofroot_workflow_queue q
      SET locked_at = NOW()
      FROM picked
      WHERE q.id = picked.id
      RETURNING q.id, q.run_id
    `
  );
  if (!result.rows[0]) return null;
  return { queueId: toNum(result.rows[0].id), runId: toNum(result.rows[0].run_id) };
}

export async function deleteQueueItem(queueId: number): Promise<void> {
  await ensureWorkflowSchema();
  const pool = getPool();
  await pool.query(`DELETE FROM ofroot_workflow_queue WHERE id = $1`, [queueId]);
}

export async function getWorkflowRun(runId: number, tenantId: number | null): Promise<WorkflowRun | null> {
  await ensureWorkflowSchema();
  const pool = getPool();
  const result = await pool.query(
    `SELECT * FROM ofroot_workflow_runs WHERE id = $1 AND COALESCE(tenant_id, -1)=COALESCE($2, -1) LIMIT 1`,
    [runId, tenantId]
  );
  return result.rows[0] ? mapRun(result.rows[0]) : null;
}

export async function getWorkflowRunById(runId: number): Promise<WorkflowRun | null> {
  await ensureWorkflowSchema();
  const pool = getPool();
  const result = await pool.query(`SELECT * FROM ofroot_workflow_runs WHERE id = $1 LIMIT 1`, [runId]);
  return result.rows[0] ? mapRun(result.rows[0]) : null;
}

export async function listWorkflowRuns(workflowId: number, tenantId: number | null): Promise<WorkflowRun[]> {
  await ensureWorkflowSchema();
  const pool = getPool();
  const result = await pool.query(
    `SELECT * FROM ofroot_workflow_runs WHERE workflow_id = $1 AND COALESCE(tenant_id, -1)=COALESCE($2,-1) ORDER BY created_at DESC LIMIT 100`,
    [workflowId, tenantId]
  );
  return result.rows.map(mapRun);
}

export async function listWorkflowRunsForTenant(tenantId: number | null): Promise<WorkflowRun[]> {
  await ensureWorkflowSchema();
  const pool = getPool();
  const result = await pool.query(
    `SELECT * FROM ofroot_workflow_runs WHERE COALESCE(tenant_id, -1)=COALESCE($1,-1) ORDER BY created_at DESC LIMIT 200`,
    [tenantId]
  );
  return result.rows.map(mapRun);
}

export async function upsertWorkflowRunStep(params: {
  runId: number;
  stepKey: string;
  actionType: string;
  status: string;
  attempt: number;
  inputPayload?: Record<string, unknown>;
  outputPayload?: Record<string, unknown>;
  errorMessage?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
}): Promise<WorkflowRunStep> {
  await ensureWorkflowSchema();
  const pool = getPool();

  const existing = await pool.query(
    `SELECT id FROM ofroot_workflow_run_steps WHERE run_id = $1 AND step_key = $2 ORDER BY id DESC LIMIT 1`,
    [params.runId, params.stepKey]
  );

  if (!existing.rows[0]) {
    const inserted = await pool.query(
      `
        INSERT INTO ofroot_workflow_run_steps
          (run_id, step_key, action_type, status, attempt, input_payload, output_payload, error_message, started_at, finished_at)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10)
        RETURNING *
      `,
      [
        params.runId,
        params.stepKey,
        params.actionType,
        params.status,
        params.attempt,
        JSON.stringify(params.inputPayload || {}),
        JSON.stringify(params.outputPayload || {}),
        params.errorMessage || null,
        params.startedAt || null,
        params.finishedAt || null,
      ]
    );
    return mapRunStep(inserted.rows[0]);
  }

  const updated = await pool.query(
    `
      UPDATE ofroot_workflow_run_steps
      SET action_type = $3,
          status = $4,
          attempt = $5,
          input_payload = $6::jsonb,
          output_payload = $7::jsonb,
          error_message = $8,
          started_at = COALESCE($9, started_at),
          finished_at = $10,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      toNum(existing.rows[0].id),
      params.runId,
      params.actionType,
      params.status,
      params.attempt,
      JSON.stringify(params.inputPayload || {}),
      JSON.stringify(params.outputPayload || {}),
      params.errorMessage || null,
      params.startedAt || null,
      params.finishedAt || null,
    ]
  );

  return mapRunStep(updated.rows[0]);
}

export async function setWorkflowRunStatus(runId: number, status: WorkflowRun['status'], attemptCount?: number): Promise<void> {
  await ensureWorkflowSchema();
  const pool = getPool();
  await pool.query(
    `
      UPDATE ofroot_workflow_runs
      SET status = $2,
          attempt_count = COALESCE($3, attempt_count),
          started_at = CASE WHEN $2 = 'running' AND started_at IS NULL THEN NOW() ELSE started_at END,
          finished_at = CASE WHEN $2 IN ('succeeded', 'failed', 'partial') THEN NOW() ELSE finished_at END,
          updated_at = NOW()
      WHERE id = $1
    `,
    [runId, status, attemptCount ?? null]
  );
}

export async function createDeadLetter(params: {
  tenantId: number | null;
  runId: number;
  stepKey: string;
  reason: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  await ensureWorkflowSchema();
  const pool = getPool();
  await pool.query(
    `INSERT INTO ofroot_workflow_dead_letters (tenant_id, run_id, step_key, reason, payload) VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [params.tenantId, params.runId, params.stepKey, params.reason, JSON.stringify(params.payload || {})]
  );
}

export async function getWorkflowRunDetail(runId: number, tenantId: number | null): Promise<WorkflowRunDetail | null> {
  await ensureWorkflowSchema();
  const run = await getWorkflowRun(runId, tenantId);
  if (!run) return null;
  const pool = getPool();
  const result = await pool.query(`SELECT * FROM ofroot_workflow_run_steps WHERE run_id = $1 ORDER BY id ASC`, [runId]);
  return { run, steps: result.rows.map(mapRunStep) };
}
