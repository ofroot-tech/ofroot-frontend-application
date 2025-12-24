# Job Management System — Architecture & Implementation

**Purpose:** Full lifecycle tracking for service jobs from lead to completion  
**Timeline:** 3 weeks (Sprint 1-3)  
**Dependencies:** Existing CRM (leads/contacts), Invoice system

---

## 1. Data Model

### Jobs Table Schema

```sql
CREATE TABLE jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  -- Relationships
  contact_id BIGINT UNSIGNED NULL,           -- Customer
  lead_id BIGINT UNSIGNED NULL,              -- Source lead if converted
  quote_id BIGINT UNSIGNED NULL,             -- Associated quote if converted
  assigned_to BIGINT UNSIGNED NULL,          -- Technician/employee
  
  -- Core fields
  job_number VARCHAR(50) UNIQUE NOT NULL,    -- e.g., JOB-2024-0001
  title VARCHAR(255) NOT NULL,               -- e.g., "HVAC Repair - Smith Residence"
  description TEXT NULL,
  
  -- Status lifecycle
  status ENUM(
    'draft',                                 -- Initial creation
    'scheduled',                             -- Appointment set
    'in_progress',                           -- Work started
    'completed',                             -- Work finished
    'invoiced',                              -- Invoice sent
    'paid',                                  -- Payment received
    'cancelled'                              -- Job cancelled
  ) DEFAULT 'draft',
  
  -- Scheduling
  scheduled_start TIMESTAMP NULL,
  scheduled_end TIMESTAMP NULL,
  actual_start TIMESTAMP NULL,
  actual_end TIMESTAMP NULL,
  
  -- Location
  service_address_line1 VARCHAR(255) NULL,
  service_address_line2 VARCHAR(255) NULL,
  service_city VARCHAR(100) NULL,
  service_state VARCHAR(50) NULL,
  service_zip VARCHAR(20) NULL,
  
  -- Financial
  estimated_amount_cents INT NULL,           -- Initial estimate
  actual_amount_cents INT NULL,              -- Final billed amount
  
  -- Metadata
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  tags JSON NULL,                            -- ["emergency", "warranty"]
  meta JSON NULL,                            -- Flexible storage
  
  -- Audit
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  completed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  cancellation_reason TEXT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL,
  
  INDEX idx_tenant_status (tenant_id, status),
  INDEX idx_tenant_assigned (tenant_id, assigned_to),
  INDEX idx_scheduled_start (scheduled_start),
  INDEX idx_job_number (job_number)
);
```

### Job Notes Table

```sql
CREATE TABLE job_notes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  
  note TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT TRUE,          -- Internal vs customer-visible
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_job_id (job_id),
  INDEX idx_created_at (created_at)
);
```

### Job Attachments Table

```sql
CREATE TABLE job_attachments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,           -- S3/storage path
  file_size_bytes INT NULL,
  mime_type VARCHAR(100) NULL,
  
  type ENUM('photo', 'document', 'receipt', 'other') DEFAULT 'photo',
  description TEXT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_job_id (job_id)
);
```

### Job Activity Log Table

```sql
CREATE TABLE job_activities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  
  action VARCHAR(100) NOT NULL,              -- 'created', 'status_changed', 'assigned', etc.
  description TEXT NULL,
  old_value TEXT NULL,
  new_value TEXT NULL,
  metadata JSON NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_job_id (job_id),
  INDEX idx_created_at (created_at)
);
```

---

## 2. TypeScript Types

```typescript
// Add to app/lib/api.ts

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
  
  // Relations (when included)
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
```

---

## 3. API Methods

```typescript
// Add to app/lib/api.ts exports

export const api = {
  // ... existing methods ...
  
  // ===== JOB MANAGEMENT =====
  
  // List jobs with filters
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
  
  // Get single job with relations
  adminGetJob(token: string, id: number, includes?: string[]) {
    const params = new URLSearchParams();
    if (includes?.length) params.set('include', includes.join(','));
    const path = `/admin/jobs/${id}${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<{ data: Job }>(path, { token });
  },
  
  // Create job
  adminCreateJob(token: string, input: JobInput) {
    return http.postJson<{ data: Job }>('/admin/jobs', input, { token });
  },
  
  // Update job
  adminUpdateJob(token: string, id: number, input: Partial<JobInput>) {
    return http.putJson<{ data: Job }>(`/admin/jobs/${id}`, input, { token });
  },
  
  // Update job status
  adminUpdateJobStatus(
    token: string,
    id: number,
    status: JobStatus,
    note?: string
  ) {
    return http.postJson<{ data: Job }>(
      `/admin/jobs/${id}/status`,
      { status, note },
      { token }
    );
  },
  
  // Delete job
  adminDeleteJob(token: string, id: number) {
    return http.del<{ message: string }>(`/admin/jobs/${id}`, { token });
  },
  
  // Convert lead to job
  adminConvertLeadToJob(token: string, leadId: number, input: Partial<JobInput>) {
    return http.postJson<{ data: Job }>(
      `/admin/leads/${leadId}/convert-to-job`,
      input,
      { token }
    );
  },
  
  // Add note to job
  adminAddJobNote(
    token: string,
    jobId: number,
    note: string,
    isInternal: boolean = true
  ) {
    return http.postJson<{ data: JobNote }>(
      `/admin/jobs/${jobId}/notes`,
      { note, is_internal: isInternal },
      { token }
    );
  },
  
  // Upload attachment
  adminUploadJobAttachment(
    token: string,
    jobId: number,
    formData: FormData
  ) {
    return fetch(joinUrl(API_BASE_URL, `/admin/jobs/${jobId}/attachments`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(res => res.json());
  },
  
  // Get job activities
  adminGetJobActivities(token: string, jobId: number) {
    return http.get<{ data: JobActivity[] }>(
      `/admin/jobs/${jobId}/activities`,
      { token }
    );
  },
};

// Helper function (add near buildHeaders)
function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return `${b}/${p}`;
}
```

---

## 4. Laravel Backend Routes (Reference)

```php
// routes/api.php

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('admin')->group(function () {
        
        // Jobs
        Route::get('/jobs', [JobController::class, 'index']);
        Route::post('/jobs', [JobController::class, 'store']);
        Route::get('/jobs/{job}', [JobController::class, 'show']);
        Route::put('/jobs/{job}', [JobController::class, 'update']);
        Route::delete('/jobs/{job}', [JobController::class, 'destroy']);
        Route::post('/jobs/{job}/status', [JobController::class, 'updateStatus']);
        
        // Job relationships
        Route::post('/jobs/{job}/notes', [JobNoteController::class, 'store']);
        Route::post('/jobs/{job}/attachments', [JobAttachmentController::class, 'store']);
        Route::get('/jobs/{job}/activities', [JobActivityController::class, 'index']);
        
        // Lead conversion
        Route::post('/leads/{lead}/convert-to-job', [LeadController::class, 'convertToJob']);
    });
});
```

---

## 5. Status State Machine

```
draft → scheduled → in_progress → completed → invoiced → paid
  ↓                      ↓              ↓          ↓
cancelled            cancelled     cancelled   cancelled
```

**Validation Rules:**
- `draft` → `scheduled` (requires scheduled_start)
- `scheduled` → `in_progress` (requires assigned_to)
- `in_progress` → `completed` (requires actual_start)
- `completed` → `invoiced` (requires actual_amount_cents)
- `invoiced` → `paid` (auto-updated via invoice webhook)
- Any status → `cancelled` (requires cancellation_reason)

---

## 6. Frontend Pages Structure

```
app/dashboard/jobs/
  ├── page.tsx                    # Job list with filters
  ├── [id]/
  │   ├── page.tsx               # Job detail view
  │   └── edit/
  │       └── page.tsx           # Edit job form
  ├── new/
  │   └── page.tsx               # Create new job
  └── _components/
      ├── JobCard.tsx            # List item component
      ├── JobStatusBadge.tsx     # Status indicator
      ├── JobTimeline.tsx        # Activity timeline
      ├── JobNotesSection.tsx    # Notes display/form
      ├── JobAttachmentsGrid.tsx # Attachment gallery
      ├── JobForm.tsx            # Create/edit form
      └── JobFilters.tsx         # Filter sidebar
```

---

## 7. Implementation Phases

### Week 1: Core CRUD
- [ ] Create database migrations
- [ ] Add TypeScript types to `api.ts`
- [ ] Build Laravel controllers + models
- [ ] Create `app/dashboard/jobs/page.tsx` (list view)
- [ ] Create `app/dashboard/jobs/new/page.tsx` (create form)
- [ ] Add job number auto-generation

### Week 2: Detail & Relations
- [ ] Create `app/dashboard/jobs/[id]/page.tsx` (detail view)
- [ ] Add notes functionality (create/display)
- [ ] Add attachment upload/display
- [ ] Build activity timeline component
- [ ] Add status transition UI

### Week 3: Workflows & Polish
- [ ] Implement lead → job conversion
- [ ] Add job → invoice connection
- [ ] Build customer-facing job status page
- [ ] Add bulk actions (assign, status change)
- [ ] Polish UI + responsive design
- [ ] Write tests for critical paths

---

## 8. UI Components Specifications

### JobStatusBadge

```tsx
// app/dashboard/jobs/_components/JobStatusBadge.tsx

type Props = { status: JobStatus; className?: string };

const statusConfig = {
  draft: { label: 'Draft', color: 'gray' },
  scheduled: { label: 'Scheduled', color: 'blue' },
  in_progress: { label: 'In Progress', color: 'yellow' },
  completed: { label: 'Completed', color: 'green' },
  invoiced: { label: 'Invoiced', color: 'purple' },
  paid: { label: 'Paid', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
};
```

### JobCard (List Item)

**Displays:**
- Job number + title
- Status badge
- Customer name (from contact)
- Assigned technician
- Scheduled date/time
- Estimated amount
- Priority indicator

**Actions:**
- Click to view detail
- Quick status change dropdown
- Quick assign technician

---

## 9. Customer-Facing Job Status Page

```
/job/[externalId]/status
```

**Public page showing:**
- Job title + description
- Current status with friendly messaging
- Scheduled appointment time
- Assigned technician (name + photo)
- Service address
- Estimated/final amount
- Customer-visible notes
- "Contact Us" button

**Security:** Use external_id (UUID) like invoices, no auth required.

---

## 10. Success Metrics

- [ ] Jobs can be created in < 30 seconds
- [ ] Status transitions update activity log automatically
- [ ] Lead → Job conversion preserves all data
- [ ] Job detail page loads with all relations in < 500ms
- [ ] Customer status page is mobile-responsive
- [ ] 90%+ test coverage on status transitions

---

**Next Steps:** Begin Week 1 implementation → Create database migrations and API types.
