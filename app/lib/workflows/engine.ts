import { createHash } from 'crypto';
import {
  createDeadLetter,
  createWorkflowRun,
  dequeueWorkflowRun,
  deleteQueueItem,
  enqueueWorkflowRun,
  getWorkflowDefinition,
  getWorkflowRunById,
  listActiveWorkflowsByTrigger,
  setWorkflowRunStatus,
  upsertWorkflowRunStep,
} from '@/app/lib/workflows/store';
import type { WorkflowCondition, WorkflowStep, WorkflowTriggerType } from '@/app/lib/workflows/types';

function readPath(payload: Record<string, unknown>, key: string): unknown {
  if (!key) return undefined;
  const parts = key.split('.').map((p) => p.trim()).filter(Boolean);
  let current: any = payload;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
}

export function evaluateCondition(payload: Record<string, unknown>, condition: WorkflowCondition): boolean {
  const actual = readPath(payload, condition.key);
  if (condition.operator === 'equals') {
    return String(actual ?? '') === String(condition.value ?? '');
  }
  if (condition.operator === 'contains') {
    return String(actual ?? '').toLowerCase().includes(String(condition.value ?? '').toLowerCase());
  }
  if (condition.operator === 'greaterThan') {
    return Number(actual ?? 0) > Number(condition.value ?? 0);
  }
  return false;
}

export function evaluateConditions(payload: Record<string, unknown>, conditions: WorkflowCondition[]): boolean {
  if (!conditions.length) return true;
  return conditions.every((condition) => evaluateCondition(payload, condition));
}

function buildIdempotencyKey(trigger: WorkflowTriggerType, payload: Record<string, unknown>, workflowId: number, version: number) {
  const stable = JSON.stringify({ trigger, payload, workflowId, version });
  return createHash('sha256').update(stable).digest('hex');
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(id);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
}

async function executeAction(step: WorkflowStep, eventPayload: Record<string, unknown>) {
  if (step.action_type === 'send_email') {
    const to = String(step.config.to || eventPayload.email || '').trim();
    const subject = String(step.config.subject || 'Workflow notification').trim();
    const body = String(step.config.body || JSON.stringify(eventPayload, null, 2));
    if (!to) throw new Error('send_email action requires a recipient email (config.to or payload.email).');
    return { sent: true, simulated: true, to, subject, body_preview: body.slice(0, 240) };
  }

  if (step.action_type === 'send_webhook') {
    const url = String(step.config.url || '').trim();
    if (!url) throw new Error('send_webhook action requires config.url');
    if (!/^https?:\/\//i.test(url)) throw new Error('send_webhook requires an http/https URL');

    const headers = {
      'Content-Type': 'application/json',
      ...(typeof step.config.headers === 'object' && step.config.headers ? (step.config.headers as Record<string, string>) : {}),
    };

    const response = await withTimeout(
      fetch(url, {
        method: String(step.config.method || 'POST').toUpperCase(),
        headers,
        body: JSON.stringify({ event: eventPayload, workflow_step: step.key }),
      }),
      12000
    );

    const text = await response.text().catch(() => '');
    if (!response.ok) {
      throw new Error(`Webhook failed (${response.status}): ${text.slice(0, 500)}`);
    }
    return { delivered: true, status: response.status, response_preview: text.slice(0, 500) };
  }

  if (step.action_type === 'update_record') {
    const recordType = String(step.config.record_type || '').trim();
    const recordId = Number(step.config.record_id || eventPayload.id || 0);
    if (!recordType) throw new Error('update_record requires config.record_type');
    if (!recordId) throw new Error('update_record requires config.record_id or payload.id');
    return {
      updated: true,
      simulated: true,
      record_type: recordType,
      record_id: recordId,
      patch: typeof step.config.patch === 'object' ? step.config.patch : {},
    };
  }

  if (step.action_type === 'ai_prompt') {
    const apiKey = String(step.config.api_key || '').trim();
    const model = String(step.config.model || 'gpt-4.1-mini').trim();
    const prompt = String(step.config.prompt || '').trim();
    if (!apiKey) throw new Error('ai_prompt requires config.api_key');
    if (!prompt) throw new Error('ai_prompt requires config.prompt');

    const response = await withTimeout(
      fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          input: [
            { role: 'system', content: [{ type: 'input_text', text: 'You are a workflow agent. Return concise JSON.' }] },
            {
              role: 'user',
              content: [{ type: 'input_text', text: `${prompt}\n\nEvent payload:\n${JSON.stringify(eventPayload)}` }],
            },
          ],
          max_output_tokens: 800,
        }),
      }),
      20000
    );

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error?.message || `ai_prompt failed with ${response.status}`);
    }

    return {
      model,
      output_text: String(payload?.output_text || '').slice(0, 4000),
      usage: payload?.usage || null,
    };
  }

  throw new Error(`Unsupported action type: ${step.action_type}`);
}

async function executeRun(runId: number): Promise<{ ok: boolean; failedStepKey?: string; error?: string }> {
  const run = await getWorkflowRunById(runId);
  if (!run) return { ok: false, error: 'Run not found' };

  const workflow = await getWorkflowDefinition(run.workflow_id, run.tenant_id);
  if (!workflow) {
    await setWorkflowRunStatus(runId, 'failed', run.attempt_count + 1);
    return { ok: false, error: 'Workflow definition not found' };
  }

  await setWorkflowRunStatus(runId, 'running', run.attempt_count + 1);

  for (const step of workflow.steps) {
    const stepKey = String(step.key || `step-${workflow.steps.indexOf(step) + 1}`);
    const startedAt = new Date().toISOString();
    await upsertWorkflowRunStep({
      runId,
      stepKey,
      actionType: step.action_type,
      status: 'running',
      attempt: 1,
      inputPayload: { config: step.config, event: run.event_payload },
      startedAt,
    });

    const maxRetries = 3;
    let attempt = 0;
    let done = false;
    let lastError = '';

    while (attempt < maxRetries && !done) {
      attempt += 1;
      try {
        const output = await executeAction(step, run.event_payload);
        await upsertWorkflowRunStep({
          runId,
          stepKey,
          actionType: step.action_type,
          status: 'succeeded',
          attempt,
          inputPayload: { config: step.config, event: run.event_payload },
          outputPayload: output as Record<string, unknown>,
          startedAt,
          finishedAt: new Date().toISOString(),
        });
        done = true;
      } catch (err: any) {
        lastError = err?.message || 'Unknown action error';
        const isFinal = attempt >= maxRetries;
        await upsertWorkflowRunStep({
          runId,
          stepKey,
          actionType: step.action_type,
          status: isFinal ? 'failed' : 'running',
          attempt,
          inputPayload: { config: step.config, event: run.event_payload },
          outputPayload: {},
          errorMessage: lastError,
          startedAt,
          finishedAt: isFinal ? new Date().toISOString() : null,
        });

        if (!isFinal) {
          const backoffMs = 500 * 2 ** (attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    if (!done) {
      await setWorkflowRunStatus(runId, 'failed');
      await createDeadLetter({
        tenantId: run.tenant_id,
        runId,
        stepKey,
        reason: lastError || 'Step failed after retries',
        payload: { step, event: run.event_payload },
      });
      return { ok: false, failedStepKey: stepKey, error: lastError };
    }
  }

  await setWorkflowRunStatus(runId, 'succeeded');
  return { ok: true };
}

export async function ingestWorkflowEvent(params: {
  tenantId: number | null;
  eventType: WorkflowTriggerType;
  eventPayload: Record<string, unknown>;
}) {
  const workflows = await listActiveWorkflowsByTrigger(params.tenantId, params.eventType);

  const enqueued: number[] = [];
  const skipped: Array<{ workflow_id: number; reason: string }> = [];

  for (const workflow of workflows) {
    const matches = evaluateConditions(params.eventPayload, workflow.conditions);
    if (!matches) {
      skipped.push({ workflow_id: workflow.id, reason: 'conditions_not_met' });
      continue;
    }

    const idempotencyKey = buildIdempotencyKey(params.eventType, params.eventPayload, workflow.id, workflow.version);
    const run = await createWorkflowRun({
      tenantId: params.tenantId,
      workflowId: workflow.id,
      eventType: params.eventType,
      eventPayload: params.eventPayload,
      idempotencyKey,
    });

    if (!run) {
      skipped.push({ workflow_id: workflow.id, reason: 'duplicate_event' });
      continue;
    }

    await enqueueWorkflowRun(run.id);
    enqueued.push(run.id);
  }

  return {
    matched_workflows: workflows.length,
    queued_runs: enqueued,
    skipped,
  };
}

export async function drainWorkflowQueue(maxJobs = 20) {
  const results: Array<{ run_id: number; ok: boolean; error?: string }> = [];

  for (let i = 0; i < Math.max(1, maxJobs); i += 1) {
    const item = await dequeueWorkflowRun();
    if (!item) break;

    const exec = await executeRun(item.runId);
    results.push({ run_id: item.runId, ok: exec.ok, error: exec.error });
    await deleteQueueItem(item.queueId);
  }

  return {
    processed: results.length,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
}
