import { z } from 'zod';
import {
  AUTOMATION_CATALOG_IDS,
  type AutomationCatalogId,
  type AutomationDeliveryStatus,
} from '@/app/lib/automation-catalog';

export const AUTOMATION_ONBOARDING_COOKIE = 'ofroot_automation_onboarding';
export const AUTOMATION_ONBOARDING_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

export const automationOnboardingStartSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required'),
  business_email: z.string().trim().email('Valid business email is required'),
  company_name: z.string().trim().min(1, 'Company name is required'),
  primary_channel: z.enum(['instagram', 'facebook', 'both']),
  consent: z.literal(true),
});

export type AutomationOnboardingStartInput = z.infer<typeof automationOnboardingStartSchema>;

export const automationOnboardingTriggerTypeSchema = z.enum(['comments', 'inbound_dm', 'keyword', 'form_submit']);
export const automationCatalogIdSchema = z.enum(AUTOMATION_CATALOG_IDS);

export const automationOnboardingCompleteSchema = z.object({
  phone: z.string().trim().min(1, 'Phone is required'),
  zip: z.string().trim().min(1, 'ZIP is required'),
  target_service_outcome: z.string().trim().min(1, 'Target service outcome is required'),
  selected_automations: z.array(automationCatalogIdSchema).min(1, 'Choose at least one automation'),
  csv_capture_enabled: z.boolean().default(true),
  auto_response_enabled: z.boolean().default(false),
  instagram_handle: z.string().trim().optional().or(z.literal('')),
  facebook_page: z.string().trim().optional().or(z.literal('')),
  trigger_types: z.array(automationOnboardingTriggerTypeSchema).default([]),
  dm_template: z.string().trim().optional().or(z.literal('')),
  qualification_questions: z.array(z.string().trim().min(1)).default([]),
  escalation_destination: z.enum(['email', 'slack', 'manual_follow_up']),
}).superRefine((val, ctx) => {
  if (val.auto_response_enabled && !val.dm_template?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'DM template is required when auto response is enabled',
      path: ['dm_template'],
    });
  }
  if (val.auto_response_enabled && val.trigger_types.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Choose at least one trigger type when auto response is enabled',
      path: ['trigger_types'],
    });
  }
});

export type AutomationOnboardingCompleteInput = z.infer<typeof automationOnboardingCompleteSchema>;

export type AutomationOnboardingSession = AutomationOnboardingStartInput & {
  started_at: string;
};

export type AutomationMeta = {
  onboarding: {
    company_name: string;
    primary_channel: 'instagram' | 'facebook' | 'both';
    consent: true;
    started_at: string;
  };
  automation_services: {
    selected_automations: AutomationCatalogId[];
    csv_capture_enabled: boolean;
    auto_response_enabled: boolean;
    instagram_handle?: string;
    facebook_page?: string;
    trigger_types: Array<'comments' | 'inbound_dm' | 'keyword' | 'form_submit'>;
    dm_template?: string;
    qualification_questions?: string[];
    escalation_destination?: 'email' | 'slack' | 'manual_follow_up';
    target_service_outcome: string;
    automation_statuses?: Partial<Record<AutomationCatalogId, AutomationDeliveryStatus>>;
  };
  automation_build?: {
    current_stage: 'intake_submitted' | 'discovery_planning' | 'build_in_progress' | 'qa_review' | 'live';
    updated_at: string;
    blocked?: boolean;
    blocked_reason?: string;
    history?: Array<{
      stage: 'intake_submitted' | 'discovery_planning' | 'build_in_progress' | 'qa_review' | 'live';
      at: string;
      note?: string;
    }>;
  };
};

export function encodeAutomationOnboardingSession(session: AutomationOnboardingSession): string {
  return Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
}

export function decodeAutomationOnboardingSession(raw?: string | null): AutomationOnboardingSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    const result = automationOnboardingStartSchema.safeParse(parsed);
    if (!result.success) return null;
    const started_at = typeof parsed?.started_at === 'string' ? parsed.started_at : '';
    if (!started_at) return null;
    return { ...result.data, started_at };
  } catch {
    return null;
  }
}

export function sanitizeNextPath(next?: string | null): string | undefined {
  if (!next) return undefined;
  if (!next.startsWith('/')) return undefined;
  if (next.startsWith('//')) return undefined;
  return next;
}

export function zodIssuesToFieldErrors(issues: z.ZodIssue[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path?.[0] ? String(issue.path[0]) : 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
