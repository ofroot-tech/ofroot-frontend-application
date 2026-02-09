/**
 * Engagements
 *
 * Purpose:
 *  - Explain how consulting engagements run to reduce friction.
 */

export default function Engagements() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold">Consulting Engagement Process</h2>

        <p className="mt-3 text-sm text-gray-600 max-w-2xl mx-auto">
          A simple consulting engagement process designed to create clarity fast, then ship improvements you can measure.
        </p>

        <ol className="mt-6 space-y-4 text-lg text-gray-700 list-decimal list-inside mx-auto max-w-2xl text-left">
          <li>
            <span className="font-semibold text-gray-900">Discovery call</span> — align on outcomes, constraints, and what “done” means.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Architecture + roadmap</span> — map the shortest path to reliability, automation, and scalable delivery.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Build + iterate</span> — ship production changes weekly with clear ownership and low risk.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Stability + growth</span> — harden what you shipped, then extend into reporting and growth systems.
          </li>
        </ol>
      </div>
    </section>
  );
}
