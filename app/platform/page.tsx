import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCT_CATALOG } from '@/app/config/products';
import { SITE } from '@/app/config/site';

type EditionKey = 'ontask' | 'helpr';

const editionKeys: EditionKey[] = ['helpr', 'ontask'];

const sharedPlatformFeatures = [
  {
    title: 'Shared CRM and lead routing',
    body: 'Every lead, contact, and follow-up path lives in one customer record instead of being split across separate products.',
  },
  {
    title: 'Automations that span the full lifecycle',
    body: 'Lead capture, nurture, reminders, invoicing, and reporting all sit on the same workflow layer.',
  },
  {
    title: 'Billing, permissions, and reporting',
    body: 'One account model for subscribers, teams, plans, and tenant-level access instead of duplicated admin overhead.',
  },
  {
    title: 'Clean upgrade path',
    body: 'Teams can start with growth or operations first, then add the other mode without replatforming or migrating customer data.',
  },
];

const expansionPaths = [
  {
    title: 'Start with Helpr',
    body: 'Use Helpr when the immediate bottleneck is lead capture, response speed, review generation, and top-of-funnel conversion.',
  },
  {
    title: 'Add OnTask when operations get heavier',
    body: 'Move into invoicing, payment reminders, internal workflows, and day-to-day execution without changing systems.',
  },
  {
    title: 'Or start with OnTask and add growth later',
    body: 'Service businesses that already have demand can begin with operations first, then layer Helpr on top for acquisition.',
  },
];

function getEdition(
  raw: string | string[] | undefined
): EditionKey | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'ontask' || value === 'helpr') return value;
  return null;
}

export const metadata: Metadata = {
  title: 'Service Business Platform | OfRoot',
  description:
    'One platform for service-business lead capture, follow-up, operations, invoicing, payments, and reporting. Start with Helpr or OnTask and expand without replatforming.',
  alternates: { canonical: '/platform' },
  openGraph: {
    title: 'Service Business Platform | OfRoot',
    description:
      'Helpr and OnTask are two product editions on one shared platform for growth, operations, and customer lifecycle automation.',
    url: `${SITE.url}/platform`,
    type: 'website',
  },
};

export default async function PlatformPage({
  searchParams,
}: {
  searchParams?: Promise<{ edition?: string | string[] | undefined }>;
}) {
  const params = (await searchParams) || {};
  const selectedEdition = getEdition(params.edition);
  const selectedProduct = selectedEdition ? PRODUCT_CATALOG[selectedEdition] : null;

  const eyebrow = selectedProduct
    ? `${selectedProduct.name} on the OfRoot platform`
    : 'One platform. Two product editions.';
  const heroTitle = selectedEdition === 'helpr'
    ? 'Capture more demand without introducing a second system.'
    : selectedEdition === 'ontask'
      ? 'Run service operations on the same platform that captures and routes demand.'
      : 'One system for service-business growth and operations.';
  const heroBody = selectedEdition === 'helpr'
    ? 'Helpr is the acquisition-first edition: lead capture, follow-up, review generation, and routing into the shared CRM and automation layer.'
    : selectedEdition === 'ontask'
      ? 'OnTask is the operations-first edition: invoicing, reminders, workflow execution, payments, and reporting on the same customer record.'
      : 'OfRoot is structured as one platform with multiple product editions. Teams can start with growth or operations first, then expand without replatforming, duplicating billing, or splitting customer data.';

  const primaryHref = selectedProduct ? `/subscribe?product=${selectedEdition}` : '/pricing';
  const primaryLabel = selectedProduct ? `Start ${selectedProduct.name}` : 'See plans';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Service Business Platform',
    url: `${SITE.url}/platform`,
    description: metadata.description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: editionKeys.map((edition, index) => {
        const product = PRODUCT_CATALOG[edition];
        return {
          '@type': 'Service',
          position: index + 1,
          name: product.name,
          description: product.heroSubtitle,
          url: `${SITE.url}/platform?edition=${edition}`,
          provider: {
            '@type': 'Organization',
            name: SITE.name,
            url: SITE.url,
          },
        };
      }),
    },
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <JsonLd data={structuredData} />

      <section className="bg-[#071225] px-6 pb-16 pt-28 text-white sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#FFC46B]">
              {eyebrow}
            </p>
            <h1 className="text-4xl font-black leading-tight text-white sm:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-3xl text-base text-slate-200 sm:text-xl">
              {heroBody}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="rounded-md bg-[#FF9312] px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-[#FFB14A]"
              >
                {primaryLabel}
              </Link>
              <Link
                href="/consulting/book"
                className="rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Book a product walkthrough
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-3 rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Platform model</p>
              <p className="mt-1 font-semibold text-white">One account, one tenant model, multiple product editions</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Operational advantage</p>
              <p className="mt-1 font-semibold text-white">No split customer records between demand gen and execution</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Commercial advantage</p>
              <p className="mt-1 font-semibold text-white">Start narrow, expand into more workflows without replatforming</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Choose the edition that matches the bottleneck</h2>
              <p className="mt-3 max-w-3xl text-slate-600">
                These are not separate technical stacks. They are two product modes on the same platform.
              </p>
            </div>
            <Link href="/pricing" className="text-sm font-semibold text-slate-700 underline">
              Compare plans
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {editionKeys.map((edition) => {
              const product = PRODUCT_CATALOG[edition];
              const active = selectedEdition === edition;
              return (
                <article
                  key={edition}
                  className={`rounded-2xl border p-6 shadow-sm transition ${
                    active ? 'border-[#FF9312] bg-[#FFF7ED]' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {edition === 'helpr' ? 'Growth edition' : 'Operations edition'}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-900">{product.name}</h3>
                    </div>
                    <Link
                      href={`/platform?edition=${edition}`}
                      className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-[#FF9312] hover:text-[#C96B00]"
                    >
                      Focus this edition
                    </Link>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{product.heroSubtitle}</p>
                  <ul className="mt-5 space-y-2 text-sm text-slate-700">
                    {(product.includes || []).slice(0, 4).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/subscribe?product=${edition}`}
                      className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Start {product.name}
                    </Link>
                    <Link
                      href="/consulting/book"
                      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Talk to product
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Why one platform is the better operating model</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {sharedPlatformFeatures.map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">How teams expand on the platform</h2>
            <p className="mt-3 text-slate-600">
              The platform is designed so the first product you buy does not trap the rest of your workflow outside the system.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {expansionPaths.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#C96B00]">Step {index + 1}</div>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#071225] px-6 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#FFC46B]">
              Platform rollout
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Start with the mode that solves the immediate problem. Keep the upside of one system.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-200">
              If the current problem is demand generation, start with Helpr. If the current problem is operational execution, start with OnTask. Both sit on the same foundation for CRM, automations, billing, and reporting.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/subscribe?product=helpr"
              className="rounded-md bg-[#FF9312] px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-[#FFB14A]"
            >
              Start Helpr
            </Link>
            <Link
              href="/subscribe?product=ontask"
              className="rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Start OnTask
            </Link>
            <Link
              href="/consulting/book"
              className="rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Book a walkthrough
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
