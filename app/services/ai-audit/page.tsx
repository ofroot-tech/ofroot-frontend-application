// app/services/ai-audit/page.tsx
import ServiceHero from '../components/ServiceHero';
import ServiceFAQ from '../components/ServiceFAQ';
import ServiceProof from '../components/ServiceProof';

export const metadata = {
  title: 'AI Website & Ads Audit | OfRoot',
  description: 'A no‑cost review of your site and ad accounts. Get prioritized quick wins in 48 hours.',
  alternates: { canonical: '/services/ai-audit' },
};
import AuditRequestButton from '@/components/AuditRequestButton';

export default function AIAuditPage() {
  return (
    <div>
      <ServiceHero
        title="AI Website & Ads Audit"
        subtitle="A no‑cost review of your site and ad accounts. Get prioritized quick wins in 48 hours."
        ctaHref="#request"
        ctaLabel="Request free audit"
  analyticsServiceId="ai-audit"
  secondaryCtaHref="https://form.jotform.com/252643426225151"
      />

      <section id="request" className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
        <p className="text-gray-700">We’ll send you a short summary with opportunities and a clear next step. No obligation.</p>
        <div className="mt-3"><AuditRequestButton /></div>
      </section>

      <ServiceProof
        logos={["/logos/logo-acme.svg", "/logos/logo-zen.svg"]}
        quotes={[{ quote: 'The audit gave us clear quick wins to implement.', author: 'Marketing Lead', role: 'Regional Services' }]}
      />

      <ServiceFAQ
        items={[
          { q: 'What do you need from me?', a: 'Your website URL and (optionally) your ads account ID. We can sign an NDA if needed.' },
          { q: 'Can you implement the recommendations?', a: 'Yes — continue on a monthly plan and we can execute for you.' },
        ]}
      />
      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What do you need from me?',
                acceptedAnswer: { '@type': 'Answer', text: 'Your website URL and (optionally) your ads account ID. We can sign an NDA if needed.' },
              },
              {
                '@type': 'Question',
                name: 'Can you implement the recommendations?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes — continue on a monthly plan and we can execute for you.' },
              },
            ],
          }),
        }}
      />

      {/* Service JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'AI Website & Ads Audit',
            provider: { '@type': 'Organization', name: 'OfRoot' },
            areaServed: 'US',
            description:
              'A no‑cost review of your site and ad accounts. Get prioritized quick wins in 48 hours.',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              category: 'free',
            },
          }),
        }}
      />
    </div>
  );
}
