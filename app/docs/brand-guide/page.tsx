// app/docs/brand-guide/page.tsx
//
// Public route to view the Brand & UI Design Guide within the app.
// We render the curated guidance from docs/BRAND_GUIDE.md as prose.

import fs from 'node:fs';
import path from 'node:path';
// PublicNavbar removed — global Navbar renders in app/layout
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';

export const dynamic = 'force-static';

// Minimal Markdown to HTML converter for our guide (headings, lists, code, paragraphs)
function mdToHtml(source: string) {
  // escape HTML
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
      if (!inCode) {
        inCode = true;
        out.push('<pre><code>');
      } else {
        inCode = false;
        out.push('</code></pre>');
      }
      return;
    }
    if (inCode) {
      out.push(esc(raw));
      return;
    }
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

export default async function BrandGuidePage() {
  // Resolve the markdown file within the project
  const mdPath = path.join(process.cwd(), 'docs', 'BRAND_GUIDE.md');
  let md = '';
  try {
    md = fs.readFileSync(mdPath, 'utf8');
  } catch {
    notFound();
  }

  const html = mdToHtml(md);

  return (
    <div className="relative">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: 'Brand & UI Design Guide',
          name: 'Brand & UI Design Guide',
          url: `${SITE.url}/docs/brand-guide`,
          inLanguage: 'en',
          about: {
            '@type': 'Thing',
            name: 'Design System',
          },
          publisher: {
            '@type': 'Organization',
            name: SITE.name,
            url: SITE.url,
            logo: {
              '@type': 'ImageObject',
              url: SITE.logo.url,
              width: SITE.logo.width,
              height: SITE.logo.height,
            },
          },
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_50%)]" />
      <main className="mx-auto max-w-3xl px-4 md:px-6 pt-20 md:pt-24 pb-12 prose prose-gray">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </div>
  );
}
