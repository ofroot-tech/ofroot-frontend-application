import { z } from 'zod';
import { fail, ok } from '@/app/lib/response';
import { logger } from '@/app/lib/logger';

const TO_EMAIL =
  process.env.CONTACT_EMAIL ||
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
  'communications@ofroot.technology';
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM || 'no-reply@ofroot.technology';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'OfRoot';

const snakeOfferSchema = z.object({
  email: z.string().trim().email(),
  attempts: z.number().int().nonnegative().max(50).optional(),
  score: z.number().int().nonnegative().max(1000).optional(),
  won: z.boolean().optional(),
  couponCode: z.string().trim().max(40).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = snakeOfferSchema.safeParse(body);
  if (!parsed.success) {
    return fail('Valid email is required.', 400);
  }

  const { email, attempts = 0, score = 0, won = false, couponCode = 'SNAKE10' } = parsed.data;
  logger.info('snake_offer.lead_received', {
    email,
    attempts,
    score,
    won,
  });

  if (!RESEND_KEY) {
    logger.warn('snake_offer.missing_resend_key');
    return ok({ accepted: true, queued: false });
  }

  try {
    const providerRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        subject: 'Snake Offer Lead (10% First Month)',
        text: [
          `Email: ${email}`,
          `Attempts: ${attempts}`,
          `Score: ${score}`,
          `Won board: ${won ? 'yes' : 'no'}`,
          `Coupon code: ${couponCode}`,
          `Time: ${new Date().toISOString()}`,
        ].join('\n'),
      }),
    });

    if (!providerRes.ok) {
      const text = await providerRes.text().catch(() => '');
      logger.error('snake_offer.resend_failed', { status: providerRes.status, body: text });
      return fail('Could not send request right now.', 502);
    }

    return ok({ accepted: true, queued: true });
  } catch (error: any) {
    logger.error('snake_offer.send_exception', { message: error?.message || String(error) });
    return fail('Could not send request right now.', 502);
  }
}
