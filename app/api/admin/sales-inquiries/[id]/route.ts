import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { getUserFromSessionToken, updateSalesInquiryPipeline, type SalesInquiryPipelineUpdate } from '@/app/lib/supabase-store';

const STAGES = new Set<SalesInquiryPipelineUpdate['stage']>([
  'new', 'contacted', 'discovery', 'audit_proposed', 'audit_won', 'build_won', 'retainer_won', 'lost',
]);

function canViewOwnerFunnel(email?: string | null) {
  const normalized = String(email || '').trim().toLowerCase();
  const allow = (process.env.ADMIN_EMAILS || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  const ownerEmail = String(process.env.COMPANY_OWNER_EMAIL || '').trim().toLowerCase();
  return !!normalized && (normalized === ownerEmail || allow.includes(normalized));
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = await getAuthTokenFromRequest(req);
  const user = token ? await getUserFromSessionToken(token) : null;
  if (!user || !canViewOwnerFunnel(user.email)) return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });

  const id = Number.parseInt((await context.params).id, 10);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ ok: false, error: 'Invalid inquiry id' }, { status: 400 });

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const stage = String(body.stage || '') as SalesInquiryPipelineUpdate['stage'];
  if (!STAGES.has(stage)) return NextResponse.json({ ok: false, error: 'Invalid pipeline stage' }, { status: 400 });

  const record = await updateSalesInquiryPipeline(id, {
    stage,
    next_action: body.nextAction == null ? null : String(body.nextAction),
    next_action_at: body.nextActionAt == null ? null : String(body.nextActionAt),
  });
  if (!record) return NextResponse.json({ ok: false, error: 'Inquiry not found' }, { status: 404 });
  return NextResponse.json({ ok: true, data: record });
}
