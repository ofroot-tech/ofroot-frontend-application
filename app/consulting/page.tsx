/**
 * Consulting Page (App Router)
 *
 * Purpose:
 *  - Minimal, modular consulting page built from small components.
 *  - Exports `metadata` for SEO and uses server component by default.
 *  - Includes JSON-LD schemas for rich snippets.
 */

import { Metadata } from 'next';
import HeroConsulting from "@/components/consulting/HeroConsulting";
import Services from "@/components/consulting/Services";
import Engagements from "@/components/consulting/Engagements";
import WhyHire from "@/components/consulting/WhyHire";
import CaseStudies from "@/components/consulting/CaseStudies";
import FinalCta from "@/components/consulting/FinalCta";
import { generateServiceSchema, generateOrganizationSchema } from '@/app/lib/schemas';

export const metadata: Metadata = {
  title: 'Senior Software Architect & Automation Consulting | OfRoot',
  description:
    'Senior software architect consulting focused on scalable systems, workflow + AI automation, and production-grade delivery. Improve reliability, reduce operational drag, and keep momentum.',
  keywords: [
    'senior software architect consulting',
    'software architect consulting',
    'automation consulting',
    'AI automation',
    'workflow optimization',
    'scalable systems',
    'system reliability',
    'observability',
    'production-grade software delivery',
  ],
  openGraph: {
    title: 'Senior Software Architect & Automation Consulting | OfRoot',
    description:
      'Work with a senior software architect to build scalable systems, automate workflows, and improve reliability — without slowing delivery.',
    url: 'https://ofroot.technology/consulting',
    type: 'website',
  },
};

export default function ConsultingPage() {
  const serviceSchema = generateServiceSchema();
  const orgSchema = generateOrganizationSchema();

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <main className="flex flex-col">
      <HeroConsulting />
      <Services />
      <Engagements />
      <WhyHire />
      <CaseStudies />
      <FinalCta />
    </main>
    </>
  );
}
