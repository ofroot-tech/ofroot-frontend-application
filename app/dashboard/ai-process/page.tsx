import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { AiProcessDashboard } from './_components/AiProcessDashboard';

export default async function DashboardAiProcessPage() {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
  if (!token) redirect('/auth/login?next=%2Fdashboard%2Fai-process');
  return <AiProcessDashboard />;
}
