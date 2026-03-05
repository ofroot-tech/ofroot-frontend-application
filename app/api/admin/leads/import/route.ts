import { NextRequest } from 'next/server';
import { z } from 'zod';
import { api } from '@/app/lib/api';
import { getAuthTokenFromRequest } from '@/app/lib/cookies';
import { fail, ok } from '@/app/lib/response';
import { logger } from '@/app/lib/logger';

const MAX_IMPORT_ROWS = 1000;

const formSchema = z.object({
  source: z.enum(['csv_upload', 'hubspot', 'facebook', 'other']),
  defaultService: z.string().trim().min(1).max(120).default('crm-import'),
  defaultZip: z.string().trim().min(1).max(20).default('00000'),
  defaultPhone: z.string().trim().min(1).max(40).default('0000000000'),
  csvText: z.string().optional(),
});

type CsvRow = Record<string, string>;

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

function parseCsvLine(line: string) {
  const out: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  out.push(current.trim());
  return out;
}

function parseCsv(csv: string): CsvRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function pickField(row: CsvRow, candidates: string[]) {
  for (const key of candidates) {
    const val = row[key];
    if (val && String(val).trim()) return String(val).trim();
  }
  return '';
}

export async function POST(req: NextRequest) {
  const token = await getAuthTokenFromRequest(req);
  if (!token) return fail('Unauthorized', 401);

  const me = await api.me(token).catch(() => null);
  if (!me) return fail('Unauthorized', 401);

  const form = await req.formData().catch(() => null);
  if (!form) return fail('Expected multipart form data.', 400);

  const rawSource = String(form.get('source') || '');
  const rawDefaultService = String(form.get('defaultService') || 'crm-import');
  const rawDefaultZip = String(form.get('defaultZip') || '00000');
  const rawDefaultPhone = String(form.get('defaultPhone') || '0000000000');
  const csvTextInput = String(form.get('csvText') || '');
  const parsed = formSchema.safeParse({
    source: rawSource,
    defaultService: rawDefaultService,
    defaultZip: rawDefaultZip,
    defaultPhone: rawDefaultPhone,
    csvText: csvTextInput || undefined,
  });
  if (!parsed.success) {
    return fail('Invalid import form payload.', 400, undefined, {
      details: parsed.error.flatten(),
    });
  }

  const file = form.get('file');
  const fileText =
    file && typeof file !== 'string' && 'text' in file
      ? await file.text()
      : '';
  const csvPayload = (parsed.data.csvText || fileText || '').trim();
  if (!csvPayload) {
    return fail('Provide CSV data via file upload or pasted text.', 400);
  }

  const rows = parseCsv(csvPayload);
  if (!rows.length) return fail('CSV appears empty or invalid.', 400);
  if (rows.length > MAX_IMPORT_ROWS) {
    return fail(`CSV too large. Maximum ${MAX_IMPORT_ROWS} rows per import.`, 400);
  }

  let imported = 0;
  let failed = 0;
  const errors: Array<{ row: number; reason: string }> = [];

  for (let idx = 0; idx < rows.length; idx += 1) {
    const row = rows[idx];
    const rowNum = idx + 2;
    const name = pickField(row, ['name', 'full_name', 'client_name', 'contact_name']);
    const email = pickField(row, ['email', 'email_address', 'work_email']);
    const phone =
      pickField(row, ['phone', 'phone_number', 'mobile', 'mobile_phone']) ||
      parsed.data.defaultPhone;
    const service =
      pickField(row, ['service', 'interest', 'need', 'service_interest']) ||
      parsed.data.defaultService;
    const zip =
      pickField(row, ['zip', 'zipcode', 'postal_code', 'postal']) ||
      parsed.data.defaultZip;
    const company = pickField(row, ['company', 'company_name', 'business', 'organization']);

    if (!phone || !service || !zip) {
      failed += 1;
      errors.push({ row: rowNum, reason: 'Missing phone/service/zip and defaults.' });
      continue;
    }

    try {
      await api.createLead({
        tenant_id: null,
        name: name || undefined,
        email: email || undefined,
        phone,
        service,
        zip,
        source: parsed.data.source,
        status: 'new',
        meta: {
          import: {
            source_type: parsed.data.source,
            imported_at: new Date().toISOString(),
            imported_by: me.email,
          },
          company_name: company || undefined,
          raw_row: row,
        },
      });
      imported += 1;
    } catch (err: any) {
      failed += 1;
      errors.push({
        row: rowNum,
        reason: err?.body?.message || err?.message || 'Failed to create lead',
      });
    }
  }

  logger.info('crm.leads.import.completed', {
    importedBy: me.email,
    source: parsed.data.source,
    totalRows: rows.length,
    imported,
    failed,
  });

  return ok({
    source: parsed.data.source,
    totalRows: rows.length,
    imported,
    failed,
    errors: errors.slice(0, 100),
  });
}
