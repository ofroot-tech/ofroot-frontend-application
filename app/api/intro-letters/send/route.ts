import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fail, ok } from '@/app/lib/response';
import { logger } from '@/app/lib/logger';
import {
  getIntroGateUser,
  INTRO_LETTERS_SESSION_COOKIE,
  verifyIntroSession,
} from '@/app/lib/introLettersAuth';
import {
  INTRO_SERVICE_LABELS,
  renderIntroTemplate,
} from '@/app/lib/introLettersTemplates';
import type { IntroService } from '@/app/lib/introLettersTemplates';

const MAX_RECIPIENTS = 25;

const recipientSchema = z.object({
  leaderName: z.string().trim().min(1).max(120),
  companyName: z.string().trim().min(1).max(160),
  email: z.string().trim().email(),
  title: z.string().trim().max(120).optional(),
});

const sendSchema = z.object({
  service: z.enum(['workflow_automation', 'landing_pages']),
  senderName: z.string().trim().min(1).max(120),
  subjectTemplate: z.string().min(1).max(220),
  bodyTemplate: z.string().min(1).max(6000),
  recipients: z.array(recipientSchema).min(1).max(MAX_RECIPIENTS),
});

type SendResult = {
  email: string;
  ok: boolean;
  message: string;
  providerId?: string;
};

function asText(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function getServiceName(service: IntroService) {
  return INTRO_SERVICE_LABELS[service];
}

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(INTRO_LETTERS_SESSION_COOKIE)?.value;
  const session = verifyIntroSession(sessionToken);
  if (!session) return fail('Not authenticated for intro letters.', 401);

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    logger.error('intro_letters.send.missing_resend_key');
    return fail('Email provider is not configured (missing RESEND_API_KEY).', 500);
  }

  const body = await req.json().catch(() => ({}));
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return fail('Invalid intro letter payload.', 400, undefined, {
      details: parsed.error.flatten(),
    });
  }

  const payload = parsed.data;
  if (payload.recipients.length > MAX_RECIPIENTS) {
    return fail(`A maximum of ${MAX_RECIPIENTS} recipients is allowed per send.`, 400);
  }

  const fromEmail = process.env.RESEND_FROM || 'no-reply@ofroot.technology';
  const fromName = process.env.RESEND_FROM_NAME || 'OfRoot';
  const replyTo = process.env.INTRO_LETTERS_REPLY_TO || getIntroGateUser();
  const serviceName = getServiceName(payload.service);

  const results: SendResult[] = [];
  for (const recipient of payload.recipients) {
    const subject = renderIntroTemplate(payload.subjectTemplate, {
      leaderName: recipient.leaderName,
      companyName: recipient.companyName,
      serviceName,
      senderName: payload.senderName,
    });
    const letterText = renderIntroTemplate(payload.bodyTemplate, {
      leaderName: recipient.leaderName,
      companyName: recipient.companyName,
      serviceName,
      senderName: payload.senderName,
    });

    try {
      const providerRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [recipient.email],
          reply_to: replyTo,
          subject,
          text: letterText,
        }),
      });

      const providerBody = await providerRes.json().catch(() => ({}));
      if (!providerRes.ok) {
        const message = asText((providerBody as any)?.message) || `Provider error (${providerRes.status})`;
        logger.warn('intro_letters.send.provider_failed', {
          requester: session.username,
          email: recipient.email,
          status: providerRes.status,
        });
        results.push({
          email: recipient.email,
          ok: false,
          message,
        });
        continue;
      }

      const providerId = asText((providerBody as any)?.id) || undefined;
      results.push({
        email: recipient.email,
        ok: true,
        message: 'Sent',
        providerId,
      });
    } catch (err: any) {
      logger.warn('intro_letters.send.fetch_error', {
        requester: session.username,
        email: recipient.email,
        err: err?.message || 'unknown',
      });
      results.push({
        email: recipient.email,
        ok: false,
        message: err?.message || 'Unexpected provider error',
      });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;
  logger.info('intro_letters.send.completed', {
    requester: session.username,
    service: payload.service,
    total: results.length,
    sent,
    failed,
  });

  return ok({
    summary: {
      total: results.length,
      sent,
      failed,
    },
    results,
  });
}
