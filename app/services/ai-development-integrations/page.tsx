// app/services/ai-development-integrations/page.tsx
import ServiceHero from '../components/ServiceHero';
import ServiceFAQ from '../components/ServiceFAQ';
import ServiceProof from '../components/ServiceProof';

export const metadata = {
  title: 'AI Development & Integrations | OfRoot',
  description: 'Custom AI models, LLM integrations, and automation of knowledge work to enhance decision‑making and customer experience.',
  alternates: { canonical: '/services/ai-development-integrations' },
};

export default function AIDevelopmentIntegrationsPage() {
  return (
    <div className="snap-page" style={{ ['--chevron-bottom-offset' as any]: '14px', ['--chevron-top-offset' as any]: '14px', ['--chevron-glow-opacity' as any]: 0.9 }}>
      <section data-snap-section className="section-full snap-fade">
        <ServiceHero
        title="AI Development & Integrations"
        subtitle="From assistants and retrieval to end‑to‑end orchestration: ship AI that actually helps people work faster."
        ctaHref="/subscribe?product=ai-development-integrations"
        ctaLabel="Start subscription"
  analyticsServiceId="ai-development-integrations"
  secondaryCtaHref="https://form.jotform.com/252643426225151"
        />
      </section>

      <section data-snap-section className="section-full snap-fade grid grid-cols-1 md:grid-cols-2 gap-6 py-12 px-6">
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Outcomes</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Faster support and operations</li>
            <li>• Better decisions via retrieval and analytics</li>
            <li>• Measurable ROI from automation</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">What’s included</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Assistants & workflows</li>
            <li>• RAG, embeddings, and data pipelines</li>
            <li>• Integrations with CRMs and back‑office systems</li>
            <li>• <span className="font-medium text-blue-700">AI safety & authentication review:</span> We audit your code and database for authentication errors and unsafe production code—especially important for AI-driven sites.</li>
          </ul>
        </div>
      </section>
      <section data-snap-section className="section-full snap-fade py-12 px-6">
        <ServiceProof
        logos={["/logos/logo-acme.svg", "/logos/logo-zen.svg"]}
        quotes={[{ quote: 'Our support backlog dropped after we rolled out the assistant.', author: 'COO', role: 'Marketplace' }]}
        />
      </section>
      <section data-snap-section className="section-full snap-fade py-12 px-6">
        <ServiceFAQ
        items={[
          { q: 'Do you build custom models?', a: 'When appropriate. Often we start with LLMs and focus on UX, data, and orchestration.' },
          { q: 'Can you integrate our tools?', a: 'Yes — we connect CRMs, messaging, analytics, and internal systems.' },
        ]}
        />
      </section>

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
                name: 'Do you build custom models?',
                acceptedAnswer: { '@type': 'Answer', text: 'When appropriate. Often we start with LLMs and focus on UX, data, and orchestration.' },
              },
              {
                '@type': 'Question',
                name: 'Can you integrate our tools?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes — we connect CRMs, messaging, analytics, and internal systems.' },
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
            name: 'AI Development & Integrations',
            provider: { '@type': 'Organization', name: 'OfRoot' },
            areaServed: 'US',
            description:
              'Custom AI models, LLM integrations, and automation of knowledge work to enhance decision‑making and customer experience.',
            offers: {
              '@type': 'Offer',
              price: '149',
              priceCurrency: 'USD',
              category: 'subscription',
            },
          }),
        }}
      />
    </div>
  );
}
