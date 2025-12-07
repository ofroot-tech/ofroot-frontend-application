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
  title: "Consulting — OfRoot",
  description: "Senior architecture and engineering consulting: scale systems, automate workflows, and reduce engineering cost. Retainer-based ($6K–$12K+/month).",
  keywords: ['consulting', 'architecture', 'engineering', 'automation', 'DevOps'],
  openGraph: {
    title: "Consulting — OfRoot",
    description: "Scale, automate, and optimize your engineering. 8+ years of expertise.",
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
