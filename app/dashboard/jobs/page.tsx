// app/dashboard/jobs/page.tsx
// Jobs list with filters and search.

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { api, type Job } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { fetchSupabaseUserByToken } from '@/app/lib/supabase-user';
import { PageHeader, Card, CardBody, DataTable, Pagination } from '@/app/dashboard/_components/UI';
import { JobStatusBadge } from './_components/JobStatusBadge';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

function formatCurrency(cents?: number | null) {
  if (cents == null) return '—';
  return (cents / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default async function JobsPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await fetchSupabaseUserByToken(token);
  if (!me) redirect('/auth/login');

  const sp = (await searchParams) || {};
  const perPage = 25;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? '';
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) ?? '';
  const priority = (Array.isArray(sp.priority) ? sp.priority[0] : sp.priority) ?? '';

  let rows: Job[] = [];
  let total = 0;
  let currentPage = page;
  let lastPage = page;

  try {
    const res = await api.adminListJobs(token, { 
      page, 
      per_page: perPage, 
      q, 
      status: status ? status as any : undefined,
      priority: priority ? priority as any : undefined,
    });
    rows = res.data ?? [];
    total = res.meta?.total ?? rows.length;
    currentPage = res.meta?.current_page ?? page;
    lastPage = res.meta?.last_page ?? Math.max(1, Math.ceil((total || 0) / perPage));
  } catch {
    rows = [];
    total = 0;
    currentPage = 1;
    lastPage = 1;
  }

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="Jobs"
        subtitle="Manage service jobs from scheduling to completion"
        actions={
          <Link
            href="/dashboard/jobs/new"
            className="bg-black text-white hover:bg-gray-900 font-semibold py-2 px-4 rounded"
          >
            + New Job
          </Link>
        }
      />

      {/* Filters */}
      <Card>
        <CardBody>
          <form method="get" className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-600 mb-1" htmlFor="q">Search</label>
              <input
                id="q"
                name="q"
                type="text"
                defaultValue={q}
                placeholder="Job number, title, customer..."
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1" htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={status} className="border rounded px-3 py-2">
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="invoiced">Invoiced</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1" htmlFor="priority">Priority</label>
              <select id="priority" name="priority" defaultValue={priority} className="border rounded px-3 py-2">
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Filter
            </button>
            {(q || status || priority) && (
              <a href="/dashboard/jobs" className="text-gray-600 hover:underline px-2">Clear</a>
            )}
          </form>
        </CardBody>
      </Card>

      {/* Jobs List */}
      <Card>
        <CardBody>
          <DataTable
            columns={[
              { title: 'Job #', key: 'job_number' },
              { title: 'Title', key: 'title' },
              { title: 'Customer', key: 'customer' },
              { title: 'Status', key: 'status' },
              { title: 'Priority', key: 'priority' },
              { title: 'Scheduled', key: 'scheduled_start' },
              { title: 'Amount', key: 'estimated_amount_cents', align: 'right' },
              { title: 'Actions', key: 'actions', align: 'right' },
            ]}
          >
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-600">
                  No jobs found. Create your first job to get started.
                </td>
              </tr>
            ) : (
              rows.map((job) => (
                <tr key={job.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/jobs/${job.id}`} className="text-blue-600 hover:underline font-mono text-sm">
                      {job.job_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{job.title}</td>
                  <td className="px-4 py-3">
                    {job.contact ? `${job.contact.first_name} ${job.contact.last_name}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <JobStatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      job.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      job.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      job.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatDate(job.scheduled_start)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(job.estimated_amount_cents)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/jobs/${job.id}`} className="text-sm text-blue-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </DataTable>

          {total > perPage && (
            <div className="mt-4">
              <Pagination
                basePath="/dashboard/jobs"
                current={currentPage}
                last={lastPage}
                extraParams={{ status, priority, q }}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
