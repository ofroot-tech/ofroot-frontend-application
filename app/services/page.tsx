// app/services/page.tsx
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';

export const metadata = {
  title: 'Services | OfRoot',
  description: 'Integration services for pipelines, lead routing, data sanity, and agent integration. HubSpot, Meta API, Make, and Zapier.',
};

const cards = [
  {
    href: '/services/integration',
    title: 'HubSpot + Meta Integrations',
    desc: 'Lead capture, sync, attribution, and booking workflows built to run reliably in production.',
  },
  {
    href: '/automations',
    title: 'Automation Services',
    desc: 'Make.com and Zapier builds, plus direct API integrations when you need reliability and control.',
  },
  {
    href: '/services/automation',
    title: 'Workflow Automation',
    desc: 'Routing, follow-up, scheduling handoffs, and monitoring so leads never drop silently.',
  },
  {
    href: '/services/marketing-automation',
    title: 'HubSpot Workflows',
    desc: 'Lifecycle stages, assignment rules, follow-ups, and booking KPIs that increase qualified meetings.',
  },
  {
    href: '/services/ai-development-integrations',
    title: 'Agents and LLM Integrations',
    desc: 'Agent orchestration, retrieval, and tool integrations that operate on your data safely.',
  },
  {
    href: '/gpu-llm-training',
    title: 'GPU + LLM Training',
    desc: 'GPU capacity plus data cleaning, pipelines, and training-run reliability for custom model work.',
  },
  {
    href: '/services/stability',
    title: 'Reliability and Data Sanity',
    desc: 'Observability, retries, validation, and runbooks for pipelines and integrations.',
  },
  {
    href: '/services/add-ons',
    title: 'Add‑ons',
    desc: 'Add integration surfaces, reporting, and new workflows as your system grows.',
  },
];

export default function ServicesIndexPage() {
  return (
    <div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Services',
          url: `${SITE.url}/services`,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: cards.map((c, i) => ({
              '@type': 'Service',
              position: i + 1,
              name: c.title,
              description: c.desc,
              url: `${SITE.url}${c.href}`,
              provider: {
                '@type': 'Organization',
                name: SITE.name,
                url: SITE.url,
              },
            })),
          },
        }}
      />
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">Services</h1>
        <p className="mt-3 text-lg text-gray-700 max-w-3xl mx-auto">Integration-first delivery: pipelines, lead routing, data sanity, and agents that drive booked-meeting outcomes.</p>
        <p className="mt-2 text-sm text-gray-600">Add modules anytime as you grow — <a href="/services/add-ons" className="underline">see add‑ons</a>.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#20b2aa]">
            <h2 className="text-xl font-semibold text-gray-900">{c.title}</h2>
            <p className="mt-1 text-gray-700 text-sm">{c.desc}</p>
            <span className="mt-3 inline-block underline text-gray-800 text-sm">Explore →</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a href="/case-studies" className="underline text-gray-800">See case studies</a>
      </div>
    </div>
  );
}
