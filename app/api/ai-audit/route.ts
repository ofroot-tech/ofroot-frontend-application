import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auditDomain } from '@/app/lib/ai-audit';
import { AuditError, guardRequest, loadAudit, readAuditJson, signAudit } from '@/app/lib/ai-audit-server';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(req: Request) {
  try {
    guardRequest(req, 'scan');
    const body = z.object({ url: z.string().min(1).max(2048), mode: z.enum(['website', 'full']).default('website'), refresh: z.boolean().default(false) }).safeParse(await readAuditJson(req, 4000));
    if (!body.success) throw new AuditError('Enter a valid public website URL.', 400);
    let domain: string; try { domain = auditDomain(body.data.url); } catch { throw new AuditError('Enter a public website domain, such as example.com.', 400); }
    const report = await loadAudit(domain, body.data.refresh);
    return NextResponse.json({ report, token: signAudit(report, body.data.mode) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const e = error instanceof AuditError ? error : new AuditError('The scan could not be completed. Please try again.');
    return NextResponse.json({ error: e.message }, { status: e.status, headers: { 'Cache-Control': 'no-store', ...(e.retryAfter ? { 'Retry-After': e.retryAfter } : {}) } });
  }
}
