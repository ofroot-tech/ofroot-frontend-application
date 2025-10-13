// app/api/auth/magic-link/route.ts
//
// Passwordless (Magic Link) — Placeholder route
// ------------------------------------------------------------
// Narrative: We expose a future-facing endpoint so the UI can present a
// passwordless option without misleading users. Today it returns a clear and
// honest 501 Not Implemented response. When wiring email, implement provider
// logic here (e.g., SES/Resend/SendGrid) and generate a one-time token.

import { NextRequest } from 'next/server';
import { fail } from '@/app/lib/response';
import { logger } from '@/app/lib/logger';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  let email = '';
  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({} as any));
    email = String(body.email || '');
  } else {
    const form = await req.formData();
    email = String(form.get('email') ?? '');
  }

  const parse = schema.safeParse({ email });
  if (!parse.success) {
    logger.warn('auth.magic_link.validation_failed', { issues: parse.error.issues });
    return fail('Valid email is required', 400);
  }

  // Honest zero-state: not implemented yet.
  logger.info('auth.magic_link.requested', { email });
  return fail('Passwordless sign-in is not enabled yet. Please use your password.', 501);
}
