import { listWorkflowTemplates } from '@/app/lib/workflow-templates';

describe('workflow template catalog', () => {
  it('returns only Helpr templates for the Helpr edition', () => {
    const templates = listWorkflowTemplates('helpr');
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.every((template) => template.edition === 'helpr')).toBe(true);
  });

  it('returns only OnTask templates for the OnTask edition', () => {
    const templates = listWorkflowTemplates('ontask');
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.every((template) => template.edition === 'ontask')).toBe(true);
  });
});
