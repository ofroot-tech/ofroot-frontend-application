import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { getUserFromSessionToken } from '@/app/lib/supabase-store';
import { ProspectingDesk } from './ProspectingDesk';

export default async function ProspectingPage() {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
  if (!token) redirect('/auth/login?next=%2Fdashboard%2Fprospecting');
  const user = await getUserFromSessionToken(token).catch(() => null);
  if (!user) redirect('/auth/login?next=%2Fdashboard%2Fprospecting');
  return <ProspectingDesk />;
}
