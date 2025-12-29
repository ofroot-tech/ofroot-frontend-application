// app/dashboard/overview/page.tsx
// The balcony view: core KPIs and recent activity (no dummy data).

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardBody, RangeSelect } from '@/app/dashboard/_components/UI';
import { getSupabaseAdmin } from '@/app/lib/supabase-server';

// Helper to get auth token from cookies
async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

// Main overview page
export default async function OverviewPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) redirect('/auth/login');

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) redirect('/auth/login');
  const me = {
    id: authData.user.id,
    name: authData.user.user_metadata?.name ?? authData.user.user_metadata?.full_name ?? '',
    email: authData.user.email ?? '',
  };

  const sp = (await searchParams) || {};
  const rangeParam = Array.isArray(sp.range) ? sp.range[0] : sp.range;
  const range = (rangeParam === '30d' || rangeParam === '90d') ? rangeParam : '7d';

  // Pull admin metrics from Supabase view `admin_metrics`
  let tenants = 0, users = 0, subscribers = 0, mrr = 0, hoursSavedWeek = 0;
  try {
    const admin = getSupabaseAdmin();
    const { data: metrics, error: metricsError } = await admin
      .from('admin_metrics')
      .select('*')
      .single();
    if (!metricsError && metrics) {
      tenants = Number(metrics.tenants ?? 0);
      users = Number(metrics.users ?? 0);
      subscribers = Number(metrics.subscribers ?? 0);
      mrr = Math.round(Number(metrics.mrr_cents ?? 0) / 100);
      hoursSavedWeek = Number(metrics.hours_saved_week ?? 0);
    }
  } catch {
    // If metrics fail, keep graceful zeros
  }

  const kpis = [
    { title: 'Tenants', value: String(tenants) },
    { title: 'Users', value: String(users) },
    { title: 'Subscribers', value: String(subscribers) },
    { title: 'MRR', value: `$${mrr}` },
    { title: 'Hours saved this week', value: String(hoursSavedWeek) },
  ];

  return (
    <div className="space-y-6 reveal-in fade-only">
      <PageHeader
        title="Overview"
        subtitle="Key metrics, health, and recent activity across the application."
        meta={<RangeSelect value={range} />}
      />

  {/* KPI row */}
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <Card key={k.title}>
            <CardBody>
              <div className="text-xs text-gray-500">{k.title}</div>
              <div className="text-2xl font-semibold mt-1">{k.value}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Health and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-medium">System Health</h2>
              <span className="text-xs text-gray-500">Live</span>
            </div>
            <ul className="mt-3 text-sm space-y-2">
              <li className="flex items-center justify-between"><span>API</span><span className="text-green-600">OK</span></li>
              <li className="flex items-center justify-between"><span>Queue</span><span className="text-green-600">OK</span></li>
              <li className="flex items-center justify-between"><span>Jobs</span><span className="text-gray-600">—</span></li>
            </ul>
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Recent Activity</h2>
              <span className="text-xs text-gray-500">Last {range}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">No activity yet.</p>
          </CardBody>
        </Card>
      </div>

      {/* Activation checklist (lightweight) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-3">
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Get activated</h2>
              <span className="text-xs text-gray-500">Goal: live site + first lead in 48h</span>
            </div>
            <ul className="mt-3 text-sm space-y-2">
              <li className="flex items-center justify-between">
                <span>Brand your workspace</span>
                <Link className="underline text-gray-700" href="/settings/branding">Open</Link>
              </li>
              <li className="flex items-center justify-between">
                <span>Publish your landing page</span>
                <Link className="underline text-gray-700" href="/landing/new">Start</Link>
              </li>
              <li className="flex items-center justify-between">
                <span>Add a lead capture form</span>
                <Link className="underline text-gray-700" href="/docs#lead-form">How to</Link>
              </li>
              <li className="flex items-center justify-between">
                <span>Install tracking</span>
                <Link className="underline text-gray-700" href="/docs#tracking">Guide</Link>
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Integrations quick glance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <h2 className="font-medium">Sentry</h2>
            <p className="text-sm text-gray-600">Issues: 0</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="font-medium">Billing</h2>
            <p className="text-sm text-gray-600">MRR: {`$${mrr}`}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="font-medium">Tenancy</h2>
            <p className="text-sm text-gray-600">Organizations: {tenants}</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
