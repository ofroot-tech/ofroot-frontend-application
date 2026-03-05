# Quote System — Architecture & Implementation

**Purpose:** Estimates with itemized pricing and digital approval workflow  
**Timeline:** 2 weeks (Sprint 4-5)  
**Dependencies:** Job Management, Invoice system (reuse line item patterns)

---

## 1. Data Model

### Quotes Table Schema

```sql
CREATE TABLE quotes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  -- Relationships
  contact_id BIGINT UNSIGNED NULL,
  lead_id BIGINT UNSIGNED NULL,
  job_id BIGINT UNSIGNED NULL,              -- Created job after approval
  
  -- Core fields
  quote_number VARCHAR(50) UNIQUE NOT NULL,  -- e.g., QUO-2024-0001
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  external_id VARCHAR(36) UNIQUE NOT NULL,   -- UUID for public links
  
  -- Status lifecycle
  status ENUM(
    'draft',                                 -- Being created
    'sent',                                  -- Sent to customer
    'viewed',                                -- Customer opened link
    'approved',                              -- Customer accepted
    'declined',                              -- Customer rejected
    'expired',                               -- Past expiry date
    'converted'                              -- Converted to job/invoice
  ) DEFAULT 'draft',
  
  -- Financial
  subtotal_cents INT NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NULL,               -- e.g., 8.50 for 8.5%
  tax_amount_cents INT NOT NULL DEFAULT 0,
  discount_cents INT NOT NULL DEFAULT 0,
  total_cents INT NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Validity
  valid_until DATE NULL,                    -- Expiration date
  
  -- Metadata
  terms TEXT NULL,                          -- Payment terms
  notes TEXT NULL,                          -- Internal notes
  customer_notes TEXT NULL,                 -- Notes visible to customer
  tags JSON NULL,
  meta JSON NULL,
  
  -- Approval tracking
  approved_at TIMESTAMP NULL,
  approved_by_name VARCHAR(255) NULL,       -- Customer name
  approved_by_email VARCHAR(255) NULL,
  approval_ip VARCHAR(45) NULL,
  approval_signature TEXT NULL,             -- Base64 signature image
  declined_at TIMESTAMP NULL,
  declined_reason TEXT NULL,
  
  -- Audit
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  sent_at TIMESTAMP NULL,
  viewed_at TIMESTAMP NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  
  INDEX idx_tenant_status (tenant_id, status),
  INDEX idx_external_id (external_id),
  INDEX idx_quote_number (quote_number),
  INDEX idx_valid_until (valid_until)
);
```

### Quote Items Table

```sql
CREATE TABLE quote_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quote_id BIGINT UNSIGNED NOT NULL,
  
  -- Item details
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_amount_cents INT NOT NULL,
  total_cents INT NOT NULL,                 -- quantity * unit_amount_cents
  
  -- Optional categorization
  category VARCHAR(100) NULL,               -- 'labor', 'parts', 'materials'
  sku VARCHAR(100) NULL,
  
  -- Display order
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  
  INDEX idx_quote_id (quote_id),
  INDEX idx_sort_order (sort_order)
);
```

### Quote Activities Table

```sql
CREATE TABLE quote_activities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quote_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  
  action VARCHAR(100) NOT NULL,             -- 'created', 'sent', 'viewed', 'approved', etc.
  description TEXT NULL,
  metadata JSON NULL,
  ip_address VARCHAR(45) NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_quote_id (quote_id),
  INDEX idx_created_at (created_at)
);
```

---

## 2. TypeScript Types

```typescript
// Add to app/lib/api.ts

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
  
  // Relations
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
  signature?: string; // Base64 image
  create_job?: boolean; // Auto-create job on approval
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
```

---

## 3. API Methods

```typescript
// Add to app/lib/api.ts exports

export const api = {
  // ... existing methods ...
  
  // ===== QUOTE MANAGEMENT =====
  
  // List quotes with filters
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
  
  // Get single quote
  adminGetQuote(token: string, id: number, includes?: string[]) {
    const params = new URLSearchParams();
    if (includes?.length) params.set('include', includes.join(','));
    const path = `/admin/quotes/${id}${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<{ data: Quote }>(path, { token });
  },
  
  // Create quote
  adminCreateQuote(token: string, input: QuoteInput) {
    return http.postJson<{ data: Quote }>('/admin/quotes', input, { token });
  },
  
  // Update quote
  adminUpdateQuote(token: string, id: number, input: Partial<QuoteInput>) {
    return http.putJson<{ data: Quote }>(`/admin/quotes/${id}`, input, { token });
  },
  
  // Send quote to customer
  adminSendQuote(token: string, id: number, email?: string) {
    return http.postJson<{ data: Quote; message: string }>(
      `/admin/quotes/${id}/send`,
      { email },
      { token }
    );
  },
  
  // Convert quote to invoice
  adminConvertQuoteToInvoice(token: string, id: number) {
    return http.postJson<{ data: Invoice }>(
      `/admin/quotes/${id}/convert-to-invoice`,
      {},
      { token }
    );
  },
  
  // Convert quote to job
  adminConvertQuoteToJob(token: string, id: number, jobData?: Partial<JobInput>) {
    return http.postJson<{ data: Job }>(
      `/admin/quotes/${id}/convert-to-job`,
      jobData || {},
      { token }
    );
  },
  
  // Delete quote
  adminDeleteQuote(token: string, id: number) {
    return http.del<{ message: string }>(`/admin/quotes/${id}`, { token });
  },
  
  // Public API - Get quote by external ID
  getPublicQuote(externalId: string) {
    return http.get<{ data: Quote }>(`/quotes/${externalId}`);
  },
  
  // Public API - Approve quote
  approveQuote(externalId: string, input: QuoteApprovalInput) {
    return http.postJson<{ data: Quote; message: string }>(
      `/quotes/${externalId}/approve`,
      input
    );
  },
  
  // Public API - Decline quote
  declineQuote(externalId: string, reason?: string) {
    return http.postJson<{ data: Quote; message: string }>(
      `/quotes/${externalId}/decline`,
      { reason }
    );
  },
};
```

---

## 4. Status State Machine

```
draft → sent → viewed → approved → converted
          ↓      ↓         ↓
      expired  expired  declined
```

**Automatic Transitions:**
- `sent` → `viewed` (when customer opens link)
- `*` → `expired` (daily cron checks valid_until)

**Manual Transitions:**
- `draft` → `sent` (via adminSendQuote)
- `viewed` → `approved` (customer approval)
- `viewed` → `declined` (customer decline)
- `approved` → `converted` (convert to job/invoice)

---

## 5. Quote Calculation Logic

```typescript
// Helper function for quote totals

export function calculateQuoteTotals(
  items: QuoteItem[],
  taxRate: number = 0,
  discountCents: number = 0
): {
  subtotal_cents: number;
  tax_amount_cents: number;
  discount_cents: number;
  total_cents: number;
} {
  const subtotal_cents = items.reduce((sum, item) => sum + item.total_cents, 0);
  const taxable_amount_cents = Math.max(0, subtotal_cents - discountCents);
  const tax_amount_cents = Math.round(taxable_amount_cents * (taxRate / 100));
  const total_cents = taxable_amount_cents + tax_amount_cents;
  
  return {
    subtotal_cents,
    tax_amount_cents,
    discount_cents: discountCents,
    total_cents,
  };
}
```

---

## 6. Frontend Pages Structure

```
app/dashboard/quotes/
  ├── page.tsx                     # Quote list with filters
  ├── [id]/
  │   ├── page.tsx                # Quote detail view
  │   └── edit/
  │       └── page.tsx            # Edit quote
  ├── new/
  │   └── page.tsx                # Create quote (line item builder)
  └── _components/
      ├── QuoteCard.tsx           # List item
      ├── QuoteStatusBadge.tsx    # Status indicator
      ├── QuoteItemsEditor.tsx    # Line item builder (reuse invoice)
      ├── QuotePreview.tsx        # PDF-style preview
      └── QuoteFilters.tsx        # Filter controls

app/quote/[externalId]/
  ├── page.tsx                     # Public quote view
  └── approve/
      └── page.tsx                 # Approval form with signature
```

---

## 7. Line Item Builder Component

**Reuse Invoice Patterns:**
- `ItemsEditor.tsx` from invoice system
- Add/remove rows
- Quantity × Unit Price = Total
- Auto-calculate subtotals
- Support categories (Labor, Parts, Materials)
- Drag to reorder

**Enhancements for Quotes:**
- Add SKU field (optional)
- Category dropdown
- "Copy from previous quote" action
- Template library (common services)

---

## 8. Customer Approval Flow

### Page: `/quote/[externalId]`

**Layout:**
```
┌─────────────────────────────────────┐
│ [Company Logo]                      │
│ Quote #QUO-2024-0001                │
│                                     │
│ From: Your Company                  │
│ To: John Smith                      │
│ Valid Until: Jan 15, 2025           │
├─────────────────────────────────────┤
│ HVAC System Replacement             │
│                                     │
│ Items:                              │
│ 1. New HVAC Unit      $3,500.00    │
│ 2. Installation       $1,200.00    │
│ 3. Removal of Old     $300.00      │
│                                     │
│ Subtotal:             $5,000.00    │
│ Tax (8.5%):           $425.00      │
│ Total:                $5,425.00    │
├─────────────────────────────────────┤
│ Terms: 50% deposit, balance due     │
│ upon completion                     │
│                                     │
│ [Approve Quote] [Decline]           │
└─────────────────────────────────────┘
```

### Approval Modal

**Fields:**
- Full Name (required)
- Email (required)
- Signature Canvas (optional but recommended)
- "I agree to the terms" checkbox

**Actions:**
- Submit approval → creates job automatically (if configured)
- Send confirmation email to customer + team

---

## 9. Implementation Phases

### Week 1: Core CRUD + Line Items
- [ ] Create database migrations
- [ ] Add TypeScript types to `api.ts`
- [ ] Build Laravel controllers
- [ ] Create quote list page
- [ ] Build line item editor component
- [ ] Add quote number generation
- [ ] Implement totals calculation

### Week 2: Approval Flow + Conversions
- [ ] Create public quote view page
- [ ] Build approval form with signature
- [ ] Implement quote → job conversion
- [ ] Implement quote → invoice conversion
- [ ] Add email notifications (sent, approved)
- [ ] Track viewed/approved timestamps
- [ ] Polish UI + mobile responsive
- [ ] Write tests for conversions

---

## 10. Email Templates

### Quote Sent Email

**To:** Customer  
**Subject:** Your Quote from [Company Name] - #[Quote Number]

```
Hi [Customer Name],

Thank you for your interest! We've prepared a quote for:
[Quote Title]

Total: $[Total]
Valid Until: [Date]

[View & Approve Quote Button]

Questions? Reply to this email or call us at [Phone].

Best regards,
[Company Name]
```

### Quote Approved Email

**To:** Team  
**Subject:** ✅ Quote Approved - #[Quote Number]

```
Great news! [Customer Name] approved quote #[Quote Number]

[Quote Title]
Total: $[Total]
Approved: [Timestamp]

[View Quote] [Create Job]
```

---

## 11. Success Metrics

- [ ] Quote creation takes < 2 minutes
- [ ] Customer approval flow works on mobile
- [ ] Quote → Job conversion preserves all data
- [ ] Public quote page loads in < 1s
- [ ] Email delivery rate > 95%
- [ ] Approval rate tracked in analytics

---

## 12. Future Enhancements (Post-MVP)

- Quote templates library
- Multi-version quotes (A/B options)
- Expiration reminders (3 days before)
- E-signature integration (DocuSign)
- PDF generation and download
- Quote comparison view
- Win/loss tracking

---

**Next Steps:** Begin Week 1 → Create migrations and build line item editor.
