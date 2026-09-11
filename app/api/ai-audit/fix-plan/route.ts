import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuditError, deliverFixPlan, guardRequest, readAuditJson } from '@/app/lib/ai-audit-server';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    guardRequest(req, 'fix-plan', 3);
    const body = z.object({ name: z.string().trim().min(1).max(100), email: z.string().trim().email().max(254), token: z.string().max(20000), companyFax: z.string().max(200).default(''), consent: z.literal(true) }).safeParse(await readAuditJson(req));
    if (!body.success || body.data.companyFax) throw new AuditError('Check your name, email, and contact permission.', 400);
    await deliverFixPlan(body.data.name, body.data.email, body.data.token);
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const e = error instanceof AuditError ? error : new AuditError('We could not deliver your request. Please retry or book an OfRoot review.');
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
