// app/case-studies/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Case Studies | OfRoot',
  description: 'Outcome-focused case studies across AI automation, healthcare systems, and stable integrations.',
  alternates: { canonical: '/case-studies' },
};

const studies = [
  {
    href: '/case-studies/home-services-mvp',
    title: 'Home services MVP live in 30 days',
    summary: 'Operator-led build shipped intake → scheduling → invoicing → payments with guardrails and CI/CD.',
    tag: 'Growth Platform',
  },
  {
    href: '/case-studies/healthcare-ai-automation',
    title: 'Healthcare systems + AI automation',
    summary: 'Improved response paths and system reliability with workflow optimization, observability, and AI automation.',
    tag: 'Healthcare Systems',
  },
  {
    href: '/case-studies/crm-erp-sync',
    title: 'CRM + ERP sync automation',
    summary: 'Stable system integrations with retries, auditability, and reporting automation — fewer ops escalations.',
    tag: 'System Integrations',
  },
];

export default function CaseStudiesIndexPage() {
  return (
    <div>
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">Case Studies</h1>
        <p className="mt-3 text-lg text-gray-700 max-w-3xl mx-auto">
          Proof that small, focused systems work delivers outsized results.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {studies.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#20b2aa]"
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
