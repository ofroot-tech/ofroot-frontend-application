// app/case-studies/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Case Studies | OfRoot',
  description: 'Real outcomes from lead, workflow, and integration automation systems.',
  alternates: { canonical: '/case-studies' },
};

const studies = [
  {
    href: '/case-studies/home-services-mvp',
    title: 'MVP shipped 2x faster',
    summary: 'Home services SaaS accelerated delivery with scaffolds and CI/CD pipelines.',
    tag: 'Development Automation',
  },
  {
    href: '/case-studies/crm-erp-sync',
    title: 'CRM and ERP sync with visible failure handling',
    summary: 'Source-of-truth rules, retries, recoverable failures, and reporting automation.',
    tag: 'Automation Systems',
  },
  {
    href: '/case-studies/healthcare-ai-automation',
    title: 'AI-assisted operational workflows',
    summary: 'Routing, summarization, observability, and runbooks for an anonymized healthcare operations system.',
    tag: 'Private Company AI',
  },
];

export default function CaseStudiesIndexPage() {
  return (
    <div>
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">Case Studies and Selected Systems</h1>
        <p className="mt-3 text-lg text-gray-700 max-w-3xl mx-auto">
          Existing OfRoot examples across delivery, integration reliability, and AI-assisted operations.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {studies.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9312]"
          >
            <div className="text-xs uppercase tracking-wide text-gray-500">{s.tag}</div>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">{s.title}</h2>
            <p className="mt-1 text-gray-700 text-sm">{s.summary}</p>
            <span className="mt-3 inline-block underline text-gray-800 text-sm">Read →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
