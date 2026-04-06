import { createWorkflowDefinition, enableWorkflowFeatureForTenant, listWorkflowDefinitions } from '@/app/lib/workflows/store';
import type { CreateWorkflowInput, WorkflowActionType, WorkflowCondition, WorkflowTriggerType } from '@/app/lib/workflows/types';
import type { PlatformEdition } from '@/app/lib/platform-access';

export type WorkflowTemplate = {
  key: string;
  edition: PlatformEdition;
  name: string;
  description: string;
  trigger_type: WorkflowTriggerType;
  conditions?: WorkflowCondition[];
  steps: Array<{
    key: string;
    name: string;
    action_type: WorkflowActionType;
    config: Record<string, unknown>;
  }>;
  status?: CreateWorkflowInput['status'];
};

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    key: 'helpr-new-lead-alert',
    edition: 'helpr',
    name: 'Helpr: New lead operator alert',
    description: 'Notify the operator instantly when a new lead enters the shared CRM.',
    trigger_type: 'lead.created',
    steps: [
      {
        key: 'notify-operator',
        name: 'Notify operator',
        action_type: 'send_email',
        config: {
          subject: 'New Helpr lead needs follow-up',
          body: 'A new lead was captured. Open the dashboard and respond quickly while intent is fresh.',
        },
      },
    ],
    status: 'active',
  },
  {
    key: 'helpr-high-intent-score-flag',
    edition: 'helpr',
    name: 'Helpr: High-intent lead flag',
    description: 'Flag strong leads for immediate routing when the score indicates urgency.',
    trigger_type: 'lead.created',
    conditions: [{ key: 'score', operator: 'greaterThan', value: 74 }],
    steps: [
      {
        key: 'flag-lead-record',
        name: 'Flag lead',
        action_type: 'update_record',
        config: {
          record_type: 'lead',
          patch: {
            routing_priority: 'fast_follow_up',
            lifecycle_stage: 'qualified',
          },
        },
      },
    ],
    status: 'active',
  },
  {
    key: 'ontask-paid-invoice-review-request',
    edition: 'ontask',
    name: 'OnTask: Paid invoice review request',
    description: 'Trigger the post-payment review motion once an invoice is marked paid.',
    trigger_type: 'invoice.status_changed',
    conditions: [{ key: 'status', operator: 'equals', value: 'paid' }],
    steps: [
      {
        key: 'review-request-email',
        name: 'Send review request',
        action_type: 'send_email',
        config: {
          subject: 'Request a review from this customer',
          body: 'This invoice has been paid. Send the customer to the review center and ask for a public review while the experience is still fresh.',
        },
      },
    ],
    status: 'active',
  },
  {
    key: 'ontask-sent-invoice-collection-flag',
    edition: 'ontask',
    name: 'OnTask: Sent invoice collection follow-up',
    description: 'Flag invoices for collections work when they enter the sent state with money still due.',
    trigger_type: 'invoice.status_changed',
    conditions: [
      { key: 'status', operator: 'equals', value: 'sent' },
      { key: 'amount_due_cents', operator: 'greaterThan', value: 0 },
    ],
    steps: [
      {
        key: 'collection-follow-up',
        name: 'Flag invoice follow-up',
        action_type: 'update_record',
        config: {
          record_type: 'invoice',
          patch: {
            follow_up_queue: 'collections',
            lifecycle_stage: 'invoiced',
          },
        },
      },
    ],
    status: 'active',
  },
];

export function listWorkflowTemplates(edition?: PlatformEdition): WorkflowTemplate[] {
  if (!edition) return WORKFLOW_TEMPLATES.slice();
  return WORKFLOW_TEMPLATES.filter((template) => template.edition === edition);
}

export async function installWorkflowTemplate(input: {
  tenantId: number;
  userId: number;
  userEmail?: string | null;
  templateKey: string;
}): Promise<{ created: boolean; reason?: string; workflowId?: number }> {
  const template = WORKFLOW_TEMPLATES.find((item) => item.key === input.templateKey);
  if (!template) return { created: false, reason: 'template_not_found' };

  await enableWorkflowFeatureForTenant(input.tenantId);
  const existing = await listWorkflowDefinitions(input.tenantId);
  if (existing.some((workflow) => workflow.name === template.name)) {
    return { created: false, reason: 'already_installed' };
  }

  const created = await createWorkflowDefinition(
    {
      name: template.name,
      trigger_type: template.trigger_type,
      conditions: template.conditions || [],
      steps: template.steps.map((step) => ({
        key: step.key,
        name: step.name,
        action_type: step.action_type,
        config: {
          ...step.config,
          ...(step.action_type === 'send_email' ? { to: input.userEmail || String(step.config.to || '').trim() } : {}),
        },
      })),
      status: template.status || 'active',
    },
    input.tenantId,
    input.userId
  );

  return { created: true, workflowId: created.id };
}
