import { NextResponse } from 'next/server';
import { createSalesInquiryRecord } from '@/app/lib/supabase-store';

const TO_EMAIL = process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'communications@ofroot.technology';
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM || 'no-reply@ofroot.technology';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'OfRoot';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, 320) : '';
    const website = typeof body?.website === 'string' ? body.website.trim().slice(0, 2048) : '';
    const adsAccount = typeof body?.ads_account === 'string' ? body.ads_account.trim().slice(0, 240) : '';

    if (!name || !email || !website) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Persist before notification so a missing or unavailable email provider cannot
    // turn a successful browser response into a silently lost sales inquiry.
    await createSalesInquiryRecord({
      name,
      email,
      business_name: null,
      business_formation_status: null,
      llc_upsell_opportunity: false,
      payload: {
        message: 'AI audit request',
        form: {
          ctaSource: 'subscribe-audit-modal',
          website,
          adsAccount: adsAccount || null,
        },
      },
    });

    // Optionally forward via Resend if key is present
    if (RESEND_KEY) {
      try {
        const providerResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [TO_EMAIL],
            subject: 'New AI audit request',
            text: `Name: ${name}\nEmail: ${email}\nWebsite: ${website}\nAds: ${adsAccount || '-'}\nTime: ${new Date().toISOString()}`,
          }),
        });
        if (!providerResponse.ok) {
          console.warn('[audit-inquiry] notification failed', { status: providerResponse.status });
        }
      } catch {
        console.warn('[audit-inquiry] notification failed', { reason: 'provider_exception' });
      }
    }
    return NextResponse.json({ ok: true });
  } catch {
    console.error('[audit-inquiry] capture failed', { reason: 'persistence_error' });
    return NextResponse.json({ ok: false, error: 'Unable to save audit request' }, { status: 500 });
  }
}
