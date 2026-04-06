"use client";

import * as React from 'react';
import { Card, CardBody } from '@/app/dashboard/_components/UI';
import type {
  WorkflowActionType,
  WorkflowCondition,
  WorkflowDefinition,
  WorkflowRun,
  WorkflowRunStep,
  WorkflowTriggerType,
} from '@/app/lib/api';

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error?: { message?: string } };

function readApiError<T>(res: ApiResponse<T> | null | undefined, fallback: string): string {
  if (!res) return fallback;
  if (res.ok) return fallback;
  return res.error?.message || fallback;
}

const TRIGGERS: Array<{ value: WorkflowTriggerType; label: string }> = [
  { value: 'lead.created', label: 'Lead Created' },
  { value: 'blog.draft_generated', label: 'Blog Draft Generated' },
  { value: 'invoice.status_changed', label: 'Invoice Status Changed' },
];

const ACTIONS: Array<{ value: WorkflowActionType; label: string }> = [
  { value: 'send_email', label: 'Send Email' },
  { value: 'send_webhook', label: 'Send Webhook' },
  { value: 'update_record', label: 'Update Record' },
  { value: 'ai_prompt', label: 'AI Prompt' },
];

export function WorkflowEnginePanel() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<WorkflowDefinition[]>([]);
  const [runs, setRuns] = React.useState<WorkflowRun[]>([]);
  const [selectedRun, setSelectedRun] = React.useState<{ run: WorkflowRun; steps: WorkflowRunStep[] } | null>(null);

  const [name, setName] = React.useState('');
  const [triggerType, setTriggerType] = React.useState<WorkflowTriggerType>('lead.created');
  const [conditionKey, setConditionKey] = React.useState('');
  const [conditionOperator, setConditionOperator] = React.useState<'equals' | 'contains' | 'greaterThan'>('equals');
  const [conditionValue, setConditionValue] = React.useState('');
  const [actionType, setActionType] = React.useState<WorkflowActionType>('send_email');
  const [actionConfig, setActionConfig] = React.useState('{"to":"owner@ofroot.technology","subject":"New lead","body":"Lead event received"}');
  const [saving, setSaving] = React.useState(false);
  const [draining, setDraining] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const [workflowRes, runRes] = await Promise.all([
      fetch('/api/workflows', { cache: 'no-store' }),
      fetch('/api/workflows/all-runs', { cache: 'no-store' }),
    ]);

    const workflowData = (await workflowRes.json().catch(() => null)) as ApiResponse<{ items: WorkflowDefinition[] }> | null;
    const runData = (await runRes.json().catch(() => null)) as ApiResponse<{ items: WorkflowRun[] }> | null;

    if (!workflowRes.ok || !workflowData?.ok) {
      setError(readApiError(workflowData, 'Unable to load workflows.'));
      setLoading(false);
      return;
    }

    if (!runRes.ok || !runData?.ok) {
      setError(readApiError(runData, 'Unable to load workflow runs.'));
      setLoading(false);
      return;
    }

    setItems(workflowData.data.items || []);
    setRuns(runData.data.items || []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function createWorkflow() {
    setSaving(true);
    setError(null);

    let parsedConfig: Record<string, unknown> = {};
    try {
      parsedConfig = JSON.parse(actionConfig || '{}');
    } catch {
      setSaving(false);
      setError('Action config must be valid JSON.');
      return;
    }

    const conditions: WorkflowCondition[] = conditionKey.trim()
      ? [{ key: conditionKey.trim(), operator: conditionOperator, value: conditionValue }]
      : [];

    const res = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        trigger_type: triggerType,
        conditions,
        steps: [{ key: 'step-1', action_type: actionType, config: parsedConfig }],
      }),
    });
    const data = (await res.json().catch(() => null)) as ApiResponse<{ item: WorkflowDefinition }> | null;
    if (!res.ok || !data?.ok) {
      setSaving(false);
      setError(readApiError(data, 'Failed to create workflow.'));
      return;
    }

    setName('');
    setConditionKey('');
    setConditionValue('');
    setSaving(false);
    await load();
  }

  async function setStatus(id: number, action: 'activate' | 'pause') {
    const res = await fetch(`/api/workflows/${id}/${action}`, { method: 'POST' });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error?.message || `Failed to ${action} workflow.`);
      return;
    }
    await load();
  }

  async function removeWorkflow(id: number) {
    const res = await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error?.message || 'Failed to delete workflow.');
      return;
    }
    await load();
  }

  async function testWorkflow(id: number, trigger: WorkflowTriggerType) {
    const payloadByTrigger: Record<WorkflowTriggerType, Record<string, unknown>> = {
      'lead.created': { id: 123, email: 'lead@example.com', status: 'new', score: 81 },
      'blog.draft_generated': { id: 55, title: 'AI for Service Ops', tags: ['ai', 'seo'] },
      'invoice.status_changed': { id: 9001, status: 'paid', amount_cents: 120000 },
    };

    const res = await fetch(`/api/workflows/${id}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_payload: payloadByTrigger[trigger] || {} }),
    });

    const data = (await res.json().catch(() => null)) as ApiResponse<{ queued_runs: number[] }> | null;
    if (!res.ok || !data?.ok) {
      setError(readApiError(data, 'Failed to enqueue test run.'));
      return;
    }

    await drainQueue();
  }

  async function drainQueue() {
    setDraining(true);
    const res = await fetch('/api/workflows/worker/drain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ max_jobs: 25 }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error?.message || 'Failed to drain workflow queue.');
      setDraining(false);
      return;
    }
    setDraining(false);
    await load();
  }

  async function openRun(runId: number) {
    const res = await fetch(`/api/workflows/run/${runId}`, { cache: 'no-store' });
    const data = (await res.json().catch(() => null)) as ApiResponse<{ run: WorkflowRun; steps: WorkflowRunStep[] }> | null;
    if (!res.ok || !data?.ok) {
      setError(readApiError(data, 'Failed to load run detail.'));
      return;
    }
    setSelectedRun({ run: data.data.run, steps: data.data.steps });
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Workflow Engine MVP</h2>
            <p className="text-sm text-gray-600">Create, activate, test, and monitor tenant-scoped automations.</p>
          </div>
          {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-gray-900">Workflow name</span>
              <input value={name} onChange={(e) => setName(e.currentTarget.value)} className="w-full rounded-md border px-3 py-2" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-gray-900">Trigger</span>
              <select value={triggerType} onChange={(e) => setTriggerType(e.currentTarget.value as WorkflowTriggerType)} className="w-full rounded-md border px-3 py-2">
                {TRIGGERS.map((trigger) => (
                  <option key={trigger.value} value={trigger.value}>{trigger.label}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-gray-900">Action</span>
              <select value={actionType} onChange={(e) => setActionType(e.currentTarget.value as WorkflowActionType)} className="w-full rounded-md border px-3 py-2">
                {ACTIONS.map((action) => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-gray-900">Condition key (optional)</span>
              <input value={conditionKey} onChange={(e) => setConditionKey(e.currentTarget.value)} placeholder="status" className="w-full rounded-md border px-3 py-2" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-gray-900">Operator</span>
              <select value={conditionOperator} onChange={(e) => setConditionOperator(e.currentTarget.value as any)} className="w-full rounded-md border px-3 py-2">
                <option value="equals">equals</option>
                <option value="contains">contains</option>
                <option value="greaterThan">greaterThan</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-gray-900">Value</span>
              <input value={conditionValue} onChange={(e) => setConditionValue(e.currentTarget.value)} placeholder="new" className="w-full rounded-md border px-3 py-2" />
            </label>
          </div>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-900">Action config JSON</span>
            <textarea value={actionConfig} onChange={(e) => setActionConfig(e.currentTarget.value)} rows={4} className="w-full rounded-md border px-3 py-2 font-mono text-xs" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button disabled={saving || !name.trim()} onClick={createWorkflow} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : 'Create workflow'}</button>
            <button disabled={draining} onClick={drainQueue} className="rounded-md border px-4 py-2 text-sm text-gray-900 disabled:opacity-50">{draining ? 'Draining…' : 'Drain queue'}</button>
            <button onClick={load} className="rounded-md border px-4 py-2 text-sm text-gray-900">Refresh</button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h3 className="text-sm font-semibold text-gray-900">Workflow Definitions</h3>
          {loading ? (
            <p className="mt-3 text-sm text-gray-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No workflows yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.trigger_type} · v{item.version} · {item.status}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.status !== 'active' ? (
                        <button onClick={() => setStatus(item.id, 'activate')} className="rounded border px-2.5 py-1 text-xs">Activate</button>
                      ) : (
                        <button onClick={() => setStatus(item.id, 'pause')} className="rounded border px-2.5 py-1 text-xs">Pause</button>
                      )}
                      <button onClick={() => testWorkflow(item.id, item.trigger_type)} className="rounded border px-2.5 py-1 text-xs">Test</button>
                      <button onClick={() => removeWorkflow(item.id)} className="rounded border px-2.5 py-1 text-xs text-red-700">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h3 className="text-sm font-semibold text-gray-900">Run History</h3>
          {runs.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No runs yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {runs.map((run) => (
                <button key={run.id} onClick={() => openRun(run.id)} className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-gray-50">
                  <span>Run #{run.id} · workflow {run.workflow_id} · {run.event_type}</span>
                  <span className="text-xs text-gray-600">{run.status}</span>
                </button>
              ))}
            </div>
          )}
          {selectedRun ? (
            <div className="mt-4 rounded-lg border bg-gray-50 p-3">
              <div className="mb-2 text-sm font-medium text-gray-900">Run #{selectedRun.run.id} details</div>
              <pre className="max-h-48 overflow-auto rounded bg-white p-2 text-xs text-gray-700">{JSON.stringify(selectedRun.run.event_payload, null, 2)}</pre>
              <div className="mt-3 space-y-2">
                {selectedRun.steps.map((step) => (
                  <div key={step.id} className="rounded border bg-white p-2 text-xs">
                    <div className="font-medium">{step.step_key} · {step.action_type} · {step.status} (attempt {step.attempt})</div>
                    {step.error_message ? <div className="mt-1 text-red-700">{step.error_message}</div> : null}
                    {Object.keys(step.output_payload || {}).length ? (
                      <pre className="mt-1 overflow-auto rounded bg-gray-50 p-2">{JSON.stringify(step.output_payload, null, 2)}</pre>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
