import { createHmac, timingSafeEqual, createHash } from 'node:crypto';
import { auditDomain, auditView, type AuditMode, type AuditReport, oraReportSchema } from './ai-audit';
import { z } from 'zod';

export class AuditError extends Error {
  constructor(message: string, public status = 502, public retryAfter?: string) { super(message); }
}
const requests = new Map<string, { until: number; count: number }>();
export function guardRequest(req: Request, action: string, limit = 8) {
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin) throw new AuditError('Please use the form on this website.', 403);
  const now = Date.now();
  for (const [key, value] of requests) if (value.until < now) requests.delete(key);
  // Best-effort instance guard; Ora enforces its own durable global scan quotas.
  if (requests.size > 5000) throw new AuditError('The scanner is busy. Try again in a minute.', 429, '60');
  const key = `${action}:${req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'}`;
  const window = requests.get(key) || { until: now + 60000, count: 0 };
  window.count++; requests.set(key, window);
  if (window.count > limit) throw new AuditError('Please wait a minute before trying again.', 429, '60');
}
export async function readAuditJson(req: Request, max = 24000) {
  if (!req.headers.get('content-type')?.includes('application/json')) throw new AuditError('Send a JSON request.', 415);
  if (Number(req.headers.get('content-length')) > max) throw new AuditError('Request too large.', 413);
  const reader = req.body?.getReader();
  if (!reader) throw new AuditError('Missing request.', 400);
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break;
      size += value.length; if (size > max) { await reader.cancel(); throw new AuditError('Request too large.', 413); } chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } catch (e) { if (e instanceof AuditError) throw e; throw new AuditError('Invalid request.', 400); }
}

export async function loadAudit(domain: string, refreshOnly = false): Promise<AuditReport> {
  const url = refreshOnly ? `https://ora.ai/api/score/${encodeURIComponent(domain)}?format=audit&include=essentials` : 'https://ora.ai/api/scan?format=audit&include=essentials';
  let response: Response;
  try {
    response = await fetch(url, {
      method: refreshOnly ? 'GET' : 'POST', cache: 'no-store', redirect: 'error',
      headers: { 'Content-Type': 'application/json', ...(process.env.ORA_SCAN_API_KEY ? { Authorization: `Bearer ${process.env.ORA_SCAN_API_KEY}` } : {}) },
      ...(refreshOnly ? {} : { body: JSON.stringify({ url: `https://${domain}`, maxAgeSeconds: 3600 }) }),
      signal: AbortSignal.timeout(45000),
    });
  } catch { throw new AuditError('The scan provider took too long to respond. Try again shortly.', 504); }
  if (response.status === 429) throw new AuditError('The free scan allowance is temporarily used up. Try again later, or book an OfRoot review below.', 429, response.headers.get('retry-after') || '3600');
  if (!response.ok) throw new AuditError(response.status === 400 ? 'The provider could not scan this site. Check that it is publicly reachable.' : 'The scan provider is unavailable. Please try again later.', response.status === 400 ? 400 : 502);
  const result = oraReportSchema.safeParse(await response.json().catch(() => null));
  if (!result.success) throw new AuditError('The provider returned an incomplete report. Please try again later.');
  if (auditDomain(result.data.domain) !== domain) throw new AuditError('The provider returned a report for a different domain.');
  return result.data;
}

const summarySchema = z.object({ domain: z.string().max(253), score: z.number().nullable(), label: z.string().max(80), scannedAt: z.string().max(60), issuedAt: z.number(), partial: z.boolean(), fixes: z.array(z.object({ name: z.string().max(300), recommendation: z.string().max(3000) })).max(3) });
function signingKey() { return process.env.NEXTAUTH_SECRET || process.env.RESEND_API_KEY; }
export function signAudit(report: AuditReport, mode: AuditMode) {
  const secret = signingKey(); if (!secret) return null;
  const view = auditView(report, mode);
  const summary = summarySchema.parse({ domain: report.domain, score: view.score, label: view.label, scannedAt: report.scannedAt || report.generatedAt, issuedAt: Date.now(), partial: view.partial, fixes: view.fixes.slice(0, 3).map(c => ({ name: c.name.slice(0, 300), recommendation: c.recommendation.slice(0, 3000) })) });
  const payload = Buffer.from(JSON.stringify(summary)).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(`ai-audit:${payload}`).digest('base64url')}`;
}
export function verifyAudit(token: string) {
  const secret = signingKey(); if (!secret) throw new AuditError('Fix-plan requests are temporarily unavailable.', 503);
  const [payload, signature, extra] = token.split('.');
  const expected = createHmac('sha256', secret).update(`ai-audit:${payload}`).digest('base64url');
  if (extra || !signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new AuditError('Run a new scan before requesting your fix plan.', 400);
  const parsed = summarySchema.safeParse(JSON.parse(Buffer.from(payload, 'base64url').toString()));
  if (!parsed.success || Date.now() - parsed.data.issuedAt > 86400000 || parsed.data.issuedAt > Date.now() + 60000) throw new AuditError('This report has expired. Run a new scan.', 400);
  return parsed.data;
}
export async function deliverFixPlan(name: string, email: string, token: string) {
  const summary = verifyAudit(token);
  if (!process.env.RESEND_API_KEY) throw new AuditError('Fix-plan requests are temporarily unavailable. Please book an OfRoot review.', 503);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `ai-audit-${createHash('sha256').update(`${email.toLowerCase()}:${token}`).digest('hex')}` },
    body: JSON.stringify({
      from: `${process.env.RESEND_FROM_NAME || 'OfRoot'} <${process.env.RESEND_FROM || 'no-reply@ofroot.technology'}>`,
      to: [process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'communications@ofroot.technology'], reply_to: email,
      subject: `AI readiness fix plan: ${summary.domain}`,
      text: `New OfRoot fix-plan request\nName: ${name}\nEmail: ${email}\nWebsite: https://${summary.domain}\nSource: AI readiness scanner (Ora)\n${summary.label}: ${summary.score ?? 'Not scored'}/100\nScanned: ${summary.scannedAt}\nAnalysis: ${summary.partial ? 'Partial' : 'Complete'}\nProvider report: https://ora.ai/${summary.domain}\n\nTop findings:\n${summary.fixes.map((fix, i) => `${i + 1}. ${fix.name}\n${fix.recommendation}`).join('\n\n')}\n\nThe visitor requested contact about an OfRoot implementation plan.`,
    }),
  });
  if (!response.ok) throw new AuditError('We could not deliver your request. Please retry or book an OfRoot review.', 502);
  const receipt = await response.json();
  if (!receipt.id) throw new AuditError('Delivery was not confirmed. Please retry.', 502);
}
