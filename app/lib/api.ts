// app/lib/api.ts
// Lightweight API client for the external Laravel backend.
// Works in both browser and server contexts in Next.js App Router.

import { API_BASE_URL } from './config';

export type ApiError = Error & {
  status: number;
  body?: unknown;
};

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return `${b}/${p}`;
}

function buildHeaders(init?: RequestInit, token?: string): HeadersInit {
  const headers = new Headers(init?.headers || {});
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

async function request<T>(path: string, init?: RequestInit & { timeoutMs?: number; token?: string }): Promise<T> {
  const { timeoutMs = 15000, token, ...fetchInit } = init || {};

  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  const id = timeoutMs && ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : undefined;

  try {
    const res = await fetch(joinUrl(API_BASE_URL, path), {
      ...fetchInit,
      headers: buildHeaders(fetchInit, token),
      signal: ctrl?.signal,
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const body = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

    if (!res.ok) {
      const err: ApiError = Object.assign(new Error((body as any)?.message || `Request failed (${res.status})`), {
        status: res.status,
        body,
        name: 'ApiError',
      });
      throw err;
    }

    return body as T;
  } finally {
    if (id) clearTimeout(id as any);
  }
}

export const http = {
  get: <T>(path: string, init?: RequestInit & { timeoutMs?: number; token?: string }) => request<T>(path, { method: 'GET', ...init }),
  postJson: <T>(path: string, data?: unknown, init?: RequestInit & { timeoutMs?: number; token?: string }) =>
    request<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined, ...init }),
  putJson: <T>(path: string, data?: unknown, init?: RequestInit & { timeoutMs?: number; token?: string }) =>
    request<T>(path, { method: 'PUT', body: data !== undefined ? JSON.stringify(data) : undefined, ...init }),
  del: <T>(path: string, init?: RequestInit & { timeoutMs?: number; token?: string }) => request<T>(path, { method: 'DELETE', ...init }),
};

// --------- Types (align with Laravel models) ---------
export type Tenant = {
  id: number;
  name?: string | null;
  domain?: string | null;
  plan?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Lead = {
  id: number;
  tenant_id: number | null;
  name?: string | null;
  email?: string | null;
  phone: string;
  service: string;
  zip: string;
  source?: string | null;
  status?: string;
  meta?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  tenant_id?: number | null;
  plan?: string | null;
  billing_cycle?: 'monthly' | 'yearly' | null;
  created_at?: string;
  updated_at?: string;
};

export type CreateLeadInput = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;

// Auth result shapes
export type AuthResponse = { message?: string; token: string; data: User };

// Admin types
export type AdminUser = {
  id: number;
  name: string;
  email: string;
  tenant_id?: number | null;
  roles: Array<{ id: number; name: string; slug: string }>;
  top_role: string;
  plan?: 'free' | 'pro' | 'business' | null;
  billing_cycle?: 'monthly' | 'yearly' | null;
  created_at?: string;
  updated_at?: string;
};

export type AdminMetrics = {
  tenants: number;
  users: number;
  mrr: number;
  subscribers: number;
  hours_saved_week?: number;
};

export type Subscriber = {
  id?: number | string;
  name?: string | null;
  email?: string | null;
  plan?: string | null;
  status?: string | null;
  mrr?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  start_date?: string | null;
};
export type BlogPost = {
  id: number;
  user_id: number;
  tenant_id?: number | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  status: 'draft' | 'published';
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Paginated<T> = { data: T[]; meta: { total: number; current_page?: number; per_page?: number; last_page?: number } };

// Docs types
export type Doc = { slug: string; title: string; body: string; updated_at?: string };
export type DocListItem = { slug: string; title: string; updated_at?: string };
// Public config types
export type PricingRule = { id?: number; product_id?: number; plan: 'pro' | 'business'; monthly?: string | number | null; yearly?: string | number | null };
export type PublicProduct = {
  id?: number;
  slug: string;
  kind: 'product' | 'service';
  name: string;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  anchor_price?: string | null;
  includes?: string[] | null;
  default_plan?: 'pro' | 'business' | null;
  pricingRules?: PricingRule[];
};
export type PublicLanding = { id?: number; slug: string; title?: string | null; body?: string | null };

// Invoicing types
export type InvoiceItem = {
  id?: number;
  invoice_id?: number;
  description: string;
  quantity: number;
  unit_amount_cents: number;
  total_cents: number;
};

export type Payment = {
  id: number;
  invoice_id: number;
  amount_cents: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  provider?: string | null;
  provider_payment_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Invoice = {
  id: number;
  tenant_id?: number | null;
  user_id?: number | null;
  number: string;
  currency: string;
  amount_cents: number;
  amount_paid_cents: number;
  amount_due_cents: number;
  status: 'draft' | 'sent' | 'paid' | 'void';
  due_date?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  external_id?: string | null;
  meta?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
  items?: InvoiceItem[];
  payments?: Payment[];
  payments_count?: number;
  items_count?: number;
};

// --------- Endpoint wrappers ---------
export const api = {
  // Super admin impersonation (returns token for a user with the requested role/plan)
  adminImpersonate: (token: string, params: { role?: string; plan?: string }) => {
    return http.postJson<{ message: string; token: string; user: User }>(
      '/admin/impersonate',
      params,
      { token }
    );
  },
  // Public
  createLead(input: CreateLeadInput) {
    return http.postJson<Lead>('/leads', input);
  },

  // Auth
  login(email: string, password: string, deviceName?: string) {
    return http.postJson<AuthResponse>('/auth/login', { email, password, device_name: deviceName ?? 'web' });
  },
  register(name: string, email: string, password: string, options?: { plan?: 'free' | 'pro' | 'business'; billingCycle?: 'monthly' | 'yearly'; coupon?: string }) {
    const payload: any = { name, email, password };
    if (options?.plan) payload.plan = options.plan;
    if (options?.billingCycle) payload.billingCycle = options.billingCycle;
    if (options?.coupon) payload.coupon = options.coupon;
    return http.postJson<AuthResponse>('/auth/register', payload);
  },
  me(token: string) {
    return http.get<User>('/auth/me', { token });
  },
  logout(token: string) {
    return http.postJson<{ message: string }>('/auth/logout', {}, { token });
  },

  // Admin (token required)
  assignLead(params: { leadId: number; tenantId: number }, token: string) {
    return http.postJson<Lead>('/leads/assign', { lead_id: params.leadId, tenant_id: params.tenantId }, { token });
  },
  unassignLead(params: { leadId: number }, token: string) {
    return http.postJson<Lead>('/leads/unassign', { lead_id: params.leadId }, { token });
  },

  listTenants(token: string) {
    return http.get<Tenant[]>('/tenants', { token });
  },
  createTenant(input: Partial<Tenant>, token: string) {
    return http.postJson<Tenant>('/tenants', input, { token });
  },
  updateTenant(id: number, input: Partial<Tenant>, token: string) {
    return http.putJson<Tenant>(`/tenants/${id}`, input, { token });
  },

  // Admin users list
  adminListUsers(token: string, opts?: { page?: number; per_page?: number }) {
    const params = new URLSearchParams();
    if (opts?.page) params.set('page', String(opts.page));
    if (opts?.per_page) params.set('per_page', String(opts.per_page));
    const path = `/admin/users${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<Paginated<AdminUser>>(path, { token });
  },

  // Admin tenants list
  adminListTenants(token: string, opts?: { page?: number; per_page?: number }) {
    const params = new URLSearchParams();
    if (opts?.page) params.set('page', String(opts.page));
    if (opts?.per_page) params.set('per_page', String(opts.per_page));
    const path = `/admin/tenants${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<Paginated<Tenant>>(path, { token });
  },

  // Admin subscribers list
  adminListSubscribers(token: string, opts?: { page?: number; per_page?: number }) {
    const params = new URLSearchParams();
    if (opts?.page) params.set('page', String(opts.page));
    if (opts?.per_page) params.set('per_page', String(opts.per_page));
    const path = `/admin/subscribers${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<Paginated<Subscriber>>(path, { token });
  },

  // Blog posts (blog add-on)
  blogList(token: string, opts?: { status?: 'draft' | 'published' }) {
    const params = new URLSearchParams();
    if (opts?.status) params.set('status', opts.status);
    const path = `/blog-posts${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<{ data: BlogPost[] }>(path, { token });
  },

  chatSend(message: string, token: string) {
    return http.postJson<{ data: { reply: string } }>('/chat', { message }, { token });
  },

  // Admin metrics
  adminMetrics(token: string, opts?: { range?: '7d' | '30d' | '90d' }) {
    const params = new URLSearchParams();
    if (opts?.range) params.set('range', opts.range);
    const path = `/admin/metrics${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<{ data: AdminMetrics }>(path, { token });
  },

  // Docs (public)
  publicListDocs() {
    return http.get<{ ok: true; data: { items: DocListItem[] } }>('/docs');
  },
  publicGetDoc(slug: string) {
    return http.get<{ ok: true; data: Doc }>(`/docs/${encodeURIComponent(slug)}`);
  },

  // Public config (admin-managed content)
  publicListProducts() {
    return http.get<PublicProduct[]>('/public/products');
  },
  publicListLandings() {
    return http.get<PublicLanding[]>('/public/landings');
  },

  // Docs (admin)
  adminListDocs(token: string) {
    return http.get<{ ok: true; data: { items: DocListItem[] } }>(`/admin/docs`, { token });
  },
  adminCreateDoc(input: { slug: string; title: string; body: string }, token: string) {
    return http.postJson<{ ok: true; data: { slug: string } }>(`/admin/docs`, input, { token });
  },
  adminGetDoc(slug: string, token: string) {
    return http.get<{ ok: true; data: Doc }>(`/admin/docs/${encodeURIComponent(slug)}`, { token });
  },
  adminUpdateDoc(slug: string, input: { title: string; body: string }, token: string) {
    return http.putJson<{ ok: true; data: { slug: string } }>(`/admin/docs/${encodeURIComponent(slug)}`, input, { token });
  },
  adminDeleteDoc(slug: string, token: string) {
    return http.del<{ ok: true; data: { slug: string } }>(`/admin/docs/${encodeURIComponent(slug)}`, { token });
  },

  // Invoices (admin)
  adminListInvoices(token: string, opts?: { page?: number; per_page?: number }) {
    const params = new URLSearchParams();
    if (opts?.page) params.set('page', String(opts.page));
    if (opts?.per_page) params.set('per_page', String(opts.per_page));
    const path = `/admin/invoices${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<{ data: Invoice[]; meta: Paginated<unknown>['meta'] }>(path, { token });
  },
  adminGetInvoice(id: number, token: string) {
    return http.get<{ data: Invoice }>(`/admin/invoices/${id}`, { token });
  },
  adminCreateInvoice(input: {
    tenant_id?: number | null;
    currency?: string;
    due_date?: string;
    period_start?: string;
    period_end?: string;
    items: Array<{ description: string; quantity?: number; unit_amount_cents: number }>;
    meta?: Record<string, any>;
  }, token: string) {
    return http.postJson<{ data: Invoice }>(`/admin/invoices`, input, { token });
  },
  adminUpdateInvoice(id: number, input: Partial<Pick<Invoice, 'status'|'due_date'|'meta'>>, token: string) {
    return http.putJson<{ data: Invoice }>(`/admin/invoices/${id}`, input, { token });
  },
  adminSendInvoice(id: number, token: string) {
    return http.postJson<{ data: Invoice }>(`/admin/invoices/${id}/send`, {}, { token });
  },
  adminRecordPayment(id: number, input: { amount_cents: number; currency?: string; status?: 'succeeded'|'pending'|'failed'|'refunded'; provider?: string; provider_payment_id?: string }, token: string) {
    return http.postJson<{ data: Invoice }>(`/admin/invoices/${id}/payments`, input, { token });
  },
};

// --------- High-level helpers for forms ---------
/**
 * Convert a FormData or plain object into a CreateLeadInput and submit to the API.
 * Accepts common field aliases: tenantId | tenant_id, and optional name/email.
 */
export async function submitLead(input: FormData | Record<string, any>) {
  const data: Record<string, any> = input instanceof FormData ? Object.fromEntries(input.entries()) : { ...input };

  // Normalize keys and required fields
  const lead: CreateLeadInput = {
    tenant_id: data.tenant_id ?? (data.tenantId != null ? Number(data.tenantId) : null),
    name: data.name ?? undefined,
    email: data.email ?? undefined,
    phone: String(data.phone ?? ''),
    service: String(data.service ?? ''),
    zip: String(data.zip ?? ''),
    source: data.source ?? undefined,
    status: data.status ?? undefined,
    meta: typeof data.meta === 'object' ? data.meta : undefined,
  } as CreateLeadInput;

  // Basic runtime guard for required fields
  if (!lead.phone || !lead.service || !lead.zip) {
    throw Object.assign(new Error('Missing required fields: phone, service, zip'), { name: 'ValidationError' });
  }

  return api.createLead(lead);
}
