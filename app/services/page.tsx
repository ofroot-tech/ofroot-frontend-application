// app/services/page.tsx
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { SITE } from '@/app/config/site';

export const metadata = {
  title: 'Automation Services | OfRoot',
  description: 'Choose your automation integration pillar: HubSpot + Meta, workflow automation, pipeline data sanity, and LLM agent integrations.',
};

const cards = [
  {
    href: '/services/hubspot-meta-integrations',
    title: 'HubSpot + Meta Integrations',
    desc: 'Capture leads from comments, DMs, and forms, then sync and route them correctly in HubSpot.',
  },
  {
    href: '/services/workflow-automation',
    title: 'Workflow Automation',
    desc: 'Build reliable Make, Zapier, and API workflows for faster follow-up and booked meetings.',
  },
  {
    href: '/services/data-pipeline-sanity',
    title: 'Data Pipeline Sanity',
    desc: 'Fix duplicates, dropped events, and bad mappings so your CRM and reporting are trustworthy.',
  },
  {
    href: '/services/llm-agent-integrations',
    title: 'LLM + Agent Integrations',
    desc: 'Deploy agent workflows with approvals and safe data access for real operations impact.',
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
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">Automation Services</h1>
        <p className="mt-3 text-lg text-gray-700 max-w-3xl mx-auto">Everything here is built to improve lead quality, booked meetings, and pipeline reliability.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9312]">
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
