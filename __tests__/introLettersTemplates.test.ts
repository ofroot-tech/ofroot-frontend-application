import { describe, it, expect } from '@jest/globals';
import {
  getDefaultIntroTemplate,
  renderIntroTemplate,
} from '../app/lib/introLettersTemplates';

describe('introLettersTemplates', () => {
  it('returns default template for both supported services', () => {
    const workflow = getDefaultIntroTemplate('workflow_automation');
    const landing = getDefaultIntroTemplate('landing_pages');

    expect(workflow.subjectTemplate).toContain('{{companyName}}');
    expect(workflow.bodyTemplate).toContain('{{serviceName}}');
    expect(landing.subjectTemplate).toContain('{{leaderName}}');
    expect(landing.bodyTemplate).toContain('{{senderName}}');
  });

  it('renders known tokens in a template string', () => {
    const rendered = renderIntroTemplate(
      'Hi {{leaderName}} from {{companyName}} re: {{serviceName}} by {{senderName}}',
      {
        leaderName: 'Alex',
        companyName: 'Acme',
        serviceName: 'workflow automation',
        senderName: 'Dimitri',
      }
    );

    expect(rendered).toBe('Hi Alex from Acme re: workflow automation by Dimitri');
  });

  it('keeps unknown tokens unchanged', () => {
    const rendered = renderIntroTemplate(
      'Hello {{leaderName}} {{unknownToken}}',
      {
        leaderName: 'Alex',
        companyName: 'Acme',
        serviceName: 'workflow automation',
        senderName: 'Dimitri',
      }
    );

    expect(rendered).toBe('Hello Alex {{unknownToken}}');
  });
});
