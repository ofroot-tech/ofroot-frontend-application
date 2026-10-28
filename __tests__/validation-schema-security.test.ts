import { oraReportSchema } from '../app/lib/ai-audit';
import { AUTOMATION_CATALOG_IDS } from '../app/lib/automation-catalog';
import {
  automationOnboardingCompleteSchema,
  automationOnboardingStartSchema,
  zodIssuesToFieldErrors,
} from '../app/lib/automation-onboarding';

// Dependency updates must preserve the values and field errors consumed by the
// existing intake routes while bounding validation work on untrusted arrays.
const intake = {
  phone: ' 3125550100 ',
  zip: ' 60601 ',
  target_service_outcome: ' Qualify inbound leads ',
  selected_automations: ['lead_capture_csv'],
  escalation_destination: 'manual_follow_up',
};

test('preserves representative intake normalization and defaults', () => {
  expect(automationOnboardingCompleteSchema.parse(intake)).toEqual({
    phone: '3125550100',
    zip: '60601',
    target_service_outcome: 'Qualify inbound leads',
    selected_automations: ['lead_capture_csv'],
    escalation_destination: 'manual_follow_up',
    csv_capture_enabled: true,
    auto_response_enabled: false,
    trigger_types: [],
    qualification_questions: [],
  });
  expect(automationOnboardingStartSchema.parse({
    full_name: ' Alex Example ', business_email: ' alex@example.com ',
    company_name: ' Example Co ', primary_channel: 'both', consent: true,
  })).toEqual({
    full_name: 'Alex Example', business_email: 'alex@example.com',
    company_name: 'Example Co', primary_channel: 'both', consent: true,
  });
});

test('accepts the full supported catalogs and a bounded question sequence', () => {
  const questions = Array.from({ length: 20 }, (_, index) => `Question ${index + 1}?`);
  const parsed = automationOnboardingCompleteSchema.parse({
    ...intake,
    selected_automations: [...AUTOMATION_CATALOG_IDS],
    auto_response_enabled: true,
    dm_template: ' Thanks for reaching out. ',
    trigger_types: ['comments', 'inbound_dm', 'keyword', 'form_submit'],
    qualification_questions: questions,
  });
  expect(parsed.selected_automations).toEqual(AUTOMATION_CATALOG_IDS);
  expect(parsed.trigger_types).toHaveLength(4);
  expect(parsed.qualification_questions).toEqual(questions);
  expect(parsed.dm_template).toBe('Thanks for reaching out.');
});

test.each(['selected_automations', 'trigger_types', 'qualification_questions'] as const)(
  'rejects oversized invalid %s without accumulating per-element errors', field => {
    // Invalid elements make this a regression for the resource-exhaustion bug:
    // the size bound must fail before validating thousands of individual items.
    const parsed = automationOnboardingCompleteSchema.safeParse({
      ...intake, [field]: Array(5_000).fill(null),
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) throw new Error('Oversized intake was accepted');
    expect(parsed.error.issues).toHaveLength(1);
    expect(parsed.error.issues[0]).toMatchObject({ code: 'too_big', path: [field] });
    expect(zodIssuesToFieldErrors(parsed.error.issues)).toEqual({
      [field]: parsed.error.issues[0].message,
    });
  },
);

test('preserves auto-response validation field names and messages', () => {
  const parsed = automationOnboardingCompleteSchema.safeParse({ ...intake, auto_response_enabled: true });
  expect(parsed.success).toBe(false);
  if (parsed.success) throw new Error('Incomplete auto response was accepted');
  expect(zodIssuesToFieldErrors(parsed.error.issues)).toEqual({
    dm_template: 'DM template is required when auto response is enabled',
    trigger_types: 'Choose at least one trigger type when auto response is enabled',
  });
});

test('preserves arbitrary provider check identifiers and report defaults', () => {
  const report = {
    contractVersion: '1.24.0', domain: 'example.com', score: 80,
    generatedAt: '2026-10-27T20:00:00Z', analysisStatus: 'complete', layers: [],
    essentials: {
      score: 80, label: 'Good foundation', issues: ['provider-specific-check'],
      checks: { 'provider-specific-check': { tier: 'required', bonus: false } },
    },
  };
  expect(oraReportSchema.parse(report)).toEqual({
    ...report, pendingChecks: [], topFixes: [],
    essentials: { ...report.essentials, activeSurfaces: [] },
  });
});
