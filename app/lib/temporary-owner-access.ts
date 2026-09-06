import { createHmac, timingSafeEqual } from 'crypto';
import type { User } from '@/app/lib/api';

const SESSION_PREFIX = 'ofroot-temp-owner';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type TemporaryAccessConfig = { email: string; password: string; secret: string };

function config(): TemporaryAccessConfig | null {
  const email = String(process.env.DASHBOARD_TEMP_ACCESS_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.DASHBOARD_TEMP_ACCESS_PASSWORD || '');
  const secret = String(process.env.DASHBOARD_TEMP_ACCESS_SECRET || '');
  return email && password && secret ? { email, password, secret } : null;
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function owner(configuredEmail: string): User {
  const now = new Date().toISOString();
  return {
    id: 0,
    name: 'OfRoot owner',
    email: configuredEmail,
    tenant_id: null,
    plan: 'business',
    billing_cycle: null,
    product_slug: 'temporary-owner-access',
    created_at: now,
    updated_at: now,
    roles: ['owner'],
    top_role: 'owner',
    enabled_features: [],
    enabled_editions: ['helpr', 'ontask'],
  } as User;
}

export function authenticateTemporaryOwner(emailInput: string, passwordInput: string): User | null {
  const settings = config();
  if (!settings) return null;
  const email = String(emailInput || '').trim().toLowerCase();
  return safeEquals(email, settings.email) && safeEquals(passwordInput, settings.password)
    ? owner(settings.email)
    : null;
}

export function createTemporaryOwnerSession(): string | null {
  const settings = config();
  if (!settings) return null;
  const payload = Buffer.from(JSON.stringify({ email: settings.email, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })).toString('base64url');
  const signature = createHmac('sha256', settings.secret).update(payload).digest('base64url');
  return `${SESSION_PREFIX}.${payload}.${signature}`;
}

export function getTemporaryOwnerFromSession(token: string): User | null {
  const settings = config();
  const [prefix, payload, signature, extra] = String(token || '').split('.');
  if (!settings || prefix !== SESSION_PREFIX || !payload || !signature || extra) return null;
  const expected = createHmac('sha256', settings.secret).update(payload).digest('base64url');
  if (!safeEquals(signature, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { email?: string; exp?: number };
    if (parsed.exp == null || parsed.exp <= Math.floor(Date.now() / 1000) || !safeEquals(String(parsed.email || '').toLowerCase(), settings.email)) return null;
    return owner(settings.email);
  } catch {
    return null;
  }
}
