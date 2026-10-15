import { NextResponse } from 'next/server';
import { createSalesInquiryRecord } from '@/app/lib/supabase-store';

const TO_EMAIL = process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'communications@ofroot.technology';
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM || 'no-reply@ofroot.technology';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'OfRoot';

// Minimal server-side handler for sales inquiries.
// In production, forward this to your backend CRM or send an email.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      name,
      email,
      message,
      businessName,
      businessFormationStatus,
      llcUpsellOpportunity,
      payload,
    } = body || {};

    if (!name || !email) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Log for visibility in dev
    console.log('[sales-inquiry]', { name, email, message, at: new Date().toISOString() });

    const capturedAt = new Date().toISOString();
    await createSalesInquiryRecord({
      name: String(name),
      email: String(email),
      business_name: String(businessName || '').trim() || null,
      business_formation_status: String(businessFormationStatus || '').trim() || null,
      llc_upsell_opportunity: Boolean(llcUpsellOpportunity),
      payload: {
        message: String(message || ''),
        form: payload && typeof payload === 'object' ? payload : {},
        pipeline: {
          stage: 'new',
          nextAction: 'Review inquiry and reply by email',
          nextActionAt: capturedAt,
          updatedAt: capturedAt,
        },
      },
    });

    // Optionally forward via Resend if configured
    if (RESEND_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [TO_EMAIL],
            subject: 'New sales inquiry',
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message || '-'}\nTime: ${new Date().toISOString()}`,
          }),
        });

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [String(email)],
            subject: 'We received your workflow audit request',
            text: [
              `Hi ${String(name).trim()},`,
              '',
              'Thanks for reaching out to OfRoot. We received your workflow-audit request and will review it personally.',
              '',
              'You can expect a reply by email within one business day with either a short fit-check question or a link to schedule a conversation.',
              '',
              '— OfRoot Technology',
            ].join('\n'),
          }),
        });
      } catch (e) {
        console.warn('Failed to send sales email via Resend:', (e as any)?.message || e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
