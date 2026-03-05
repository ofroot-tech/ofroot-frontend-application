/**
 * WhyHire
 *
 * Purpose:
 *  - Explain reasons to choose this consulting offering.
 */

export default function WhyHire() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold">Why Teams Hire Me</h2>

        <p className="mt-3 text-sm text-gray-600 max-w-2xl mx-auto">
          You get senior software architect judgment plus hands-on delivery — optimized for operators who need speed and reliability.
        </p>

        <ul className="mt-6 space-y-4 text-lg text-gray-700 list-disc list-inside mx-auto max-w-2xl text-left">
          <li>Move faster without regressions: clear scope, weekly shipping, and practical guardrails.</li>
          <li>Reduce risk: system reliability, observability, and incident-proofing baked into delivery.</li>
          <li>Remove operational drag: workflow automation and AI automation that eliminates manual work.</li>
          <li>Lower long-term cost: scalable architecture that’s easy to maintain and extend.</li>
          <li>Build what growth needs: acquisition → activation → retention systems with measurable feedback loops.</li>
        </ul>
      </div>
    </section>
  );
}
