import { NextRequest, NextResponse } from 'next/server';
import {
  markAutomationAbandonmentNotified,
  upsertAutomationAbandonment,
} from '@/app/lib/supabase-store';

const TO_EMAIL = process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'communications@ofroot.technology';
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM || 'onboarding@resend.dev';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'OfRoot';

const emailRegex = /^\S+@\S+\.\S+$/;

async function parsePayload(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return await req.json().catch(() => ({}));
  }

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    return Object.fromEntries(form.entries());
  }

  const text = await req.text().catch(() => '');
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function extractResendAllowedRecipient(message: string | undefined): string | null {
  if (!message) return null;
  const match = message.match(/own email address \(([^)]+)\)/i);
  return match?.[1]?.trim()?.toLowerCase() || null;
}

export async function POST(req: NextRequest) {
  const body = await parsePayload(req);

  const rawStage = String(body?.stage || 'start').trim().toLowerCase();
  const stage: 'start' | 'services' = rawStage === 'services' ? 'services' : 'start';
  const email = String(body?.business_email || body?.email || '').trim().toLowerCase();
  const fullName = String(body?.full_name || body?.name || '').trim();
  const companyName = String(body?.company_name || '').trim();
  const reason = String(body?.reason || 'inactivity').trim();
  const inactivitySeconds = Number.isFinite(Number(body?.inactivity_seconds))
    ? Math.max(0, Number(body?.inactivity_seconds))
    : undefined;
  const path = String(body?.path || '/onboarding/automations').trim();
  const primaryChannel = String(body?.primary_channel || '').trim();
  const consent = body?.consent;
  const phone = String(body?.phone || '').trim();
  const zip = String(body?.zip || '').trim();
  const targetServiceOutcome = String(body?.target_service_outcome || '').trim();
  const escalationDestination = String(body?.escalation_destination || '').trim();
  const autoResponseEnabled = body?.auto_response_enabled;
  const csvCaptureEnabled = body?.csv_capture_enabled;
  const triggerTypes = Array.isArray(body?.trigger_types) ? body.trigger_types.map((x: unknown) => String(x)) : [];
  const selectedAutomations = Array.isArray(body?.selected_automations)
    ? body.selected_automations.map((x: unknown) => String(x))
    : [];

  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ ok: false, error: { message: 'Valid email is required' } }, { status: 400 });
  }

  if (!fullName) {
    return NextResponse.json({ ok: false, error: { message: 'Name is required' } }, { status: 400 });
  }

  const payload = {
    stage,
    reason,
    inactivity_seconds: inactivitySeconds,
    path,
    primary_channel: primaryChannel || undefined,
    consent: typeof consent === 'boolean' ? consent : undefined,
    phone: phone || undefined,
    zip: zip || undefined,
    target_service_outcome: targetServiceOutcome || undefined,
    escalation_destination: escalationDestination || undefined,
    auto_response_enabled: typeof autoResponseEnabled === 'boolean' ? autoResponseEnabled : undefined,
    csv_capture_enabled: typeof csvCaptureEnabled === 'boolean' ? csvCaptureEnabled : undefined,
    trigger_types: triggerTypes,
    selected_automations: selectedAutomations,
    captured_at: new Date().toISOString(),
  } satisfies Record<string, unknown>;

  let persisted = true;
  try {
    await upsertAutomationAbandonment({
      email,
      stage,
      full_name: fullName,
      company_name: companyName,
      reason,
      payload,
    });
  } catch (err: any) {
    persisted = false;
    console.warn('Failed to persist abandoned onboarding capture:', err?.message || err);
  }

  console.info('[automation-onboarding.capture-email]', {
    email,
    fullName,
    companyName,
    stage,
    reason,
    inactivitySeconds,
    primaryChannel,
    consent,
    phone,
    zip,
    targetServiceOutcome,
    escalationDestination,
    autoResponseEnabled,
    csvCaptureEnabled,
    triggerTypes,
    selectedAutomations,
    path,
    at: new Date().toISOString(),
  });

  if (!RESEND_KEY) {
    return NextResponse.json({ ok: true, data: { persisted, notified: false } });
  }

  const subjectStage = stage === 'services' ? 'Services Step' : 'Start Step';
  const subject = `Abandoned automation onboarding (${subjectStage}): ${email}`;
  const text = [
    `Email: ${email}`,
    `Stage: ${stage}`,
    `Reason: ${reason}`,
    `Inactivity seconds: ${inactivitySeconds ?? '-'}`,
    `Path: ${path}`,
    `Name: ${fullName || '-'}`,
    `Company: ${companyName || '-'}`,
    `Primary channel: ${primaryChannel || '-'}`,
    `Consent: ${consent === true ? 'true' : consent === false ? 'false' : '-'}`,
    `Phone: ${phone || '-'}`,
    `ZIP: ${zip || '-'}`,
    `Target service outcome: ${targetServiceOutcome || '-'}`,
    `Escalation destination: ${escalationDestination || '-'}`,
    `Auto response enabled: ${typeof autoResponseEnabled === 'boolean' ? String(autoResponseEnabled) : '-'}`,
    `CSV capture enabled: ${typeof csvCaptureEnabled === 'boolean' ? String(csvCaptureEnabled) : '-'}`,
    `Trigger types: ${triggerTypes.length ? triggerTypes.join(', ') : '-'}`,
    `Selected automations: ${selectedAutomations.length ? selectedAutomations.join(', ') : '-'}`,
    `Time: ${new Date().toISOString()}`,
  ].join('\n');

  try {
    const send = async (fromAddress: string, toAddress: string) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <${fromAddress}>`,
          to: [toAddress],
          subject,
          text,
        }),
      });

    const parseMessage = (bodyText: string) => {
      try {
        return (JSON.parse(bodyText || '{}') as { message?: string }).message || '';
      } catch {
        return '';
      }
    };

    let resendRes = await send(FROM_EMAIL, TO_EMAIL);
    if (!resendRes.ok) {
      const bodyText = await resendRes.text().catch(() => '');
      const message = parseMessage(bodyText);

      if (FROM_EMAIL !== 'onboarding@resend.dev') {
        await new Promise((resolve) => setTimeout(resolve, 700));
        resendRes = await send('onboarding@resend.dev', TO_EMAIL);
      }

      if (!resendRes.ok) {
        const fallbackBody = await resendRes.text().catch(() => '');
        const fallbackMessage = parseMessage(fallbackBody || message);
        const allowedRecipient = extractResendAllowedRecipient(fallbackMessage);
        if (allowedRecipient) {
          await new Promise((resolve) => setTimeout(resolve, 700));
          resendRes = await send('onboarding@resend.dev', allowedRecipient);
        } else {
          console.warn('Failed to send abandoned onboarding email via Resend:', resendRes.status, fallbackBody || bodyText);
          return NextResponse.json(
            { ok: false, error: { message: 'Failed to send abandoned onboarding email' } },
            { status: 502 }
          );
        }
      }
    }

    if (!resendRes.ok) {
      const bodyText = await resendRes.text().catch(() => '');
      console.warn('Failed to send abandoned onboarding email via Resend:', resendRes.status, bodyText);
      return NextResponse.json(
        { ok: false, error: { message: 'Failed to send abandoned onboarding email' } },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.warn('Failed to send abandoned onboarding email via Resend:', error?.message || error);
    return NextResponse.json(
      { ok: false, error: { message: 'Failed to send abandoned onboarding email' } },
      { status: 502 }
    );
  }

  if (persisted) {
    try {
      await markAutomationAbandonmentNotified({ email, stage });
    } catch (err: any) {
      console.warn('Failed to mark abandoned onboarding capture as notified:', err?.message || err);
    }
  }

  return NextResponse.json({ ok: true, data: { persisted, notified: true } });
}
