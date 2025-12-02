/**
 * Landing Page (literate/Knuth-style notes)
 *
 * Responsibilities
 *  - Render a static, manifest-driven landing by slug.
 *  - Support simple theming per page (primary/secondary colors).
 *  - Provide A/B copy variants selected via query (?v=A) with sticky cookies so a
 *    visitor remains on the same variant across requests.
 *
 * Constraints
 *  - No DB or server state is required; everything is based on a static JSON manifest.
 *  - Works on Vercel static generation with Next.js App Router.
 *
 * Variant stickiness
 *  - Middleware sets the cookie when `?v=X` is present and redirects to a clean URL.
 *  - On subsequent requests, we read the cookie to pick the variant. If absent, we
 *    fall back to `variants.default` in the manifest.
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import data from '@/app/landing/manifest.json';
import Exposure from '@/app/landing/components/Exposure';
import CtaLink from '@/app/landing/components/CtaLink';
import SafeEmbed from '@/app/landing/components/SafeEmbed';
import LeadCapture from '@/app/landing/components/LeadCapture';

/** Compute the active variant key using cookies and manifest defaults. */
async function resolveVariantKey(opts: {
  slug: string;
  variants: Record<string, any>;
}) {
  const { slug, variants } = opts;
  const defaultKey = variants.default || 'A';
  const cookieName = `ofroot_variant_${slug}`;

  const store = await cookies();
  const fromCookie = store.get(cookieName)?.value;

  return (fromCookie && variants[fromCookie]) ? fromCookie : defaultKey;
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = (data as any).pages[slug];
  if (!page) return notFound();

  // Theme (optional)
  const theme = page.theme || {};
  const primary = theme.primary || '#20b2aa';
  const secondary = theme.secondary || '#007bff';

  // Variant (sticky via cookie set by middleware)
  const variants = page.variants || {};
  const variantKey = await (async () => {
    const cookieName = `ofroot_variant_${slug}`;
    const store = await cookies();
    const v = store.get(cookieName)?.value;
    return (v && variants[v]) ? v : (variants.default || 'A');
  })();
  const variant = variants[variantKey] || {};

  const ctaLabel = (variant.ctaLabel ?? page.cta?.label) as string | undefined;

  return (
  <main className="reveal-in">
      {/* SEO JSON-LD */}
      {page.seo?.title && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: page.seo.title,
              description: page.seo.description || undefined,
              url: `https://ofroot.com/landing/${slug}`,
            }),
          }}
        />
      )}
      {/* Client analytics: exposure event */}
      <Exposure slug={slug} variant={variantKey} />

      {/* Wrap content in snap container for full-screen sections */}
      <div className="snap-page" style={{ ['--chevron-bottom-offset' as any]: '18px', ['--chevron-top-offset' as any]: '18px', ['--chevron-glow-opacity' as any]: 0.95, ['--chevron-color' as any]: primary }}>

      {/* Hero */}
      {page.hero && (
  <section data-snap-section className="section-full snap-fade py-16 px-6 sm:px-12 bg-gradient-to-r from-[#20b2aa]/10 to-[#007bff]/10 reveal-in fade-only">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-4">{page.hero.headline}</h1>
            {page.hero.subheadline && <p className="text-lg text-gray-700 max-w-3xl mx-auto">{page.hero.subheadline}</p>}
            {page.cta && ctaLabel && (
              <div className="mt-8">
                <CtaLink
                  href={page.cta.href}
                  label={`${ctaLabel} `}
                  slug={slug}
                  variant={variantKey}
                  className="inline-block text-white py-3 px-6 rounded-md font-semibold transition"
                  style={{ backgroundColor: primary }}
                />
                <span className="ml-1 text-xs align-middle px-2 py-1 rounded bg-white/20">{variantKey}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features */}
      {page.features?.length ? (
  <section data-snap-section className="section-full snap-fade py-16 px-6 sm:px-12 reveal-in">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {page.features.map((f: any) => (
              <div key={f.title} className="p-6 rounded-lg shadow border border-gray-200">
                <div className="text-2xl mb-2">{f.emoji}</div>
                <h3 className="font-semibold text-xl mb-1">{f.title}</h3>
                <p className="text-gray-600">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Simple lead capture for service niches */}
      {['plumbers', 'hvac', 'roofers'].includes(slug) && (
  <section data-snap-section className="section-full snap-fade py-8 px-6 sm:px-12 reveal-in fade-only">
          <div className="max-w-3xl mx-auto">
            <LeadCapture service={slug} />
          </div>
        </section>
      )}

      {/* Optional embed block (e.g., Calendly, form) */}
      {page.embed?.html && (
  <section data-snap-section className="section-full snap-fade py-16 px-6 sm:px-12 reveal-in">
          <div className="max-w-4xl mx-auto">
            <SafeEmbed html={page.embed.html} />
          </div>
        </section>
      )}

      </div>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = (data as any).pages[slug];
  if (!page) return {};
  const title = page.seo?.title || page.hero?.headline || 'OfRoot';
  const description = page.seo?.description || page.hero?.subheadline || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/landing/${slug}` },
    openGraph: { title, description, url: `/landing/${slug}` },
  };
}
