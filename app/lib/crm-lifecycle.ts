import { api, type Contact, type Invoice, type Job, type Lead, type Quote } from '@/app/lib/api';

export type LifecycleStage =
  | 'new_lead'
  | 'qualified'
  | 'contact'
  | 'quoted'
  | 'scheduled'
  | 'active_job'
  | 'invoiced'
  | 'paid'
  | 'retention';

export type CrmLifecycleRecord = {
  key: string;
  tenant_id: number | null;
  name: string;
  email: string | null;
  phone: string | null;
  lead?: Lead;
  contact?: Contact;
  jobs: Job[];
  quotes: Quote[];
  invoices: Invoice[];
  stage: LifecycleStage;
  latestAt: string | null;
  nextAction: string;
  amountDueCents: number;
  amountPaidCents: number;
};

function normalizeEmail(value?: string | null): string | null {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized || null;
}

function normalizePhone(value?: string | null): string | null {
  const digits = String(value || '').replace(/\D+/g, '');
  return digits || null;
}

function lifecycleKey(input: {
  tenant_id?: number | null;
  email?: string | null;
  phone?: string | null;
  fallback: string;
}) {
  return [
    input.tenant_id ?? 'global',
    normalizeEmail(input.email) || 'no-email',
    normalizePhone(input.phone) || 'no-phone',
    input.fallback,
  ].join(':');
}

function latestDate(values: Array<string | null | undefined>): string | null {
  const timestamps = values
    .map((value) => {
      if (!value) return 0;
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    })
    .filter((value) => value > 0);

  if (!timestamps.length) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

function deriveStage(record: {
  lead?: Lead;
  contact?: Contact;
  jobs: Job[];
  quotes: Quote[];
  invoices: Invoice[];
}): LifecycleStage {
  const invoices = record.invoices || [];
  const jobs = record.jobs || [];
  const quotes = record.quotes || [];
  const leadStatus = String(record.lead?.status || '').toLowerCase();

  if (invoices.some((invoice) => invoice.status === 'paid')) return 'paid';
  if (invoices.some((invoice) => invoice.status === 'sent' || (invoice.amount_due_cents || 0) > 0)) return 'invoiced';
  if (jobs.some((job) => job.status === 'in_progress')) return 'active_job';
  if (jobs.some((job) => job.status === 'scheduled' || job.status === 'completed')) return 'scheduled';
  if (quotes.some((quote) => ['sent', 'viewed', 'approved', 'converted'].includes(String(quote.status)))) return 'quoted';
  if (record.contact) return 'contact';
  if (leadStatus === 'accepted' || leadStatus === 'quoted' || leadStatus === 'won') return 'qualified';
  return 'new_lead';
}

function nextActionForStage(stage: LifecycleStage, record: {
  invoices: Invoice[];
  quotes: Quote[];
  jobs: Job[];
}): string {
  if (stage === 'new_lead') return 'Respond and qualify the lead.';
  if (stage === 'qualified') return 'Convert the lead into a contact or quote.';
  if (stage === 'contact') return 'Build a quote or schedule work.';
  if (stage === 'quoted') return 'Follow up on the open quote.';
  if (stage === 'scheduled') return 'Confirm schedule and prep execution.';
  if (stage === 'active_job') return 'Complete work and convert to invoice.';
  if (stage === 'invoiced') {
    const overdue = record.invoices.find((invoice) => (invoice.amount_due_cents || 0) > 0);
    return overdue ? 'Collect payment and send reminders.' : 'Monitor payment progress.';
  }
  if (stage === 'paid') return 'Request a review and nurture repeat work.';
  return 'Check retention and reactivation opportunities.';
}

async function collectAllPages<T>(
  fetchPage: (page: number, perPage: number) => Promise<{ data?: T[]; meta?: { last_page?: number } } | null>,
  perPage: number = 100,
  maxPages: number = 6
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await fetchPage(page, perPage);
    if (!response) break;
    items.push(...(response.data || []));
    lastPage = response.meta?.last_page ?? page;
    page += 1;
  } while (page <= lastPage && page <= maxPages);

  return items;
}

export async function listCrmLifecycleRecords(token: string, opts?: {
  q?: string;
  tenant_id?: number | null;
}): Promise<CrmLifecycleRecord[]> {
  const [leads, contacts, invoices, quotes, jobs] = await Promise.all([
    collectAllPages<Lead>((page, perPage) => api.adminListLeads(token, { page, per_page: perPage, tenant_id: opts?.tenant_id ?? undefined }).catch(() => null)),
    collectAllPages<Contact>((page, perPage) => api.adminListContacts(token, { page, per_page: perPage, tenant_id: opts?.tenant_id ?? undefined }).catch(() => null)),
    collectAllPages<Invoice>((page, perPage) => api.adminListInvoices(token, { page, per_page: perPage }).catch(() => null)),
    collectAllPages<Quote>((page, perPage) => api.adminListQuotes(token, { page, per_page: perPage }).catch(() => null)),
    collectAllPages<Job>((page, perPage) => api.adminListJobs(token, { page, per_page: perPage }).catch(() => null)),
  ]);

  const grouped = new Map<string, CrmLifecycleRecord>();

  const ensureRecord = (input: {
    tenant_id?: number | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    fallback: string;
  }) => {
    const key = lifecycleKey(input);
    const existing = grouped.get(key);
    if (existing) return existing;

    const next: CrmLifecycleRecord = {
      key,
      tenant_id: input.tenant_id ?? null,
      name: String(input.name || '').trim() || 'Unknown customer',
      email: normalizeEmail(input.email),
      phone: normalizePhone(input.phone),
      jobs: [],
      quotes: [],
      invoices: [],
      latestAt: null,
      stage: 'new_lead',
      nextAction: 'Respond and qualify the lead.',
      amountDueCents: 0,
      amountPaidCents: 0,
    };
    grouped.set(key, next);
    return next;
  };

  for (const lead of leads) {
    const record = ensureRecord({
      tenant_id: lead.tenant_id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      fallback: `lead:${lead.id}`,
    });
    record.lead = lead;
    record.name = record.name === 'Unknown customer' ? lead.name || record.name : record.name;
  }

  for (const contact of contacts) {
    const record = ensureRecord({
      tenant_id: contact.tenant_id,
      name: [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.company,
      email: contact.email,
      phone: contact.phone,
      fallback: `contact:${contact.id}`,
    });
    record.contact = contact;
    record.name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.company || record.name;
  }

  for (const quote of quotes) {
    const contact = quote.contact;
    const lead = quote.lead;
    const record = ensureRecord({
      tenant_id: quote.tenant_id,
      name: [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') || contact?.company || lead?.name || quote.title,
      email: contact?.email || lead?.email || null,
      phone: contact?.phone || lead?.phone || null,
      fallback: `quote:${quote.id}`,
    });
    record.quotes.push(quote);
  }

  for (const job of jobs) {
    const contact = job.contact;
    const lead = job.lead;
    const record = ensureRecord({
      tenant_id: job.tenant_id,
      name: [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') || contact?.company || lead?.name || job.title,
      email: contact?.email || lead?.email || null,
      phone: contact?.phone || lead?.phone || null,
      fallback: `job:${job.id}`,
    });
    record.jobs.push(job);
  }

  for (const invoice of invoices) {
    const meta = (invoice.meta || {}) as Record<string, any>;
    const record = ensureRecord({
      tenant_id: invoice.tenant_id ?? null,
      name: meta.bill_to || meta.customer_name || invoice.number,
      email: meta.bill_to_email || meta.customer_email || null,
      phone: meta.bill_to_phone || meta.customer_phone || null,
      fallback: `invoice:${invoice.id}`,
    });
    record.invoices.push(invoice);
    record.amountDueCents += invoice.amount_due_cents || 0;
    record.amountPaidCents += invoice.amount_paid_cents || 0;
  }

  let items = Array.from(grouped.values()).map((record) => {
    const stage = deriveStage(record);
    const latestAt = latestDate([
      record.lead?.updated_at,
      record.lead?.created_at,
      record.contact?.updated_at,
      ...record.jobs.map((job) => job.updated_at || job.created_at || null),
      ...record.quotes.map((quote) => quote.updated_at || quote.created_at || null),
      ...record.invoices.map((invoice) => invoice.updated_at || invoice.created_at || null),
    ]);

    return {
      ...record,
      stage,
      latestAt,
      nextAction: nextActionForStage(stage, record),
    };
  });

  if (opts?.tenant_id != null) {
    items = items.filter((item) => item.tenant_id === opts.tenant_id);
  }

  if (opts?.q) {
    const query = opts.q.trim().toLowerCase();
    items = items.filter((item) =>
      item.name.toLowerCase().includes(query)
      || String(item.email || '').toLowerCase().includes(query)
      || String(item.phone || '').includes(query.replace(/\D+/g, ''))
      || item.jobs.some((job) => String(job.job_number || '').toLowerCase().includes(query))
      || item.quotes.some((quote) => String(quote.quote_number || '').toLowerCase().includes(query))
      || item.invoices.some((invoice) => String(invoice.number || '').toLowerCase().includes(query))
    );
  }

  return items.sort((a, b) => {
    const left = a.latestAt ? new Date(a.latestAt).getTime() : 0;
    const right = b.latestAt ? new Date(b.latestAt).getTime() : 0;
    return right - left;
  });
}
