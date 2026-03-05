/**
 * CaseStudies
 *
 * Purpose:
 *  - Showcase tangible results and vertical experience.
 */

import Link from 'next/link';

export default function CaseStudies() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold">Case Studies</h2>

        <div className="mt-6 mx-auto max-w-3xl text-left">
          <ul className="space-y-5">
            <li>
              <Link href="/case-studies/home-services-mvp" className="text-lg font-semibold text-gray-900 hover:underline">
                Home services growth platform
              </Link>
              <p className="mt-1 text-sm text-gray-700">
                MVP live in 30 days with intake → scheduling → invoicing → payments, plus automation and guardrails.
              </p>
            </li>

            <li>
              <Link href="/case-studies/healthcare-ai-automation" className="text-lg font-semibold text-gray-900 hover:underline">
                Healthcare systems + AI automation
              </Link>
              <p className="mt-1 text-sm text-gray-700">
                Monitoring and workflow automation that improves response time and reliability for clinical operations.
              </p>
            </li>

            <li>
              <Link href="/case-studies" className="text-lg font-semibold text-gray-900 hover:underline">
                Enterprise internal tools modernization
              </Link>
              <p className="mt-1 text-sm text-gray-700">
                Reduce cycle time by simplifying systems, tightening delivery, and improving observability.
              </p>
            </li>

            <li>
              <Link href="/case-studies/crm-erp-sync" className="text-lg font-semibold text-gray-900 hover:underline">
                System integrations (CRM + ERP)
              </Link>
              <p className="mt-1 text-sm text-gray-700">
                Stable integrations that keep data consistent across third-party tools without breaking production.
              </p>
            </li>

            <li>
              <Link href="/case-studies" className="text-lg font-semibold text-gray-900 hover:underline">
                Operational analytics + reporting automation
              </Link>
              <p className="mt-1 text-sm text-gray-700">
                Growth platforms with clean measurement pipelines for acquisition, activation, and retention.
              </p>
            </li>
          </ul>

          <p className="mt-8 text-sm text-gray-700">
            Explore more: <Link href="/case-studies" className="font-medium text-teal-700 hover:underline">all case studies →</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
