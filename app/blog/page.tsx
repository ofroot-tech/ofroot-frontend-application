import { SITE } from '@/app/config/site';
import JsonLd from '@/components/seo/JsonLd';
import Link from 'next/link';
import { api } from '@/app/lib/api';

// ------------------------------------------------------------
// Force dynamic rendering to avoid build-time API failures
// Reason: The blog page fetches from an external API that may not
// be available during Vercel's static generation phase.
// ------------------------------------------------------------
export const dynamic = 'force-dynamic';

function formatDate(input?: string | null) {
  if (!input) return '';
  try {
    const d = new Date(input);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return String(input);
  }
}

export default async function BlogPage() {
  let items: Awaited<ReturnType<typeof api.publicListBlogPosts>>['data']['items'] = [];
  
  try {
    const res = await api.publicListBlogPosts({ limit: 24 });
    items = res.data.items || [];
  } catch (err) {
    // Log error but don't crash - show empty state instead
    console.error('[BlogPage] Failed to fetch posts:', err);
  }

  const listLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog',
    url: `${SITE.url}/blog`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((p, i) => ({
        '@type': 'BlogPosting',
        position: i + 1,
        headline: p.title,
        datePublished: p.published_at || p.created_at,
        url: `${SITE.url}/blog/${encodeURIComponent(p.slug)}${p.tenant_id ? `?tenant_id=${p.tenant_id}` : ''}`,
      })),
    },
  } as const;

  return (
    <>
      <JsonLd data={listLd as any} />
      <main className="min-h-screen bg-white text-gray-900 pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-left">Blog</h1>
          <div className="flex flex-wrap gap-3 mb-8">
            <button className="bg-[#20b2aa] text-white px-4 py-2 rounded-full font-semibold shadow">All Posts</button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold shadow">AI</button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold shadow">Industry</button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {items.map((post, i) => {
              const href = `/blog/${encodeURIComponent(post.slug)}${post.tenant_id ? `?tenant_id=${post.tenant_id}` : ''}`;
              const date = formatDate(post.published_at || post.created_at);
              return (
                <Link
                  href={href}
                  key={`${post.id}:${post.slug}`}
                  className={`group flex flex-col md:flex-row items-stretch bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300`}
                >
                  <div
                    className={`md:w-1/3 w-full h-48 md:h-auto md:min-h-[12rem] flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]`}
                    role="img"
                    aria-label={`Decorative background for ${post.title}`}
                  >
                    <div className={`w-full h-full ${i % 2 === 0 ? 'bg-black' : 'bg-[#20b2aa]'}`} />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 group-hover:text-[#20b2aa] transition-colors">{post.title}</h2>
                      <div className="text-gray-500 text-sm mb-2">{date}</div>
                      {post.excerpt ? <p className="text-gray-700 mb-4">{post.excerpt}</p> : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
