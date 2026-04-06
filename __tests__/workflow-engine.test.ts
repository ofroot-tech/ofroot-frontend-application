import { evaluateCondition, evaluateConditions } from '@/app/lib/workflows/engine';
import type { WorkflowCondition } from '@/app/lib/workflows/types';

describe('workflow condition evaluation', () => {
  const payload = {
    status: 'new',
    score: 82,
    lead: { email: 'hello@example.com' },
  } as Record<string, unknown>;

  it('supports equals operator', () => {
    const condition: WorkflowCondition = { key: 'status', operator: 'equals', value: 'new' };
    expect(evaluateCondition(payload, condition)).toBe(true);
  });

  it('supports contains operator with nested key', () => {
    const condition: WorkflowCondition = { key: 'lead.email', operator: 'contains', value: '@example.com' };
    expect(evaluateCondition(payload, condition)).toBe(true);
  });

  it('supports greaterThan operator', () => {
    const condition: WorkflowCondition = { key: 'score', operator: 'greaterThan', value: 80 };
    expect(evaluateCondition(payload, condition)).toBe(true);
  });

  it('requires all conditions to pass', () => {
    const conditions: WorkflowCondition[] = [
      { key: 'status', operator: 'equals', value: 'new' },
      { key: 'score', operator: 'greaterThan', value: 90 },
    ];
    expect(evaluateConditions(payload, conditions)).toBe(false);
  });
});
