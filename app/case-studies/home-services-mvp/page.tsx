// app/case-studies/home-services-mvp/page.tsx
export const metadata = {
  title: 'Case Study: MVP shipped 2x faster | OfRoot',
  description:
    'How a home services SaaS shipped their MVP twice as fast using scaffolds, CI/CD, and automation from OfRoot.',
  alternates: { canonical: '/case-studies/home-services-mvp' },
};

export default function CaseStudyHomeServicesMVP() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>MVP shipped 2x faster</h1>
      <p className="lead">Home services SaaS accelerated delivery with scaffolds and CI/CD pipelines.</p>

      <section>
        <h3>Company</h3>
        <p>Home services SaaS (pre‑seed)</p>
      </section>

      <section>
        <h3>Problem</h3>
        <p>
          A small team needed to deliver a market‑ready MVP quickly without sacrificing reliability. Manual setups and
          ad‑hoc processes slowed iteration.
        </p>
      </section>

      <section>
        <h3>Approach</h3>
        <ul>
          <li>Bootstrapped CI/CD with preview deployments</li>
          <li>Provided scaffolds for auth, RBAC, and observability</li>
          <li>Templatized API and frontend modules for rapid feature work</li>
        </ul>
      </section>

      <section>
        <h3>Outcome</h3>
        <ul>
          <li>Cycle time reduced by ~50%</li>
          <li>Higher reliability with automated checks</li>
          <li>Team autonomy improved with paved paths</li>
        </ul>
      </section>

      {/* CaseStudy JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CaseStudy',
            name: 'MVP shipped 2x faster',
            description:
              'How a home services SaaS shipped their MVP twice as fast using scaffolds, CI/CD, and automation from OfRoot.',
            provider: { '@type': 'Organization', name: 'OfRoot' },
            about: { '@type': 'Product', name: 'Development Automation' },
            audience: { '@type': 'Audience', audienceType: 'Founders, small product teams' },
          }),
        }}
      />
    </article>
  );
}
