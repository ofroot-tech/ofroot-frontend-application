import { NextResponse } from 'next/server';

const TO_EMAIL = process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'ofroot.technology@gmail.com';
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM || 'no-reply@ofroot.technology';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'OfRoot';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, website, ads_account } = body || {};
    if (!name || !email || !website) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }
    console.log('[audit-inquiry]', { name, email, website, ads_account, at: new Date().toISOString() });

    // Optionally forward via Resend if key is present
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
            subject: 'New AI audit request',
            text: `Name: ${name}\nEmail: ${email}\nWebsite: ${website}\nAds: ${ads_account || '-'}\nTime: ${new Date().toISOString()}`,
          }),
        });
      } catch (e) {
        console.warn('Failed to send audit email via Resend:', (e as any)?.message || e);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
