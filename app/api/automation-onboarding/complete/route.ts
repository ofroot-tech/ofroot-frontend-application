import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import {
  AUTOMATION_ONBOARDING_COOKIE,
  AUTOMATION_ONBOARDING_MAX_AGE_SECONDS,
  automationOnboardingCompleteSchema,
  decodeAutomationOnboardingSession,
  zodIssuesToFieldErrors,
  type AutomationMeta,
} from '@/app/lib/automation-onboarding';
import { logger } from '@/app/lib/logger';
import { captureRouteException } from '@/app/api/_helpers/sentry';
import { createLeadRecord, getUserFromSessionToken } from '@/app/lib/supabase-store';
import { formatAutomationServiceSummary } from '@/app/lib/automation-catalog';

export async function POST(req: NextRequest) {
  const token = await getAuthTokenFromRequest();
  if (!token) {
    return NextResponse.json({ ok: false, error: { message: 'Unauthorized' } }, { status: 401 });
  }
  const user = await getUserFromSessionToken(token);
  if (!user) {
    return NextResponse.json({ ok: false, error: { message: 'Unauthorized' } }, { status: 401 });
  }

  const onboardingSessionRaw = req.cookies.get(AUTOMATION_ONBOARDING_COOKIE)?.value;
  const onboarding = decodeAutomationOnboardingSession(onboardingSessionRaw);
  if (!onboarding) {
    return NextResponse.json(
      { ok: false, error: { message: 'Onboarding session missing or expired' } },
      { status: 400 }
    );
  }

  const contentType = req.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await req.json().catch(() => ({}))
    : Object.fromEntries((await req.formData()).entries());

  const parsed = automationOnboardingCompleteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: 'Please complete required automation setup fields',
          details: zodIssuesToFieldErrors(parsed.error.issues),
        },
      },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const nowIso = new Date().toISOString();
  const automationStatuses = Object.fromEntries(
    input.selected_automations.map((id) => [id, 'queued'])
  ) as Record<string, 'queued'>;
  const normalizedService = formatAutomationServiceSummary(input.selected_automations) || input.target_service_outcome;

  const meta: AutomationMeta = {
    onboarding: {
      company_name: onboarding.company_name,
      primary_channel: onboarding.primary_channel,
      consent: true,
      started_at: onboarding.started_at,
    },
    automation_services: {
      selected_automations: input.selected_automations,
      csv_capture_enabled: input.csv_capture_enabled,
      auto_response_enabled: input.auto_response_enabled,
      trigger_types: input.trigger_types,
      target_service_outcome: input.target_service_outcome,
      automation_statuses: automationStatuses,
      escalation_destination: input.escalation_destination,
      instagram_handle: input.instagram_handle || undefined,
      facebook_page: input.facebook_page || undefined,
      dm_template: input.dm_template || undefined,
      qualification_questions: input.qualification_questions.length ? input.qualification_questions : undefined,
    },
    automation_build: {
      current_stage: 'intake_submitted',
      updated_at: nowIso,
      history: [
        {
          stage: 'intake_submitted',
          at: nowIso,
          note: 'Onboarding requirements submitted by client.',
        },
      ],
    },
  };

  try {
    const lead = await createLeadRecord({
      tenant_id: user.tenant_id ?? null,
      name: onboarding.full_name,
      email: onboarding.business_email,
      phone: input.phone,
      service: normalizedService,
      zip: input.zip,
      source: 'automation-onboarding',
      meta,
    });

    const res = NextResponse.json({ ok: true, data: { leadId: lead.id } });
    res.cookies.set(AUTOMATION_ONBOARDING_COOKIE, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
    return res;
  } catch (err: any) {
    captureRouteException(err, { route: 'automation-onboarding/complete' });
    logger.warn('automation.onboarding.complete.failed', { status: err?.status, message: err?.message });

    const res = NextResponse.json(
      {
        ok: false,
        error: { message: err?.body?.message || 'Failed to save automation setup' },
      },
      { status: err?.status ?? 500 }
    );

    res.cookies.set(AUTOMATION_ONBOARDING_COOKIE, onboardingSessionRaw || '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: AUTOMATION_ONBOARDING_MAX_AGE_SECONDS,
    });

    return res;
  }
}
