// ============================================================
// File: app/lib/api.ts
// Purpose: Provide a unified, typed API client for the Laravel backend.
// Reason: Ensures all network calls in Next.js App Router share consistent
//         headers, timeouts, error handling, and typing.
// ============================================================

import { API_BASE_URL } from './config';

// ------------------------------------------------------------
// Type: ApiError
// Purpose: Extend Error to include HTTP status and optional response body.
// Reason: Allows callers to identify and debug API-level errors easily.
// ------------------------------------------------------------
export type ApiError = Error & {
  status: number;
  body?: unknown;
};

// ------------------------------------------------------------
// Utility: joinUrl
// Purpose: Safely concatenate base URLs and paths without redundant slashes.
// Reason: Prevents malformed URLs in API calls.
// ------------------------------------------------------------
function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return `${b}/${p}`;
}

// ------------------------------------------------------------
// Utility: buildHeaders
// Purpose: Create a consistent header set for JSON-based API requests.
// Reason: Centralizes default JSON headers and optional Bearer tokens.
// ------------------------------------------------------------
function buildHeaders(init?: RequestInit, token?: string): HeadersInit {
  const headers = new Headers(init?.headers || {});
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

// ------------------------------------------------------------
// Core: request<T>
// Purpose: Wrap fetch() to handle JSON parsing, timeouts, and errors.
// Reason: Abstracts repetitive fetch boilerplate and ensures safe defaults.
// ------------------------------------------------------------
async function request<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number; token?: string }
): Promise<T> {
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
    const body = isJson
      ? await res.json().catch(() => undefined)
      : await res.text().catch(() => undefined);

    if (!res.ok) {
      const err: ApiError = Object.assign(
        new Error((body as any)?.message || `Request failed (${res.status})`),
        { status: res.status, body, name: 'ApiError' }
      );
      throw err;
    }

    return body as T;
  } finally {
    if (id) clearTimeout(id as any);
  }
}

// ------------------------------------------------------------
// HTTP Layer
// Purpose: Simplify CRUD operations with consistent method wrappers.
// Reason: Allows easy readability (http.get, http.postJson, etc.).
// ------------------------------------------------------------
export const http = {
  get: <T>(path: string, init?: RequestInit & { timeoutMs?: number; token?: string }) =>
    request<T>(path, { method: 'GET', ...init }),

  postJson: <T>(path: string, data?: unknown, init?: RequestInit & { timeoutMs?: number; token?: string }) =>
    request<T>(path, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
      ...init,
    }),

  putJson: <T>(path: string, data?: unknown, init?: RequestInit & { timeoutMs?: number; token?: string }) =>
    request<T>(path, {
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
      ...init,
    }),

  del: <T>(path: string, init?: RequestInit & { timeoutMs?: number; token?: string }) =>
    request<T>(path, { method: 'DELETE', ...init }),
};

// ============================================================
// MODEL TYPES
// Purpose: Mirror Laravel models and shape API responses with type safety.
// Reason: Ensures consistent data structures across client and backend.
// ============================================================

// ---------- Tenant ----------
export type Tenant = {
  id: number;
  name?: string | null;
  domain?: string | null;
  plan?: string | null;
  created_at?: string;
  updated_at?: string;
};

// ---------- Lead ----------
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

// ---------- Contact ----------
export type Contact = {
  id: number;
  tenant_id: number | null;
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  segments?: string[] | null;
  notes?: string | null;
  meta?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
};
export type ContactInput = Omit<Contact, 'id' | 'created_at' | 'updated_at'>;

// ---------- User ----------
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

// ---------- Authentication ----------
export type CreateLeadInput = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
export type AuthResponse = { message?: string; token: string; data: User };

// ---------- Admin ----------
export type AdminUser = {
  id: number;
  name: string;
  email: string;
  tenant_id?: number | null;
  roles: Array<{ id: number; name: string; slug: string }>;
  top_role: string;
  plan?: 'free' | 'pro' | 'business' | null;
  billing_cycle?: 'monthly' | 'yearly' | null;
  has_blog_addon?: boolean;
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

// ---------- Blog ----------
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

export type BlogPostInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  status: 'draft' | 'published';
  published_at?: string | null;
  tenant_id?: number | null;
};

// ---------- Generic Pagination ----------
export type Paginated<T> = {
  data: T[];
  meta: { total: number; current_page?: number; per_page?: number; last_page?: number };
};

// ---------- Docs ----------
export type Doc = { slug: string; title: string; body: string; updated_at?: string };
export type DocListItem = { slug: string; title: string; updated_at?: string };

// ---------- Public Config ----------
export type PricingRule = {
  id?: number;
  product_id?: number;
  plan: 'pro' | 'business';
  monthly?: string | number | null;
  yearly?: string | number | null;
};

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

// ---------- Invoicing ----------
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

// ============================================================
// API ENDPOINT WRAPPERS
// Purpose: Provide declarative and typed access to backend endpoints.
// Reason: Prevent direct fetch logic from leaking into UI components.
// ============================================================
export const api = {
  // ---------- Admin Impersonation ----------
  adminImpersonate: (token: string, params: { role?: string; plan?: string }) =>
    http.postJson<{ message: string; token: string; user: User }>('/admin/impersonate', params, { token }),

  // ---------- Public ----------
  createLead(input: CreateLeadInput) {
    return http.postJson<Lead>('/leads', input);
  },

  // ---------- Authentication ----------
  login(email: string, password: string, deviceName?: string) {
    return http.postJson<AuthResponse>('/auth/login', {
      email,
      password,
      device_name: deviceName ?? 'web',
    });
  },

  register(
    name: string,
    email: string,
    password: string,
    options?: { plan?: 'free' | 'pro' | 'business'; billingCycle?: 'monthly' | 'yearly'; coupon?: string }
  ) {
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

  // ---------- Leads ----------
  adminListLeads(token: string, opts?: { page?: number; per_page?: number; q?: string; status?: string; zip?: string; tenant_id?: number | null }) {
    const params = new URLSearchParams();
    if (opts?.page) params.set('page', String(opts.page));
    if (opts?.per_page) params.set('per_page', String(opts.per_page));
    if (opts?.q) params.set('q', opts.q);
    if (opts?.status) params.set('status', opts.status);
    if (opts?.zip) params.set('zip', opts.zip);
    if (opts?.tenant_id != null) params.set('tenant_id', String(opts.tenant_id));
    const path = `/leads${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<{ data: Lead[]; meta: Paginated<unknown>['meta'] }>(path, { token });
  },
  adminGetLead(id: number, token: string) {
    return http.get<{ data: Lead }>(`/leads/${id}`, { token });
  },
  adminUpdateLead(id: number, input: Partial<Lead>, token: string) {
    return http.putJson<{ data: Lead }>(`/leads/${id}`, input, { token });
  },
  adminConvertLead(id: number, token: string, nextStatus?: string) {
    const body = nextStatus ? { next_status: nextStatus } : {};
    return http.postJson<{ message: string; data: { lead: Lead; contact: Contact } }>(`/leads/${id}/convert`, body, { token });
  },
  assignLead(params: { leadId: number; tenantId: number }, token: string) {
    return http.postJson<Lead>('/leads/assign', { lead_id: params.leadId, tenant_id: params.tenantId }, { token });
  },

  unassignLead(params: { leadId: number }, token: string) {
    return http.postJson<Lead>('/leads/unassign', { lead_id: params.leadId }, { token });
  },

  // ---------- Contacts ----------
  adminListContacts(token: string, opts?: { page?: number; per_page?: number; q?: string; segment?: string; zip?: string; tenant_id?: number | null }) {
    const params = new URLSearchParams();
    if (opts?.page) params.set('page', String(opts.page));
    if (opts?.per_page) params.set('per_page', String(opts.per_page));
    if (opts?.q) params.set('q', opts.q);
    if (opts?.segment) params.set('segment', opts.segment);
    if (opts?.zip) params.set('zip', opts.zip);
    if (opts?.tenant_id != null) params.set('tenant_id', String(opts.tenant_id));
    const path = `/contacts${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<{ data: Contact[]; meta: Paginated<unknown>['meta'] }>(path, { token });
  },
  adminGetContact(id: number, token: string) {
    return http.get<{ data: Contact }>(`/contacts/${id}`, { token });
  },
  adminCreateContact(input: ContactInput, token: string) {
    return http.postJson<{ data: Contact }>(`/contacts`, input, { token });
  },
  adminUpdateContact(id: number, input: Partial<ContactInput>, token: string) {
    return http.putJson<{ data: Contact }>(`/contacts/${id}`, input, { token });
  },
  adminDeleteContact(id: number, token: string) {
    return http.del<{ ok: boolean }>(`/contacts/${id}`, { token });
  },

  // ---------- Tenants ----------
  listTenants(token: string) {
    return http.get<Tenant[]>('/tenants', { token });
  },
  createTenant(input: Partial<Tenant>, token: string) {
    return http.postJson<Tenant>('/tenants', input, { token });
  },
  updateTenant(id: number, input: Partial<Tenant>, token: string) {
    return http.putJson<Tenant>(`/tenants/${id}`, input, { token });
  },

  // ---------- Admin Users ----------
  adminListUsers(token: string, opts?: { page?: number; per_page?: number }) {
    const params = new URLSearchParams();
    if (opts?.page) params.set('page', String(opts.page));
    if (opts?.per_page) params.set('per_page', String(opts.per_page));
    const path = `/admin/users${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<Paginated<AdminUser>>(path, { token });
  },

  adminUpdateUserFeatures(id: number, input: { has_blog_addon: boolean }, token: string) {
    return http.putJson<{ data: { id: number; has_blog_addon: boolean } }>(`/admin/users/${id}/features`, input, { token });
  },

  // ---------- Admin Tenants ----------
  adminListTenants(token: string, opts?: { page?: number; per_page?: number; q?: string }) {
    const params = new URLSearchParams();
    if (opts?.page) params.set('page', String(opts.page));
    if (opts?.per_page) params.set('per_page', String(opts.per_page));
    if (opts?.q) params.set('q', opts.q);
    const path = `/admin/tenants${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<Paginated<Tenant>>(path, { token });
  },

  // ---------- Admin Subscribers ----------
  adminListSubscribers(token: string, opts?: { page?: number; per_page?: number }) {
    const params = new URLSearchParams();
    if (opts?.page) params.set('page', String(opts.page));
    if (opts?.per_page) params.set('per_page', String(opts.per_page));
    const path = `/admin/subscribers${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<Paginated<Subscriber>>(path, { token });
  },

  // ---------- Blog ----------
  blogList(token: string, opts?: { status?: 'draft' | 'published' }) {
    const params = new URLSearchParams();
    if (opts?.status) params.set('status', opts.status);
    const path = `/blog-posts${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<{ data: BlogPost[] }>(path, { token });
  },
  blogGet(id: number, token: string) {
    return http.get<{ data: BlogPost }>(`/blog-posts/${id}`, { token });
  },
  blogCreate(input: BlogPostInput, token: string) {
    return http.postJson<{ data: BlogPost }>(`/blog-posts`, input, { token });
  },
  blogUpdate(id: number, input: Partial<BlogPostInput>, token: string) {
    return http.putJson<{ data: BlogPost }>(`/blog-posts/${id}`, input, { token });
  },
  blogDelete(id: number, token: string) {
    return http.del<{ ok?: boolean }>(`/blog-posts/${id}`, { token });
  },

  // ---------- Chat ----------
  chatSend(message: string, token: string) {
    return http.postJson<{ data: { reply: string } }>('/chat', { message }, { token });
  },

  // ---------- Admin Metrics ----------
  adminMetrics(token: string, opts?: { range?: '7d' | '30d' | '90d' }) {
    const params = new URLSearchParams();
    if (opts?.range) params.set('range', opts.range);
    const path = `/admin/metrics${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<{ data: AdminMetrics }>(path, { token });
  },

  // ---------- Docs ----------
  publicListDocs() {
    return http.get<{ ok: true; data: { items: DocListItem[] } }>('/docs');
  },
  publicGetDoc(slug: string) {
    return http.get<{ ok: true; data: Doc }>(`/docs/${encodeURIComponent(slug)}`);
  },
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

  // ---------- Public Blog ----------
  publicListBlogPosts(opts?: { tenant_id?: number | null; limit?: number }) {
    const params = new URLSearchParams();
    if (opts?.tenant_id != null) params.set('tenant_id', String(opts.tenant_id));
    if (opts?.limit != null) {
      // backend clamps 1–100; keep client-side sane too
      const lim = Math.max(1, Math.min(100, Math.floor(opts.limit)));
      params.set('limit', String(lim));
    }
    const path = `/public/blog-posts${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<{ ok: true; data: { items: Array<Pick<BlogPost, 'id' | 'title' | 'slug' | 'excerpt' | 'tenant_id' | 'published_at' | 'created_at' | 'updated_at'>> } }>(path);
  },
  publicGetBlogPost(slug: string, tenantId: number) {
    const params = new URLSearchParams();
    params.set('tenant_id', String(tenantId));
    const path = `/public/blog-posts/${encodeURIComponent(slug)}?${params.toString()}`;
    return http.get<{ ok: true; data: Pick<BlogPost, 'id' | 'title' | 'slug' | 'excerpt' | 'body' | 'tenant_id' | 'published_at' | 'created_at' | 'updated_at'> }>(path);
  },
  publicGetBlogPostAny(slug: string) {
    const path = `/public/blog-posts/${encodeURIComponent(slug)}`;
    return http.get<{ ok: true; data: Pick<BlogPost, 'id' | 'title' | 'slug' | 'excerpt' | 'body' | 'tenant_id' | 'published_at' | 'created_at' | 'updated_at'> }>(path);
  },

  // ---------- Public Config ----------
  publicListProducts() {
    return http.get<PublicProduct[]>('/public/products');
  },
  publicListLandings() {
    return http.get<PublicLanding[]>('/public/landings');
  },

  // ---------- Invoices ----------
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
  adminCreateInvoice(
    input: {
      tenant_id?: number | null;
      currency?: string;
      due_date?: string;
      period_start?: string;
      period_end?: string;
      items: Array<{ description: string; quantity?: number; unit_amount_cents: number }>;
      meta?: Record<string, any>;
    },
    token: string
  ) {
    return http.postJson<{ data: Invoice }>(`/admin/invoices`, input, { token });
  },
  adminUpdateInvoice(id: number, input: Partial<Pick<Invoice, 'status' | 'due_date' | 'meta'>>, token: string) {
    return http.putJson<{ data: Invoice }>(`/admin/invoices/${id}`, input, { token });
  },
  adminSendInvoice(id: number, token: string) {
    return http.postJson<{ data: Invoice }>(`/admin/invoices/${id}/send`, {}, { token });
  },
  adminRecordPayment(
    id: number,
    input: {
      amount_cents: number;
      currency?: string;
      status?: 'succeeded' | 'pending' | 'failed' | 'refunded';
      provider?: string;
      provider_payment_id?: string;
    },
    token: string
  ) {
    return http.postJson<{ data: Invoice }>(`/admin/invoices/${id}/payments`, input, { token });
  },
  publicGetInvoiceByExternalId(externalId: string) {
    return http.get<{ data: Invoice }>(`/public/invoices/${encodeURIComponent(externalId)}`);
  },
};

// ============================================================
// Helper: submitLead
// Purpose: Normalize FormData or plain object into CreateLeadInput,
//          validate required fields, and submit a new lead.
// Reason: Simplifies HTML form integration and reduces duplication.
// ============================================================
export async function submitLead(input: FormData | Record<string, any>) {
  const data: Record<string, any> =
    input instanceof FormData ? Object.fromEntries(input.entries()) : { ...input };

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
  };

  if (!lead.phone || !lead.service || !lead.zip) {
    throw Object.assign(new Error('Missing required fields: phone, service, zip'), {
      name: 'ValidationError',
    });
  }

  return api.createLead(lead);
}
