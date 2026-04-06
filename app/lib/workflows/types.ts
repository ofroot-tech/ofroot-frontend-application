export type WorkflowTriggerType = 'lead.created' | 'blog.draft_generated' | 'invoice.status_changed';
export type WorkflowActionType = 'send_email' | 'send_webhook' | 'update_record' | 'ai_prompt';

export type WorkflowStatus = 'draft' | 'active' | 'paused';
export type WorkflowRunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'partial';
export type WorkflowRunStepStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'skipped';

export type WorkflowConditionOperator = 'equals' | 'contains' | 'greaterThan';

export type WorkflowCondition = {
  key: string;
  operator: WorkflowConditionOperator;
  value: string | number | boolean;
};

export type WorkflowStep = {
  key: string;
  name?: string;
  action_type: WorkflowActionType;
  config: Record<string, unknown>;
};

export type WorkflowDefinition = {
  id: number;
  tenant_id: number | null;
  name: string;
  status: WorkflowStatus;
  trigger_type: WorkflowTriggerType;
  trigger_config: Record<string, unknown>;
  conditions: WorkflowCondition[];
  steps: WorkflowStep[];
  version: number;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type WorkflowRun = {
  id: number;
  tenant_id: number | null;
  workflow_id: number;
  event_type: WorkflowTriggerType;
  event_payload: Record<string, unknown>;
  status: WorkflowRunStatus;
  attempt_count: number;
  idempotency_key: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkflowRunStep = {
  id: number;
  run_id: number;
  step_key: string;
  action_type: WorkflowActionType;
  status: WorkflowRunStepStatus;
  attempt: number;
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown>;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateWorkflowInput = {
  name: string;
  trigger_type: WorkflowTriggerType;
  trigger_config?: Record<string, unknown>;
  conditions?: WorkflowCondition[];
  steps?: WorkflowStep[];
  status?: WorkflowStatus;
};

export type UpdateWorkflowInput = Partial<CreateWorkflowInput>;

export type TestWorkflowInput = {
  event_payload: Record<string, unknown>;
};

export type WorkflowRunDetail = {
  run: WorkflowRun;
  steps: WorkflowRunStep[];
};
