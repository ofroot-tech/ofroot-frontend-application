// app/api/auth/register/route.ts

import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase-server';
import { setAuthCookie } from '@/app/lib/cookies';
import { logger } from '@/app/lib/logger';
import { created, fail } from '@/app/lib/response';
import { registerSchema } from '@/types/auth';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  let name = '', email = '', password = '';
  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({} as any));
    name = String(body.name || '');
    email = String(body.email || '');
    password = String(body.password || '');
  } else {
    const form = await req.formData();
    name = String(form.get('name') ?? '');
    email = String(form.get('email') ?? '');
    password = String(form.get('password') ?? '');
  }

  const parse = registerSchema.safeParse({ name, email, password });
  if (!parse.success) {
    logger.warn('auth.register.validation_failed', { issues: parse.error.issues });
    return fail('Name, email and password are required', 400);
  }

  try {
    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm for simplicity
    });
    if (error) throw error;

    // Insert into User table
    const { error: dbError } = await supabaseAdmin
      .from('User')
      .insert({
        id: data.user.id,
        name,
        email,
      });
    if (dbError) throw dbError;

    const res = created({});
    // For Supabase, we can't set session cookie server-side easily, so return success
    logger.info('auth.register.success', { email });
    return res;
  } catch (err: any) {
    logger.warn('auth.register.failed', { email, err: err?.message });
    return fail(err?.message || 'Registration failed', 500);
  }
}
