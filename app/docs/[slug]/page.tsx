// app/docs/[slug]/page.tsx
//
// Dynamic docs page — renders any Markdown file under /docs as HTML.
// Documentation is content-addressed by slug: /docs/<slug> maps to docs/<slug>.md

import fs from 'node:fs';
import path from 'node:path';
import PublicNavbar from '@/app/components/PublicNavbar';
import { notFound } from 'next/navigation';
import { api } from '@/app/lib/api';

export const dynamic = 'force-dynamic';

function mdToHtml(source: string) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = source.split(/\r?\n/);
  const out: string[] = [];
  let inCode = false;
  let listBuffer: string[] = [];
  const flushList = () => {
    if (listBuffer.length) {
      out.push('<ul>');
      out.push(...listBuffer);
      out.push('</ul>');
      listBuffer = [];
    }
  };
  lines.forEach((raw) => {
    const line = raw.trimEnd();
    if (line.startsWith('```')) {
      flushList();
      if (!inCode) { inCode = true; out.push('<pre><code>'); } else { inCode = false; out.push('</code></pre>'); }
      return;
    }
    if (inCode) { out.push(esc(raw)); return; }
    if (/^#\s+/.test(line)) { flushList(); out.push(`<h1>${esc(line.replace(/^#\s+/, ''))}</h1>`); }
    else if (/^##\s+/.test(line)) { flushList(); out.push(`<h2>${esc(line.replace(/^##\s+/, ''))}</h2>`); }
    else if (/^###\s+/.test(line)) { flushList(); out.push(`<h3>${esc(line.replace(/^###\s+/, ''))}</h3>`); }
    else if (/^[-*]\s+/.test(line)) { listBuffer.push(`<li>${esc(line.replace(/^[-*]\s+/, ''))}</li>`); }
    else if (line === '') { flushList(); out.push(''); }
    else { flushList(); out.push(`<p>${esc(line)}</p>`); }
  });
  flushList();
  return out.join('\n');
}

export default async function DocPage({ params }: { params: { slug: string } }) {
  const slug = params.slug.replace(/[^a-z0-9-_]/gi, '');

  // First, try backend (DB) doc
  try {
    const res = await api.publicGetDoc(slug);
    const html = mdToHtml(res.data.body || '');
    return (
      <div className="relative">
        <PublicNavbar />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_50%)]" />
        <main className="prose prose-gray mx-auto max-w-3xl px-4 pt-20 pb-12 md:px-6 md:pt-24">
          <h1>{res.data.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </main>
      </div>
    );
  } catch {}

  // Fallback to file-based doc (e.g., brand guide)
  const mdPath = path.join(process.cwd(), 'docs', `${slug}.md`);
  let md = '';
  try { md = fs.readFileSync(mdPath, 'utf8'); } catch { notFound(); }
  const html = mdToHtml(md);

  return (
    <div className="relative">
      <PublicNavbar />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_50%)]" />
      <main className="prose prose-gray mx-auto max-w-3xl px-4 pt-20 pb-12 md:px-6 md:pt-24">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </div>
  );
}
