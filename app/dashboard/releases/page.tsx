// app/dashboard/releases/page.tsx
// Releases: SSR-guarded page that renders the production release notes.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api } from '@/app/lib/api';
import { TOKEN_COOKIE_NAME, LEGACY_COOKIE_NAME } from '@/app/lib/cookies';
import { PageHeader, Card, CardBody } from '@/app/dashboard/_components/UI';
import fs from 'node:fs/promises';
import path from 'node:path';

async function getToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE_NAME)?.value || store.get(LEGACY_COOKIE_NAME)?.value;
}

export default async function ReleasesPage() {
  const token = await getToken();
  if (!token) redirect('/auth/login');

  const me = await api.me(token).catch(() => null);
  if (!me) redirect('/auth/login');

  const filePath = path.join(process.cwd(), 'docs', 'RELEASE.md');
  let md = '# Release Notes\nNo release notes found.';
  try {
    md = await fs.readFile(filePath, 'utf8');
  } catch {}

  return (
    <div className="space-y-6">
      <PageHeader title="Releases" subtitle="Production release notes and deployment details." />
      <Card>
        <CardBody>
          <article className="prose max-w-none whitespace-pre-wrap text-sm">
            {md}
          </article>
        </CardBody>
      </Card>
    </div>
  );
}
