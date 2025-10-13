// app/docs/page.tsx
// Index for docs — lists available Markdown documents from the backend (persistent DB).

import Link from 'next/link';
import PublicNavbar from '@/app/components/PublicNavbar';
import { api } from '@/app/lib/api';

export const dynamic = 'force-dynamic';

export default async function DocsIndex() {
  let items: { slug: string; title: string }[] = [];
  try {
    const res = await api.publicListDocs();
    items = (res.data.items || []).map((i: any) => ({ slug: i.slug, title: i.title }));
  } catch {
    items = [];
  }

  // Always include the Brand Guide entry (file-backed canonical doc)
  const augmented = [{ slug: 'brand-guide', title: 'Brand & UI Design Guide' }, ...items.filter((i) => i.slug !== 'brand-guide')];

  return (
    <div className="relative">
      <PublicNavbar />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_50%)]" />
      <main className="mx-auto max-w-3xl px-4 md:px-6 pt-20 md:pt-24 pb-12">
        <h1 className="mb-4 text-2xl font-semibold">Documentation</h1>
        {augmented.length === 0 ? (
          <p className="text-gray-600">No documents yet.</p>
        ) : (
          <ul className="space-y-2">
            {augmented.map((it) => (
              <li key={it.slug}>
                <Link className="underline" href={`/docs/${it.slug}`}>{it.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
