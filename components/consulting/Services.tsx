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
      desc: "Design scalable, maintainable platform architectures that align with business goals.",
    },
    {
      title: "Automation",
      desc: "Remove manual bottlenecks with reliable automation for deploys, testing and ops.",
    },
    {
      title: "Code Delivery",
      desc: "Improve velocity and safety with CI/CD, code ownership and delivery workflows.",
    },
    {
      title: "Data & Reporting",
      desc: "Turn event data into clear reports and actionable insights for growth and ops.",
    },
    {
      title: "Growth Systems",
      desc: "Build measurement-backed systems to acquire, engage, and retain customers.",
    },
    {
      title: "Integration",
      desc: "Connect services and tools securely to streamline product and engineering workflows.",
    },
    {
      title: "Stability",
      desc: "Reduce risk with observability, testing, and incident response improvements.",
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold">What I Do</h2>
          <p className="mt-3 text-sm text-gray-500 max-w-2xl">
            I help companies scale engineering and product delivery — from
            platform architecture to automated delivery and data-driven growth
            systems. Below are core areas I commonly lead with cross-functional
            teams.
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
            <a
              href="/case-studies"
              className="text-sm text-gray-700 hover:text-gray-900"
            >
              See case studies →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
