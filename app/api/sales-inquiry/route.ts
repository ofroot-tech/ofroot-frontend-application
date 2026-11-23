import { NextResponse } from 'next/server';
import { createSalesInquiryRecord } from '@/app/lib/supabase-store';
import { z } from 'zod';
import { HOUSTON_AC_FIELD_LIMITS as limits, HOUSTON_AC_OFFER as offer, HOUSTON_AC_ROLES as roles } from '@/app/lib/houston-rental-ac';

const houstonReview = z.object({
  role: z.enum(['hvac', 'property_manager']),
  company: z.string().trim().min(1).max(limits.company),
  email: z.string().trim().email().max(limits.email),
  size: z.number().int().min(1).max(limits.size),
  software: z.string().trim().min(1).max(limits.software),
  bottleneck: z.string().trim().min(1).max(limits.bottleneck),
});


const TO_EMAIL = process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'communications@ofroot.technology';
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM || 'no-reply@ofroot.technology';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'OfRoot';

// Minimal server-side handler for sales inquiries.
// In production, forward this to your backend CRM or send an email.
export async function POST(req: Request) {
  try {
    let body = await req.json().catch(() => ({}));
    const isHoustonReview = body?.offer === offer.id;
    if (isHoustonReview) {
      const parsed = houstonReview.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ ok: false, error: 'Complete all workflow review fields.' }, { status: 400 });
      }

      const { company, email, role, size, software, bottleneck } = parsed.data;
      const sizeLabel = role === 'hvac' ? 'Service vehicles' : 'Properties';
      const summary = [
        `Role: ${roles[role]}`,
        `${sizeLabel}: ${size}`,
        `Software: ${software}`,
        `Bottleneck: ${bottleneck}`,
      ].join('\n');
      body = {
        name: company,
        email,
        businessName: company,
        message: `${offer.name}\n\n${summary}`,
        payload: {
          ...parsed.data,
          offer: offer.id,
          ctaSource: offer.id,
          landingPage: offer.path,
          growthBottleneck: 'Rental A/C maintenance',
          desiredOutcome: summary,
        },
      };
    }

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
            subject: isHoustonReview ? 'New Houston rental A/C workflow review request' : 'New sales inquiry',
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
            subject: isHoustonReview ? 'We received your Houston rental A/C workflow review request' : 'We received your workflow audit request',
            text: [
              `Hi ${String(name).trim()},`,
              '',
              isHoustonReview
                ? 'Thanks for reaching out to OfRoot about your rental A/C maintenance workflow.'
                : 'Thanks for reaching out to OfRoot. We received your workflow-audit request and will review it personally.',
              '',
              isHoustonReview
                ? 'We’ll review your request and follow up by email about a time to talk.'
                : 'You can expect a reply by email within one business day with either a short fit-check question or a link to schedule a conversation.',
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
  } catch {
    return NextResponse.json({ ok: false, error: 'The inquiry could not be saved.' }, { status: 500 });
  }
}
