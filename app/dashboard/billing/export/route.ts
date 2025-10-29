import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api, type Invoice } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value || '';
}

function toCsvValue(v: unknown) {
  const s = v == null ? '' : String(v);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function toCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const head = headers.map(toCsvValue).join(',');
  const body = rows.map((r) => headers.map((h) => toCsvValue((r as any)[h])).join(',')).join('\n');
  return head + '\n' + body + '\n';
}

export async function GET(request: Request) {
  const token = await getToken();
  if (!token) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  // Fetch all pages (simple walk)
  let page = 1;
  const per_page = 100;
  const rows: any[] = [];
  for (;;) {
    const res = await api.adminListInvoices(token, { page, per_page }).catch(() => null);
    const data = res?.data || [];
    const meta = res?.meta || {} as any;
    data.forEach((inv: Invoice) => {
      if (status && inv.status !== status) return;
      rows.push({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        currency: inv.currency,
        amount: (inv.amount_cents / 100).toFixed(2),
        amount_due: (inv.amount_due_cents / 100).toFixed(2),
        due_date: inv.due_date?.slice(0,10) || '',
        created_at: inv.created_at?.slice(0,10) || '',
        external_id: inv.external_id || '',
      });
    });
    const last = meta?.last_page ?? (data.length < per_page ? page : page + 1);
    if (page >= last) break;
    page += 1;
  }

  const csv = toCsv(rows);
  const headers = new Headers({
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': `attachment; filename="invoices-${Date.now()}.csv"`,
  });
  return new NextResponse(csv, { headers });
}
