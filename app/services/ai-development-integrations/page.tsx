// app/services/ai-development-integrations/page.tsx
import ServiceHero from '../components/ServiceHero';
import ServiceFAQ from '../components/ServiceFAQ';
import ServiceProof from '../components/ServiceProof';

export const metadata = {
  title: 'Agent + LLM Integrations | OfRoot',
  description: 'Agent orchestration, LLM integrations, and tool-connected workflows that operate on your data with safety, evaluation, and observability.',
  alternates: { canonical: '/services/ai-development-integrations' },
};

export default function AIDevelopmentIntegrationsPage() {
  return (
    <div className="snap-page" style={{ ['--chevron-bottom-offset' as any]: '14px', ['--chevron-top-offset' as any]: '14px', ['--chevron-glow-opacity' as any]: 0.9 }}>
      <section data-snap-section className="section-full snap-fade">
        <ServiceHero
        title="Agent + LLM Integrations"
        subtitle="Ship agents that can safely use your tools and data: retrieval, orchestration, evaluations, and monitoring in production."
        ctaHref="/consulting/book"
        ctaLabel="Book an agent integration call"
  analyticsServiceId="ai-development-integrations"
  secondaryCtaHref="https://form.jotform.com/252643426225151"
        />
      </section>

      <section data-snap-section className="section-full snap-fade grid grid-cols-1 md:grid-cols-2 gap-6 py-12 px-6">
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Outcomes</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Agents that reliably complete real work</li>
            <li>• Fewer manual handoffs and queue time</li>
            <li>• Safer outputs with evaluations and guardrails</li>
          </ul>
        </div>
        <div className="rounded-xl border p-6 bg-white/80 backdrop-blur shadow-sm">
          <h3 className="text-xl font-semibold mb-2">What’s included</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Agent orchestration and tool integrations</li>
            <li>• RAG, embeddings, and data pipelines</li>
            <li>• Evaluations, monitoring, and safe fallbacks</li>
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
          { q: 'Do you build agents or just chatbots?', a: 'Agents. We connect tools, add retrieval, and ship evaluations and monitoring so behavior stays stable in production.' },
          { q: 'Can you integrate our tools and data?', a: 'Yes. We connect CRMs, messaging, analytics, and internal systems with least-privilege access and auditability.' },
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
                name: 'Do you build agents or just chatbots?',
                acceptedAnswer: { '@type': 'Answer', text: 'Agents. We connect tools, add retrieval, and ship evaluations and monitoring so behavior stays stable in production.' },
              },
              {
                '@type': 'Question',
                name: 'Can you integrate our tools and data?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes. We connect CRMs, messaging, analytics, and internal systems with least-privilege access and auditability.' },
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
            name: 'Agent + LLM Integrations',
            provider: { '@type': 'Organization', name: 'OfRoot' },
            areaServed: 'US',
            description:
              'Agent orchestration, LLM integrations, and tool-connected workflows that operate on your data with safety, evaluation, and observability.',
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
