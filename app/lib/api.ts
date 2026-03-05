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

// ---------- Employee & Payroll Supporting Types ----------
export type EmployeeTaxProfile = {
  id: number;
  employee_id: number;
  filing_status: 'single' | 'married' | 'married_separately' | 'head_of_household' | string;
  allowances: number;
  extra_withholding_cents: number;
  state?: string | null;
  locality?: string | null;
  exempt_federal?: boolean;
  exempt_state?: boolean;
  metadata?: Record<string, any> | null;
  updated_at?: string | null;
};

export type BenefitEnrollment = {
  id: number;
  benefit_plan_id: number;
  employee_id: number;
  status: 'pending' | 'active' | 'waived' | 'terminated';
  effective_date?: string | null;
  end_date?: string | null;
  employee_contribution_cents?: number;
  employer_contribution_cents?: number;
  metadata?: Record<string, any> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BenefitPlan = {
  id: number;
  tenant_id: number;
  name: string;
  type: 'medical' | 'dental' | 'vision' | 'retirement' | 'stipend' | 'other' | string;
  provider?: string | null;
  description?: string | null;
  pretax?: boolean;
  default_employee_percent?: number | null;
  default_employee_amount_cents?: number | null;
  default_employer_percent?: number | null;
  default_employer_amount_cents?: number | null;
  active: boolean;
  carrier_metadata?: Record<string, any> | null;
  enrollments?: BenefitEnrollment[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Employee = {
  id: number;
  tenant_id: number;
  user_id?: number | null;
  manager_id?: number | null;
  first_name: string;
  last_name: string;
  preferred_name?: string | null;
  email: string;
  phone?: string | null;
  job_title?: string | null;
  department?: string | null;
  employment_type: 'full_time' | 'part_time' | 'contractor';
  compensation_type: 'salary' | 'hourly' | 'contract';
  status: 'draft' | 'active' | 'on_leave' | 'terminated';
  hire_date?: string | null;
  termination_date?: string | null;
  base_salary_cents?: number | null;
  hourly_rate_cents?: number | null;
  overtime_multiplier?: number | null;
  address?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  avatar_url?: string | null;
  location?: string | null;
  tax_profile?: EmployeeTaxProfile | null;
  benefit_enrollments?: BenefitEnrollment[] | null;
  compensation_profile?: {
    salary_type?: 'salary' | 'hourly' | 'contract';
    amount_cents?: number | null;
    pay_frequency?: string | null;
    effective_date?: string | null;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
};

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
export type BlogPostAiContext = {
  provider?: string | null;
  model?: string | null;
  mock?: boolean;
  topic?: string;
  options?: {
    tone?: string | null;
    keywords?: string[];
    tenant_id?: number | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
} | null;

export type BlogPost = {
  id: number;
  user_id: number;
  tenant_id?: number | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  meta_title?: string | null;
  meta_description?: string | null;
  featured_image_url?: string | null;
  tags?: string[] | null;
  ai_context?: BlogPostAiContext;
  status: 'draft' | 'published';
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BlogPostInput = {
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  body: string;
  meta_title?: string | null;
  meta_description?: string | null;
  featured_image_url?: string | null;
  tags?: string[] | null;
  ai_context?: BlogPostAiContext;
  status?: 'draft' | 'published';
  published_at?: string | null;
  tenant_id?: number | null;
};

export type BlogPostGenerationInput = {
  topic: string;
  tone?: string | null;
  keywords?: string[];
};

export type BlogPostGenerationResult = {
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  meta_title?: string | null;
  meta_description?: string | null;
  featured_image_url?: string | null;
  tags?: string[] | null;
  ai_context?: BlogPostAiContext;
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
  
  // Stripe fields
  stripe_session_id?: string | null;
  stripe_charge_id?: string | null;
  stripe_refund_id?: string | null;
  payment_method_type?: string | null;
  payment_method_last4?: string | null;
  payment_method_brand?: string | null;
  stripe_fee_cents?: number | null;
  net_amount_cents?: number | null;
  refunded_at?: string | null;
  refund_reason?: string | null;
  
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

// ---------- Payroll & Time ----------
export type PaySchedule = {
  id: number;
  tenant_id: number;
  name: string;
  frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'custom';
  timezone: string;
  period_anchor_day?: number | null;
  period_anchor_date?: number | null;
  pay_day_offset?: number | null;
  next_run_on?: string | null;
  last_run_ended_on?: string | null;
  active: boolean;
  settings?: Record<string, any> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PayrollRun = {
  id: number;
  tenant_id: number;
  pay_schedule_id: number;
  sequence: number;
  period_start: string | null;
  period_end: string | null;
  check_date: string | null;
  status: 'draft' | 'pending_approval' | 'approved' | 'processed' | string;
  total_gross_cents: number;
  total_net_cents: number;
  total_employee_taxes_cents: number | null;
  total_employer_taxes_cents: number | null;
  total_deductions_cents: number | null;
  summary?: Record<string, any> | null;
  submitted_by?: number | null;
  locked_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PayrollRunEntry = {
  id: number;
  payroll_run_id: number;
  employee_id: number;
  hours_worked?: number | null;
  gross_pay_cents?: number | null;
  net_pay_cents?: number | null;
  metadata?: Record<string, any> | null;
};

export type TimeEntry = {
  id: number;
  tenant_id: number;
  employee_id: number;
  started_at?: string | null;
  ended_at?: string | null;
  break_minutes?: number | null;
  hours: number;
  source?: 'manual' | 'web' | 'mobile' | 'kiosk' | null;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string | null;
  approved_by?: number | null;
  approved_at?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TimeOffRequest = {
  id: number;
  tenant_id: number;
  employee_id: number;
  type: string;
  start_date: string | null;
  end_date: string | null;
  hours: number;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  reason?: string | null;
  approver_id?: number | null;
  decision_at?: string | null;
  balance_snapshot_hours?: number | null;
  metadata?: Record<string, any> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type RosterAggregates = {
  active?: number;
  onboarding?: number;
  contractors?: number;
  terminated?: number;
  salaries_total_cents?: number;
  hourly_total_cents?: number;
};

export type TenantBrandSettings = {
  tenant_id: number;
  display_name?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  accent_color?: string | null;
  font_family?: string | null;
  options?: Record<string, any> | null;
  updated_at?: string | null;
};

export type PayrollTrendPoint = {
  label: string;
  gross_cents: number;
  net_cents: number;
  deductions_cents?: number | null;
};

export type PayrollAnalytics = {
  range: '7d' | '30d' | '90d';
  cost_trend: PayrollTrendPoint[];
  variance?: {
    period: string;
    delta_percent: number;
    delta_cents?: number | null;
    direction: 'up' | 'down' | 'flat';
    drivers?: string[];
  };
  headcount?: {
    total: number;
    contractors: number;
    new_hires: number;
    terminations: number;
  };
  run_health?: {
    drafts: number;
    pending: number;
    processed: number;
  };
};

// ---------- Job Management ----------
export type JobStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'invoiced' 
  | 'paid' 
  | 'cancelled';

export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Job = {
  id: number;
  tenant_id: number;
  contact_id?: number | null;
  lead_id?: number | null;
  quote_id?: number | null;
  assigned_to?: number | null;
  
  job_number: string;
  title: string;
  description?: string | null;
  
  status: JobStatus;
  priority: JobPriority;
  
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  
  service_address_line1?: string | null;
  service_address_line2?: string | null;
  service_city?: string | null;
  service_state?: string | null;
  service_zip?: string | null;
  
  estimated_amount_cents?: number | null;
  actual_amount_cents?: number | null;
  
  tags?: string[] | null;
  meta?: Record<string, any> | null;
  
  created_by?: number | null;
  updated_by?: number | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  
  created_at?: string;
  updated_at?: string;
  
  contact?: Contact;
  lead?: Lead;
  quote?: Quote;
  assigned_user?: Employee;
  notes?: JobNote[];
  attachments?: JobAttachment[];
  activities?: JobActivity[];
  invoice?: Invoice;
};

export type JobNote = {
  id: number;
  job_id: number;
  user_id: number;
  note: string;
  is_internal: boolean;
  created_at?: string;
  updated_at?: string;
  user?: { id: number; name: string; email: string };
};

export type JobAttachment = {
  id: number;
  job_id: number;
  user_id: number;
  filename: string;
  file_path: string;
  file_size_bytes?: number | null;
  mime_type?: string | null;
  type: 'photo' | 'document' | 'receipt' | 'other';
  description?: string | null;
  created_at?: string;
};

export type JobActivity = {
  id: number;
  job_id: number;
  user_id?: number | null;
  action: string;
  description?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
  user?: { id: number; name: string };
};

export type JobInput = {
  contact_id?: number | null;
  lead_id?: number | null;
  assigned_to?: number | null;
  title: string;
  description?: string | null;
  status?: JobStatus;
  priority?: JobPriority;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  service_address_line1?: string | null;
  service_address_line2?: string | null;
  service_city?: string | null;
  service_state?: string | null;
  service_zip?: string | null;
  estimated_amount_cents?: number | null;
  tags?: string[];
  meta?: Record<string, any>;
};

export type JobListFilters = {
  page?: number;
  per_page?: number;
  status?: JobStatus | JobStatus[];
  priority?: JobPriority;
  assigned_to?: number;
  contact_id?: number;
  q?: string;
  scheduled_from?: string;
  scheduled_to?: string;
};

// ---------- Quote System ----------
export type QuoteStatus = 
  | 'draft' 
  | 'sent' 
  | 'viewed' 
  | 'approved' 
  | 'declined' 
  | 'expired' 
  | 'converted';

export type Quote = {
  id: number;
  tenant_id: number;
  contact_id?: number | null;
  lead_id?: number | null;
  job_id?: number | null;
  
  quote_number: string;
  title: string;
  description?: string | null;
  external_id: string;
  
  status: QuoteStatus;
  
  subtotal_cents: number;
  tax_rate?: number | null;
  tax_amount_cents: number;
  discount_cents: number;
  total_cents: number;
  currency: string;
  
  valid_until?: string | null;
  
  terms?: string | null;
  notes?: string | null;
  customer_notes?: string | null;
  tags?: string[] | null;
  meta?: Record<string, any> | null;
  
  approved_at?: string | null;
  approved_by_name?: string | null;
  approved_by_email?: string | null;
  approval_ip?: string | null;
  approval_signature?: string | null;
  declined_at?: string | null;
  declined_reason?: string | null;
  
  created_by?: number | null;
  updated_by?: number | null;
  sent_at?: string | null;
  viewed_at?: string | null;
  
  created_at?: string;
  updated_at?: string;
  
  items?: QuoteItem[];
  contact?: Contact;
  lead?: Lead;
  job?: Job;
  activities?: QuoteActivity[];
};

export type QuoteItem = {
  id?: number;
  quote_id?: number;
  description: string;
  quantity: number;
  unit_amount_cents: number;
  total_cents: number;
  category?: string | null;
  sku?: string | null;
  sort_order?: number;
};

export type QuoteActivity = {
  id: number;
  quote_id: number;
  user_id?: number | null;
  action: string;
  description?: string | null;
  metadata?: Record<string, any> | null;
  ip_address?: string | null;
  created_at?: string;
};

export type QuoteInput = {
  contact_id?: number | null;
  lead_id?: number | null;
  title: string;
  description?: string | null;
  valid_until?: string | null;
  tax_rate?: number | null;
  discount_cents?: number;
  terms?: string | null;
  notes?: string | null;
  customer_notes?: string | null;
  tags?: string[];
  items: QuoteItem[];
};

export type QuoteApprovalInput = {
  approved_by_name: string;
  approved_by_email?: string;
  signature?: string;
  create_job?: boolean;
};

export type QuoteListFilters = {
  page?: number;
  per_page?: number;
  status?: QuoteStatus | QuoteStatus[];
  contact_id?: number;
  lead_id?: number;
  q?: string;
  valid_from?: string;
  valid_to?: string;
};

// ---------- Stripe Integration ----------
export type StripeCheckoutSession = {
  id: string;
  url: string;
  expires_at: number;
};

export type RefundInput = {
  payment_id: number;
  amount_cents?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  notes?: string;
};

export type StripeWebhookEvent = {
  id: number;
  stripe_event_id: string;
  event_type: string;
  payload: Record<string, any>;
  processed: boolean;
  processed_at?: string | null;
  error_message?: string | null;
  attempts: number;
  created_at?: string;
};

// ---------- Analytics & Reporting ----------
export type RevenueMetrics = {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  start_date: string;
  end_date: string;
  
  jobs_created: number;
  jobs_completed: number;
  jobs_invoiced: number;
  jobs_paid: number;
  
  revenue_cents: number;
  payments_cents: number;
  outstanding_cents: number;
  
  labor_cost_cents: number;
  gross_profit_cents: number;
  gross_profit_margin_percent: number;
  
  avg_job_value_cents: number;
  avg_completion_time_hours: number;
};

export type JobAnalytics = {
  id: number;
  tenant_id: number;
  job_number: string;
  title: string;
  status: JobStatus;
  priority: JobPriority;
  
  customer_name: string;
  customer_company?: string | null;
  technician_name: string;
  
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  
  estimated_amount_cents: number;
  actual_amount_cents: number;
  invoiced_amount_cents: number;
  paid_amount_cents: number;
  outstanding_amount_cents: number;
  
  labor_cost_cents: number;
  profit_cents: number;
  profit_margin_percent: number;
  
  scheduled_duration_hours: number;
  actual_duration_hours: number;
  
  created_at: string;
  completed_at?: string | null;
};

export type AnalyticsFilters = {
  start_date?: string;
  end_date?: string;
  status?: JobStatus[];
  assigned_to?: number;
  contact_id?: number;
  priority?: JobPriority;
};

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export type ExportRequest = {
  entity: 'jobs' | 'invoices' | 'quotes' | 'payments' | 'contacts';
  filters?: AnalyticsFilters;
  format?: ExportFormat;
  columns?: string[];
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
  blogGenerate(input: BlogPostGenerationInput, token: string) {
    return http.postJson<{ data: BlogPostGenerationResult }>(`/blog-posts/generate`, input, { token });
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
    return http.get<{ ok: true; data: { items: Array<Pick<BlogPost, 'id' | 'title' | 'meta_title' | 'slug' | 'excerpt' | 'meta_description' | 'featured_image_url' | 'tags' | 'tenant_id' | 'published_at' | 'created_at' | 'updated_at'>> } }>(path);
  },
  publicGetBlogPost(slug: string, tenantId: number) {
    const params = new URLSearchParams();
    params.set('tenant_id', String(tenantId));
    const path = `/public/blog-posts/${encodeURIComponent(slug)}?${params.toString()}`;
    return http.get<{ ok: true; data: Pick<BlogPost, 'id' | 'title' | 'meta_title' | 'slug' | 'excerpt' | 'meta_description' | 'featured_image_url' | 'tags' | 'body' | 'tenant_id' | 'published_at' | 'created_at' | 'updated_at'> }>(path);
  },
  publicGetBlogPostAny(slug: string) {
    const path = `/public/blog-posts/${encodeURIComponent(slug)}`;
    return http.get<{ ok: true; data: Pick<BlogPost, 'id' | 'title' | 'meta_title' | 'slug' | 'excerpt' | 'meta_description' | 'featured_image_url' | 'tags' | 'body' | 'tenant_id' | 'published_at' | 'created_at' | 'updated_at'> }>(path);
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

    // ---------- Payroll ----------
    payrollListSchedules(token: string, opts: { tenant_id: number; page?: number; per_page?: number; active?: boolean }) {
      const params = new URLSearchParams();
      params.set('tenant_id', String(opts.tenant_id));
      if (opts.page) params.set('page', String(opts.page));
      if (opts.per_page) params.set('per_page', String(opts.per_page));
      if (opts.active != null) params.set('active', String(opts.active ? 1 : 0));
      const path = `/payroll/schedules?${params.toString()}`;
      return http.get<{ data: PaySchedule[]; meta: Paginated<unknown>['meta'] }>(path, { token });
    },
    payrollCreateSchedule(
      token: string,
      input: {
        tenant_id: number;
        name: string;
        frequency: PaySchedule['frequency'];
        timezone: string;
        period_anchor_day?: number | null;
        period_anchor_date?: number | null;
        pay_day_offset?: number | null;
        next_run_on?: string | null;
        last_run_ended_on?: string | null;
        active?: boolean;
        settings?: Record<string, any> | null;
      }
    ) {
      return http.postJson<{ data: PaySchedule }>(`/payroll/schedules`, input, { token });
    },
    payrollCreateRun(
      token: string,
      input: {
        tenant_id: number;
        pay_schedule_id: number;
        period_start: string;
        period_end: string;
        check_date?: string | null;
        summary?: Record<string, any> | null;
      }
    ) {
      return http.postJson<{ data: PayrollRun }>(`/payroll/runs`, input, { token });
    },
    payrollSubmitRun(id: number, token: string, tenantId: number) {
      return http.postJson<{ data: PayrollRun }>(`/payroll/runs/${id}/submit`, { tenant_id: tenantId }, { token });
    },
    payrollApproveRun(id: number, token: string, tenantId: number) {
      return http.postJson<{ data: PayrollRun }>(`/payroll/runs/${id}/approve`, { tenant_id: tenantId }, { token });
    },
    payrollGetRun(id: number, token: string, tenantId: number) {
      const params = new URLSearchParams();
      params.set('tenant_id', String(tenantId));
      const path = `/payroll/runs/${id}?${params.toString()}`;
      return http.get<{ data: PayrollRun }>(path, { token });
    },
    payrollListTimeEntries(token: string, opts: { tenant_id: number; status?: TimeEntry['status']; page?: number; per_page?: number }) {
      const params = new URLSearchParams();
      params.set('tenant_id', String(opts.tenant_id));
      if (opts.status) params.set('status', opts.status);
      if (opts.page) params.set('page', String(opts.page));
      if (opts.per_page) params.set('per_page', String(opts.per_page));
      const path = `/payroll/time-entries?${params.toString()}`;
      return http.get<{ data: TimeEntry[]; meta: Paginated<unknown>['meta'] }>(path, { token });
    },
    payrollApproveTimeEntry(id: number, token: string, tenantId: number) {
      return http.postJson<{ data: TimeEntry }>(`/payroll/time-entries/${id}/approve`, { tenant_id: tenantId }, { token });
    },
    payrollRejectTimeEntry(id: number, token: string, tenantId: number, note?: string) {
      const payload: Record<string, unknown> = { tenant_id: tenantId };
      if (note) payload.note = note;
      return http.postJson<{ data: TimeEntry }>(`/payroll/time-entries/${id}/reject`, payload, { token });
    },
    payrollListTimeOffRequests(token: string, opts: { tenant_id: number; status?: TimeOffRequest['status']; page?: number; per_page?: number }) {
      const params = new URLSearchParams();
      params.set('tenant_id', String(opts.tenant_id));
      if (opts.status) params.set('status', opts.status);
      if (opts.page) params.set('page', String(opts.page));
      if (opts.per_page) params.set('per_page', String(opts.per_page));
      const path = `/payroll/time-off-requests?${params.toString()}`;
      return http.get<{ data: TimeOffRequest[]; meta: Paginated<unknown>['meta'] }>(path, { token });
    },
    payrollDecideTimeOffRequest(
      id: number,
      token: string,
      input: { tenant_id: number; action: 'approve' | 'deny' | 'cancel'; note?: string; balance_snapshot_hours?: number | null }
    ) {
      return http.postJson<{ data: TimeOffRequest }>(`/payroll/time-off-requests/${id}/decide`, input, { token });
    },
    payrollListEmployees(
      token: string,
      opts: { tenant_id: number; page?: number; per_page?: number; status?: Employee['status']; q?: string; include?: Array<'tax_profile' | 'benefits' | 'compensation'> }
    ) {
      const params = new URLSearchParams();
      params.set('tenant_id', String(opts.tenant_id));
      if (opts.page) params.set('page', String(opts.page));
      if (opts.per_page) params.set('per_page', String(opts.per_page));
      if (opts.status) params.set('status', opts.status);
      if (opts.q) params.set('q', opts.q);
      if (opts.include?.length) params.set('include', opts.include.join(','));
      const path = `/payroll/employees?${params.toString()}`;
      return http.get<{ data: Employee[]; meta: Paginated<unknown>['meta'] & { aggregates?: RosterAggregates } }>(path, { token });
    },
    payrollCreateEmployee(
      token: string,
      input: {
        tenant_id: number;
        first_name: string;
        last_name: string;
        email: string;
        job_title?: string | null;
        department?: string | null;
        employment_type: Employee['employment_type'];
        compensation_type: Employee['compensation_type'];
        base_salary_cents?: number | null;
        hourly_rate_cents?: number | null;
        hire_date?: string | null;
        location?: string | null;
        phone?: string | null;
      }
    ) {
      return http.postJson<{ data: Employee }>(`/payroll/employees`, input, { token });
    },
    payrollBulkUpdateTaxProfiles(
      token: string,
      input: {
        tenant_id: number;
        employee_ids: number[];
        filing_status?: EmployeeTaxProfile['filing_status'];
        allowances?: number;
        extra_withholding_cents?: number;
        exempt_federal?: boolean;
        exempt_state?: boolean;
      }
    ) {
      return http.postJson<{ ok: true }>(`/payroll/employees/bulk-tax`, input, { token });
    },
    payrollListBenefitPlans(token: string, opts: { tenant_id: number; include?: Array<'enrollments'>; active?: boolean }) {
      const params = new URLSearchParams();
      params.set('tenant_id', String(opts.tenant_id));
      if (opts.include?.length) params.set('include', opts.include.join(','));
      if (opts.active != null) params.set('active', String(opts.active ? 1 : 0));
      const path = `/payroll/benefit-plans?${params.toString()}`;
      return http.get<{ data: BenefitPlan[] }>(path, { token });
    },
    payrollBulkEnrollBenefits(
      token: string,
      input: {
        tenant_id: number;
        benefit_plan_id: number;
        employee_ids: number[];
        status?: BenefitEnrollment['status'];
        effective_date?: string | null;
        employee_contribution_cents?: number | null;
        employer_contribution_cents?: number | null;
      }
    ) {
      return http.postJson<{ ok: true }>(`/payroll/benefits/bulk-enroll`, input, { token });
    },
    payrollAnalyticsOverview(token: string, opts: { tenant_id: number; range?: '7d' | '30d' | '90d' }) {
      const params = new URLSearchParams();
      params.set('tenant_id', String(opts.tenant_id));
      if (opts.range) params.set('range', opts.range);
      const path = `/payroll/analytics/overview?${params.toString()}`;
      return http.get<{ data: PayrollAnalytics }>(path, { token });
    },
    payrollGetBrandSettings(token: string, tenantId: number) {
      const params = new URLSearchParams();
      params.set('tenant_id', String(tenantId));
      const path = `/payroll/branding?${params.toString()}`;
      return http.get<{ data: TenantBrandSettings }>(path, { token });
    },
    payrollUpdateBrandSettings(token: string, input: TenantBrandSettings & { tenant_id: number }) {
      return http.putJson<{ data: TenantBrandSettings }>(`/payroll/branding`, input, { token });
    },
    
    // ===== JOB MANAGEMENT =====
    adminListJobs(token: string, filters: JobListFilters = {}) {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', String(filters.page));
      if (filters.per_page) params.set('per_page', String(filters.per_page));
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          filters.status.forEach(s => params.append('status[]', s));
        } else {
          params.set('status', filters.status);
        }
      }
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.assigned_to) params.set('assigned_to', String(filters.assigned_to));
      if (filters.contact_id) params.set('contact_id', String(filters.contact_id));
      if (filters.q) params.set('q', filters.q);
      if (filters.scheduled_from) params.set('scheduled_from', filters.scheduled_from);
      if (filters.scheduled_to) params.set('scheduled_to', filters.scheduled_to);
      
      const path = `/admin/jobs${params.toString() ? `?${params.toString()}` : ''}`;
      return http.get<Paginated<Job>>(path, { token });
    },
    
    adminGetJob(token: string, id: number, includes?: string[]) {
      const params = new URLSearchParams();
      if (includes?.length) params.set('include', includes.join(','));
      const path = `/admin/jobs/${id}${params.toString() ? `?${params.toString()}` : ''}`;
      return http.get<{ data: Job }>(path, { token });
    },
    
    adminCreateJob(token: string, input: JobInput) {
      return http.postJson<{ data: Job }>('/admin/jobs', input, { token });
    },
    
    adminUpdateJob(token: string, id: number, input: Partial<JobInput>) {
      return http.putJson<{ data: Job }>(`/admin/jobs/${id}`, input, { token });
    },
    
    adminUpdateJobStatus(token: string, id: number, status: JobStatus, note?: string) {
      return http.postJson<{ data: Job }>(`/admin/jobs/${id}/status`, { status, note }, { token });
    },
    
    adminDeleteJob(token: string, id: number) {
      return http.del<{ message: string }>(`/admin/jobs/${id}`, { token });
    },
    
    adminConvertLeadToJob(token: string, leadId: number, input: Partial<JobInput>) {
      return http.postJson<{ data: Job }>(`/admin/leads/${leadId}/convert-to-job`, input, { token });
    },
    
    adminAddJobNote(token: string, jobId: number, note: string, isInternal: boolean = true) {
      return http.postJson<{ data: JobNote }>(`/admin/jobs/${jobId}/notes`, { note, is_internal: isInternal }, { token });
    },
    
    adminGetJobActivities(token: string, jobId: number) {
      return http.get<{ data: JobActivity[] }>(`/admin/jobs/${jobId}/activities`, { token });
    },
    
    // ===== QUOTE MANAGEMENT =====
    adminListQuotes(token: string, filters: QuoteListFilters = {}) {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', String(filters.page));
      if (filters.per_page) params.set('per_page', String(filters.per_page));
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          filters.status.forEach(s => params.append('status[]', s));
        } else {
          params.set('status', filters.status);
        }
      }
      if (filters.contact_id) params.set('contact_id', String(filters.contact_id));
      if (filters.lead_id) params.set('lead_id', String(filters.lead_id));
      if (filters.q) params.set('q', filters.q);
      
      const path = `/admin/quotes${params.toString() ? `?${params.toString()}` : ''}`;
      return http.get<Paginated<Quote>>(path, { token });
    },
    
    adminGetQuote(token: string, id: number, includes?: string[]) {
      const params = new URLSearchParams();
      if (includes?.length) params.set('include', includes.join(','));
      const path = `/admin/quotes/${id}${params.toString() ? `?${params.toString()}` : ''}`;
      return http.get<{ data: Quote }>(path, { token });
    },
    
    adminCreateQuote(token: string, input: QuoteInput) {
      return http.postJson<{ data: Quote }>('/admin/quotes', input, { token });
    },
    
    adminUpdateQuote(token: string, id: number, input: Partial<QuoteInput>) {
      return http.putJson<{ data: Quote }>(`/admin/quotes/${id}`, input, { token });
    },
    
    adminSendQuote(token: string, id: number, email?: string) {
      return http.postJson<{ data: Quote; message: string }>(`/admin/quotes/${id}/send`, { email }, { token });
    },
    
    adminConvertQuoteToInvoice(token: string, id: number) {
      return http.postJson<{ data: Invoice }>(`/admin/quotes/${id}/convert-to-invoice`, {}, { token });
    },
    
    adminConvertQuoteToJob(token: string, id: number, jobData?: Partial<JobInput>) {
      return http.postJson<{ data: Job }>(`/admin/quotes/${id}/convert-to-job`, jobData || {}, { token });
    },
    
    adminDeleteQuote(token: string, id: number) {
      return http.del<{ message: string }>(`/admin/quotes/${id}`, { token });
    },
    
    getPublicQuote(externalId: string) {
      return http.get<{ data: Quote }>(`/quotes/${externalId}`);
    },
    
    approveQuote(externalId: string, input: QuoteApprovalInput) {
      return http.postJson<{ data: Quote; message: string }>(`/quotes/${externalId}/approve`, input);
    },
    
    declineQuote(externalId: string, reason?: string) {
      return http.postJson<{ data: Quote; message: string }>(`/quotes/${externalId}/decline`, { reason });
    },
    
    // ===== STRIPE PAYMENTS =====
    createInvoiceCheckoutSession(token: string, invoiceId: number, options?: { success_url?: string; cancel_url?: string }) {
      return http.postJson<{ data: StripeCheckoutSession }>(`/admin/invoices/${invoiceId}/checkout`, options || {}, { token });
    },
    
    createQuoteCheckoutSession(token: string, quoteId: number, options?: { success_url?: string; cancel_url?: string; create_job?: boolean }) {
      return http.postJson<{ data: StripeCheckoutSession }>(`/admin/quotes/${quoteId}/checkout`, options || {}, { token });
    },
    
    createPublicInvoiceCheckout(externalId: string) {
      return http.postJson<{ data: StripeCheckoutSession }>(`/invoices/${externalId}/checkout`, {});
    },
    
    createPublicQuoteCheckout(externalId: string) {
      return http.postJson<{ data: StripeCheckoutSession }>(`/quotes/${externalId}/checkout`, {});
    },
    
    adminRefundPayment(token: string, input: RefundInput) {
      return http.postJson<{ data: Payment; message: string }>(`/admin/payments/${input.payment_id}/refund`, input, { token });
    },
    
    adminGetPayment(token: string, id: number) {
      return http.get<{ data: Payment }>(`/admin/payments/${id}`, { token });
    },
    
    adminListPayments(token: string, filters?: { page?: number; per_page?: number; status?: Payment['status']; invoice_id?: number; from_date?: string; to_date?: string }) {
      const params = new URLSearchParams();
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.per_page) params.set('per_page', String(filters.per_page));
      if (filters?.status) params.set('status', filters.status);
      if (filters?.invoice_id) params.set('invoice_id', String(filters.invoice_id));
      if (filters?.from_date) params.set('from_date', filters.from_date);
      if (filters?.to_date) params.set('to_date', filters.to_date);
      
      const path = `/admin/payments${params.toString() ? `?${params.toString()}` : ''}`;
      return http.get<Paginated<Payment>>(path, { token });
    },
    
    adminListStripeWebhooks(token: string, filters?: { page?: number; per_page?: number; event_type?: string; processed?: boolean }) {
      const params = new URLSearchParams();
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.per_page) params.set('per_page', String(filters.per_page));
      if (filters?.event_type) params.set('event_type', filters.event_type);
      if (filters?.processed !== undefined) params.set('processed', String(filters.processed));
      
      const path = `/admin/stripe/webhooks${params.toString() ? `?${params.toString()}` : ''}`;
      return http.get<Paginated<StripeWebhookEvent>>(path, { token });
    },
    
    adminRetryStripeWebhook(token: string, id: number) {
      return http.postJson<{ data: StripeWebhookEvent; message: string }>(`/admin/stripe/webhooks/${id}/retry`, {}, { token });
    },
    
    // ===== ANALYTICS & REPORTING =====
    adminGetRevenueMetrics(token: string, period: 'day' | 'week' | 'month' | 'quarter' | 'year', start_date: string, end_date: string) {
      const params = new URLSearchParams({ period, start_date, end_date });
      return http.get<{ data: RevenueMetrics }>(`/admin/analytics/revenue?${params.toString()}`, { token });
    },
    
    adminGetJobAnalytics(token: string, filters: AnalyticsFilters = {}) {
      const params = new URLSearchParams();
      if (filters.start_date) params.set('start_date', filters.start_date);
      if (filters.end_date) params.set('end_date', filters.end_date);
      if (filters.status?.length) {
        filters.status.forEach(s => params.append('status[]', s));
      }
      if (filters.assigned_to) params.set('assigned_to', String(filters.assigned_to));
      if (filters.contact_id) params.set('contact_id', String(filters.contact_id));
      
      return http.get<{ data: JobAnalytics[] }>(`/admin/analytics/jobs?${params.toString()}`, { token });
    },
    
    adminExportData(token: string, request: ExportRequest) {
      return fetch(joinUrl(API_BASE_URL, '/admin/export'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }).then(async (res) => {
        if (!res.ok) throw new Error('Export failed');
        
        const blob = await res.blob();
        const filename = res.headers.get('Content-Disposition')
          ?.split('filename=')[1]
          ?.replace(/"/g, '') || `export.${request.format || 'csv'}`;
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
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
