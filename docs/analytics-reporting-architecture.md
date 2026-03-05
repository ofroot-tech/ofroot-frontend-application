# Basic Analytics & Reporting — Architecture & Implementation

**Purpose:** Job profitability dashboards and CSV export functionality  
**Timeline:** 1 week (Sprint 8)  
**Dependencies:** Job Management, Invoice system, Payment system

---

## 1. Analytics Data Model

### Jobs Analytics View

```sql
-- Create materialized view for fast queries
CREATE VIEW job_analytics AS
SELECT 
  j.id,
  j.tenant_id,
  j.job_number,
  j.title,
  j.status,
  j.priority,
  j.contact_id,
  c.first_name AS customer_first_name,
  c.last_name AS customer_last_name,
  c.company AS customer_company,
  j.assigned_to,
  e.first_name AS technician_first_name,
  e.last_name AS technician_last_name,
  j.scheduled_start,
  j.scheduled_end,
  j.actual_start,
  j.actual_end,
  
  -- Financial metrics
  j.estimated_amount_cents,
  j.actual_amount_cents,
  COALESCE(inv.amount_cents, 0) AS invoiced_amount_cents,
  COALESCE(inv.amount_paid_cents, 0) AS paid_amount_cents,
  COALESCE(inv.amount_due_cents, 0) AS outstanding_amount_cents,
  
  -- Labor costs
  COALESCE(SUM(te.hours_worked * e.hourly_rate_cents), 0) AS labor_cost_cents,
  
  -- Profitability
  (j.actual_amount_cents - COALESCE(SUM(te.hours_worked * e.hourly_rate_cents), 0)) AS profit_cents,
  
  -- Duration metrics
  TIMESTAMPDIFF(HOUR, j.scheduled_start, j.scheduled_end) AS scheduled_duration_hours,
  TIMESTAMPDIFF(HOUR, j.actual_start, j.actual_end) AS actual_duration_hours,
  
  -- Timestamps
  j.created_at,
  j.completed_at,
  j.updated_at

FROM jobs j
LEFT JOIN contacts c ON j.contact_id = c.id
LEFT JOIN employees e ON j.assigned_to = e.id
LEFT JOIN invoices inv ON inv.meta->>'$.job_id' = CAST(j.id AS CHAR)
LEFT JOIN time_entries te ON te.employee_id = e.id 
  AND te.metadata->>'$.job_id' = CAST(j.id AS CHAR)

WHERE j.tenant_id = ? -- Always filter by tenant

GROUP BY j.id, c.id, e.id, inv.id;
```

### Revenue Metrics Table (Aggregated)

```sql
CREATE TABLE revenue_metrics_cache (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  metric_date DATE NOT NULL,
  
  -- Daily metrics
  jobs_created INT DEFAULT 0,
  jobs_completed INT DEFAULT 0,
  jobs_invoiced INT DEFAULT 0,
  jobs_paid INT DEFAULT 0,
  
  revenue_cents BIGINT DEFAULT 0,
  payments_cents BIGINT DEFAULT 0,
  outstanding_cents BIGINT DEFAULT 0,
  
  labor_cost_cents BIGINT DEFAULT 0,
  gross_profit_cents BIGINT DEFAULT 0,
  
  avg_job_value_cents INT DEFAULT 0,
  avg_completion_time_hours DECIMAL(5,2) DEFAULT 0,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY idx_tenant_date (tenant_id, metric_date),
  INDEX idx_metric_date (metric_date)
);
```

---

## 2. TypeScript Types

```typescript
// Add to app/lib/api.ts

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

export type CustomerAnalytics = {
  contact_id: number;
  customer_name: string;
  customer_email?: string | null;
  
  total_jobs: number;
  completed_jobs: number;
  
  total_revenue_cents: number;
  total_paid_cents: number;
  outstanding_cents: number;
  
  avg_job_value_cents: number;
  lifetime_value_cents: number;
  
  first_job_date: string;
  last_job_date: string;
};

export type TechnicianAnalytics = {
  employee_id: number;
  technician_name: string;
  
  assigned_jobs: number;
  completed_jobs: number;
  completion_rate_percent: number;
  
  total_revenue_cents: number;
  total_labor_cost_cents: number;
  
  avg_job_duration_hours: number;
  total_hours_worked: number;
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
```

---

## 3. API Methods

```typescript
// Add to app/lib/api.ts exports

export const api = {
  // ... existing methods ...
  
  // ===== ANALYTICS & REPORTING =====
  
  // Get revenue metrics for date range
  adminGetRevenueMetrics(
    token: string,
    period: 'day' | 'week' | 'month' | 'quarter' | 'year',
    start_date: string,
    end_date: string
  ) {
    const params = new URLSearchParams({
      period,
      start_date,
      end_date,
    });
    return http.get<{ data: RevenueMetrics }>(
      `/admin/analytics/revenue?${params.toString()}`,
      { token }
    );
  },
  
  // Get job profitability analytics
  adminGetJobAnalytics(token: string, filters: AnalyticsFilters = {}) {
    const params = new URLSearchParams();
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.status?.length) {
      filters.status.forEach(s => params.append('status[]', s));
    }
    if (filters.assigned_to) params.set('assigned_to', String(filters.assigned_to));
    if (filters.contact_id) params.set('contact_id', String(filters.contact_id));
    
    return http.get<{ data: JobAnalytics[] }>(
      `/admin/analytics/jobs?${params.toString()}`,
      { token }
    );
  },
  
  // Get customer analytics
  adminGetCustomerAnalytics(
    token: string,
    filters?: { start_date?: string; end_date?: string; min_revenue_cents?: number }
  ) {
    const params = new URLSearchParams();
    if (filters?.start_date) params.set('start_date', filters.start_date);
    if (filters?.end_date) params.set('end_date', filters.end_date);
    if (filters?.min_revenue_cents) params.set('min_revenue_cents', String(filters.min_revenue_cents));
    
    return http.get<{ data: CustomerAnalytics[] }>(
      `/admin/analytics/customers?${params.toString()}`,
      { token }
    );
  },
  
  // Get technician performance analytics
  adminGetTechnicianAnalytics(
    token: string,
    filters?: { start_date?: string; end_date?: string }
  ) {
    const params = new URLSearchParams();
    if (filters?.start_date) params.set('start_date', filters.start_date);
    if (filters?.end_date) params.set('end_date', filters.end_date);
    
    return http.get<{ data: TechnicianAnalytics[] }>(
      `/admin/analytics/technicians?${params.toString()}`,
      { token }
    );
  },
  
  // Export data to CSV/XLSX
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
      
      // Trigger download
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
```

---

## 4. Laravel Backend Routes

```php
// routes/api.php

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('admin/analytics')->group(function () {
        Route::get('/revenue', [AnalyticsController::class, 'revenue']);
        Route::get('/jobs', [AnalyticsController::class, 'jobs']);
        Route::get('/customers', [AnalyticsController::class, 'customers']);
        Route::get('/technicians', [AnalyticsController::class, 'technicians']);
    });
    
    Route::post('/admin/export', [ExportController::class, 'export']);
});
```

---

## 5. Frontend Pages Structure

```
app/dashboard/analytics/
  ├── page.tsx                      # Analytics overview
  ├── jobs/
  │   └── page.tsx                 # Job profitability report
  ├── revenue/
  │   └── page.tsx                 # Revenue trends
  ├── customers/
  │   └── page.tsx                 # Customer lifetime value
  └── _components/
      ├── RevenueChart.tsx         # Line/bar chart for revenue
      ├── ProfitabilityTable.tsx   # Job profit table
      ├── KpiCard.tsx              # Metric cards
      ├── DateRangePicker.tsx      # Filter component
      └── ExportButton.tsx         # CSV export trigger
```

---

## 6. Dashboard UI Components

### Analytics Overview Page

```tsx
// app/dashboard/analytics/page.tsx

import { Card, CardBody, KpiCard } from '@/app/dashboard/_components/UI';
import { RevenueChart, TopCustomersTable, TechnicianPerformance } from './_components';

export default async function AnalyticsOverviewPage({ searchParams }) {
  const token = await getToken();
  const range = searchParams?.range || '30d';
  
  const [start_date, end_date] = calculateDateRange(range);
  
  const metrics = await api.adminGetRevenueMetrics(token, 'day', start_date, end_date);
  const jobAnalytics = await api.adminGetJobAnalytics(token, { start_date, end_date });
  const customerAnalytics = await api.adminGetCustomerAnalytics(token, { start_date, end_date });
  
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Business performance metrics" />
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(metrics.data.revenue_cents)}
          change="+12.5%"
        />
        <KpiCard
          title="Gross Profit"
          value={formatCurrency(metrics.data.gross_profit_cents)}
          change="+8.3%"
        />
        <KpiCard
          title="Jobs Completed"
          value={String(metrics.data.jobs_completed)}
          change="+5 from last period"
        />
        <KpiCard
          title="Avg Job Value"
          value={formatCurrency(metrics.data.avg_job_value_cents)}
          change="+3.2%"
        />
      </div>
      
      {/* Revenue Chart */}
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <RevenueChart data={metrics.data} />
        </CardBody>
      </Card>
      
      {/* Top Customers */}
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold mb-4">Top Customers</h2>
          <TopCustomersTable customers={customerAnalytics.data.slice(0, 10)} />
        </CardBody>
      </Card>
    </div>
  );
}
```

### Job Profitability Table

```tsx
// app/dashboard/analytics/_components/ProfitabilityTable.tsx

type Props = {
  jobs: JobAnalytics[];
};

export function ProfitabilityTable({ jobs }: Props) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left py-2">Job #</th>
          <th className="text-left">Customer</th>
          <th className="text-left">Status</th>
          <th className="text-right">Revenue</th>
          <th className="text-right">Labor Cost</th>
          <th className="text-right">Profit</th>
          <th className="text-right">Margin</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr key={job.id} className="border-b hover:bg-gray-50">
            <td className="py-3">
              <a href={`/dashboard/jobs/${job.id}`} className="text-blue-600 hover:underline">
                {job.job_number}
              </a>
            </td>
            <td>{job.customer_name}</td>
            <td>
              <JobStatusBadge status={job.status} />
            </td>
            <td className="text-right">{formatCurrency(job.actual_amount_cents)}</td>
            <td className="text-right text-red-600">
              {formatCurrency(job.labor_cost_cents)}
            </td>
            <td className="text-right font-semibold">
              {formatCurrency(job.profit_cents)}
            </td>
            <td className="text-right">
              <span className={job.profit_margin_percent >= 30 ? 'text-green-600' : 'text-gray-600'}>
                {job.profit_margin_percent.toFixed(1)}%
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Revenue Chart Component

```tsx
// app/dashboard/analytics/_components/RevenueChart.tsx

'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Props = {
  data: RevenueMetrics;
};

export function RevenueChart({ data }: Props) {
  const chartData = {
    labels: generateDateLabels(data.start_date, data.end_date),
    datasets: [
      {
        label: 'Revenue',
        data: data.daily_revenue, // Array of daily values
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Profit',
        data: data.daily_profit,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: $${(context.parsed.y / 100).toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${(value / 100).toFixed(0)}`,
        },
      },
    },
  };
  
  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}
```

### Export Button Component

```tsx
// app/dashboard/analytics/_components/ExportButton.tsx

'use client';

import { useState } from 'react';
import { api } from '@/app/lib/api';

type Props = {
  entity: 'jobs' | 'invoices' | 'quotes' | 'payments';
  filters?: AnalyticsFilters;
  token: string;
};

export function ExportButton({ entity, filters, token }: Props) {
  const [loading, setLoading] = useState(false);
  
  async function handleExport(format: 'csv' | 'xlsx') {
    setLoading(true);
    
    try {
      await api.adminExportData(token, {
        entity,
        filters,
        format,
      });
      
      // Download triggered automatically by API method
    } catch (err) {
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('csv')}
        disabled={loading}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
      >
        {loading ? 'Exporting...' : 'Export CSV'}
      </button>
      <button
        onClick={() => handleExport('xlsx')}
        disabled={loading}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
      >
        {loading ? 'Exporting...' : 'Export Excel'}
      </button>
    </div>
  );
}
```

---

## 7. CSV Export Implementation

### Laravel Export Controller

```php
// app/Http/Controllers/ExportController.php

use League\Csv\Writer;

class ExportController extends Controller
{
    public function export(Request $request)
    {
        $entity = $request->input('entity');
        $filters = $request->input('filters', []);
        $format = $request->input('format', 'csv');
        
        $data = $this->getDataForExport($entity, $filters);
        
        if ($format === 'csv') {
            return $this->exportCsv($data, $entity);
        }
        
        // Add XLSX support later
        return response()->json(['error' => 'Format not supported'], 400);
    }
    
    private function getDataForExport(string $entity, array $filters)
    {
        switch ($entity) {
            case 'jobs':
                return Job::with(['contact', 'assigned_user'])
                    ->whereTenantId(auth()->user()->tenant_id)
                    ->when($filters['start_date'] ?? null, fn($q, $date) => 
                        $q->where('created_at', '>=', $date))
                    ->when($filters['end_date'] ?? null, fn($q, $date) => 
                        $q->where('created_at', '<=', $date))
                    ->get();
            
            // Add other entities...
        }
    }
    
    private function exportCsv($data, string $entity)
    {
        $csv = Writer::createFromString('');
        
        // Add headers
        $csv->insertOne($this->getHeaders($entity));
        
        // Add rows
        foreach ($data as $row) {
            $csv->insertOne($this->formatRow($row, $entity));
        }
        
        $filename = "{$entity}_export_" . date('Y-m-d') . '.csv';
        
        return response($csv->toString())
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }
    
    private function getHeaders(string $entity): array
    {
        switch ($entity) {
            case 'jobs':
                return [
                    'Job Number',
                    'Title',
                    'Customer',
                    'Status',
                    'Scheduled Start',
                    'Estimated Amount',
                    'Actual Amount',
                    'Created At',
                ];
            // Add other entities...
        }
    }
    
    private function formatRow($row, string $entity): array
    {
        switch ($entity) {
            case 'jobs':
                return [
                    $row->job_number,
                    $row->title,
                    $row->contact->first_name . ' ' . $row->contact->last_name,
                    $row->status,
                    $row->scheduled_start?->format('Y-m-d H:i'),
                    number_format($row->estimated_amount_cents / 100, 2),
                    number_format($row->actual_amount_cents / 100, 2),
                    $row->created_at->format('Y-m-d'),
                ];
            // Add other entities...
        }
    }
}
```

---

## 8. Implementation Phases

### Days 1-2: Data Layer
- [ ] Create job_analytics view
- [ ] Create revenue_metrics_cache table
- [ ] Build aggregation queries
- [ ] Add API endpoints for analytics

### Days 3-4: Dashboard UI
- [ ] Create analytics overview page
- [ ] Build KPI cards
- [ ] Add revenue chart component
- [ ] Create profitability table

### Days 5: Export Functionality
- [ ] Build CSV export backend
- [ ] Add export button component
- [ ] Test export with large datasets
- [ ] Add XLSX support (optional)

### Day 6-7: Testing & Polish
- [ ] Test with real data
- [ ] Optimize slow queries
- [ ] Add caching for metrics
- [ ] Polish UI + responsive design
- [ ] Write documentation

---

## 9. Performance Optimization

### Query Optimization
- Index on `tenant_id`, `status`, `created_at`
- Use materialized views for complex aggregations
- Cache daily metrics (update via cron)

### Frontend Optimization
- Server-side rendering for initial load
- Client-side caching with SWR/React Query
- Lazy load charts (dynamic import)
- Debounce filter changes

---

## 10. Success Metrics

- [ ] Dashboard loads in < 2s
- [ ] Job profitability query < 500ms
- [ ] CSV export < 5s for 1000 rows
- [ ] Charts responsive on mobile
- [ ] Real-time updates via webhooks
- [ ] 90%+ data accuracy

---

## 11. Future Enhancements (Post-MVP)

- Custom report builder
- Scheduled report emails
- Forecasting & predictions
- Budget vs actual tracking
- Multi-currency support
- API for third-party analytics tools

---

**Next Steps:** Create database views → Build analytics API → Implement dashboard UI.
