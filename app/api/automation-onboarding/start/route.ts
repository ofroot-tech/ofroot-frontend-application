import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  AUTOMATION_ONBOARDING_COOKIE,
  AUTOMATION_ONBOARDING_MAX_AGE_SECONDS,
  automationOnboardingStartSchema,
  encodeAutomationOnboardingSession,
  sanitizeNextPath,
  zodIssuesToFieldErrors,
} from '@/app/lib/automation-onboarding';
import { upsertAutomationAbandonment } from '@/app/lib/supabase-store';
import { logger } from '@/app/lib/logger';

const SERVICES_PATH = '/onboarding/automations/services';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await req.json().catch(() => ({}))
    : Object.fromEntries((await req.formData()).entries());

  const parsed = automationOnboardingStartSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: 'Please complete all required onboarding fields',
          details: zodIssuesToFieldErrors(parsed.error.issues),
        },
      },
      { status: 400 }
    );
  }

  const nextPath = sanitizeNextPath(payload?.next || SERVICES_PATH) || SERVICES_PATH;
  const started_at = new Date().toISOString();
  const encoded = encodeAutomationOnboardingSession({ ...parsed.data, started_at });

  try {
    await upsertAutomationAbandonment({
      email: parsed.data.business_email,
      stage: 'start',
      full_name: parsed.data.full_name,
      company_name: parsed.data.company_name,
      reason: 'submitted_step_1',
      payload: {
        primary_channel: parsed.data.primary_channel,
        consent: parsed.data.consent,
        started_at,
        path: '/onboarding/automations',
      },
    });
  } catch (err: any) {
    logger.warn('automation.onboarding.start.persist_failed', { message: err?.message, status: err?.status });
  }

  const res = NextResponse.json({
    ok: true,
    data: {
      next: `/auth/login?next=${encodeURIComponent(nextPath)}`,
    },
  });

  res.cookies.set(AUTOMATION_ONBOARDING_COOKIE, encoded, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: AUTOMATION_ONBOARDING_MAX_AGE_SECONDS,
  });

  return res;
}
