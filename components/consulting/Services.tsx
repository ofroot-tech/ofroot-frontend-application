/**
 * Services
 *
 * Purpose:
 *  - Alphabetized list of consulting competencies for quick scanning.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";

/**
 * Services
 *
 * Purpose:
 *  - Replace the simple alphabetized list with a modern, conversion-focused
 *    layout: short intro, a responsive card grid showing core services,
 *    and a prominent CTA.
 *
 * Notes:
 *  - Keep this component focused and lightweight — it should act as a
 *    conversion module on the consulting page.
 */

export default function Services() {
  const services = [
    {
      title: "Architecture",
      desc: "Lower long-term cost with scalable software architecture that stays maintainable as your product and team grow.",
    },
    {
      title: "Automation",
      desc: "Remove manual work with workflow automation and AI automation that eliminates bottlenecks and increases speed without chaos.",
    },
    {
      title: "Code Delivery",
      desc: "Ship production-grade software delivery with clean ownership, CI/CD guardrails, and velocity without regressions.",
    },
    {
      title: "Data & Reporting",
      desc: "Get operational analytics and reporting automation that turns activity into clear decisions — without technical dashboards.",
    },
    {
      title: "Growth Systems",
      desc: "Build scalable growth systems that support acquisition, activation, and retention with measurement you can trust.",
    },
    {
      title: "Integration",
      desc: "Deliver stable system integrations across CRMs, internal tools, and third-party services — without breaking production.",
    },
    {
      title: "Stability",
      desc: "Increase system reliability with observability and practical safeguards that reduce risk, incidents, and downtime.",
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold">How I Help Teams Scale</h2>
          <p className="mt-3 text-sm text-gray-500 max-w-2xl">
            I lead automation, architecture, and delivery so teams can move faster with fewer surprises.
            These are the core areas I most often drive for operator-led companies.
          </p>

          <div className="mt-10 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => {
                // Generate a clean slug that matches the service pages
                // e.g. "Data & Reporting" -> "data-reporting"
                const slug = s.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-') // replace non-alnum with hyphen
                  .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
                return (
                  <article
                    key={s.title}
                    className="flex flex-col p-5 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 flex-1">{s.desc}</p>
                    <div className="mt-4">
                      <a
                        className="inline-block text-sm font-medium text-teal-600 hover:underline"
                        href={`/services/${slug}`}
                        aria-label={`Learn more about ${s.title}`}
                      >
                        Learn more →
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <PrimaryCta href="/consulting/book">Book a Strategy Call</PrimaryCta>
          </div>
        </div>
      </div>
    </section>
  );
}
