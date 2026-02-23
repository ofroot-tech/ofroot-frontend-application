import { NextRequest } from 'next/server';
import type { Lead } from '@/app/lib/api';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { fail } from '@/app/lib/response';
import { getUserFromSessionToken, listLeadsPaginated } from '@/app/lib/supabase-store';

function csvEscape(val: unknown) {
  if (val == null) return '';
  const str = String(val);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function buildCsv(rows: Lead[]) {
  const headers = [
    'id',
    'created_at',
    'name',
    'email',
    'phone',
    'service',
    'zip',
    'source',
    'status',
    'tenant_id',
    'company_name',
    'primary_channel',
    'csv_capture_enabled',
    'auto_response_enabled',
    'selected_automations',
    'instagram_handle',
    'facebook_page',
    'trigger_types',
    'dm_template',
    'qualification_questions',
    'escalation_destination',
    'meta_json',
  ];

  const lines = [headers.join(',')];

  for (const lead of rows) {
    const meta = (lead.meta || {}) as any;
    const onboarding = meta?.onboarding || {};
    const services = meta?.automation_services || {};

    const row = [
      lead.id,
      lead.created_at || '',
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      lead.service || '',
      lead.zip || '',
      lead.source || '',
      lead.status || '',
      lead.tenant_id ?? '',
      onboarding.company_name || '',
      onboarding.primary_channel || '',
      services.csv_capture_enabled ?? '',
      services.auto_response_enabled ?? '',
      Array.isArray(services.selected_automations) ? services.selected_automations.join('|') : '',
      services.instagram_handle || '',
      services.facebook_page || '',
      Array.isArray(services.trigger_types) ? services.trigger_types.join('|') : '',
      services.dm_template || '',
      Array.isArray(services.qualification_questions) ? services.qualification_questions.join('|') : '',
      services.escalation_destination || '',
      Object.keys(meta || {}).length ? JSON.stringify(meta) : '',
    ];

    lines.push(row.map(csvEscape).join(','));
  }

  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  const token = await getAuthTokenFromRequest(req);
  if (!token) return fail('Unauthorized', 401);
  const user = await getUserFromSessionToken(token);
  if (!user) return fail('Unauthorized', 401);

  const q = req.nextUrl.searchParams.get('q') || undefined;
  const status = req.nextUrl.searchParams.get('status') || undefined;
  const zip = req.nextUrl.searchParams.get('zip') || undefined;
  const tenantRaw = req.nextUrl.searchParams.get('tenant_id');
  const tenant_id = tenantRaw ? Number(tenantRaw) : undefined;

  const per_page = 200;
  let page = 1;
  let lastPage = 1;
  const allRows: Lead[] = [];

  try {
    do {
      const res = await listLeadsPaginated({
        page,
        per_page,
        q,
        status,
        zip,
        tenant_id: Number.isFinite(tenant_id as number) ? tenant_id : undefined,
      });

      const rows = res.data || [];
      allRows.push(...rows);

      lastPage = res.meta?.last_page ?? page;
      page += 1;

      if (page > 1000) break;
    } while (page <= lastPage);

    const csv = buildCsv(allRows);
    const today = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-${today}.csv"`,
      },
    });
  } catch (err: any) {
    return fail(err?.body?.message || 'Failed to export leads', err?.status ?? 500);
  }
}
