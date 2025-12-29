/**
 * Why
 *
 * Purpose:
 *  - State the specific pain: scattered systems, stalled revenue, and slow handoffs.
 *  - Keep it scannable so operators know this is for them.
 */

export default function Why() {
  return (
    <section className="py-24 px-6 sm:px-8 bg-gray-50 text-center">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-gray-900">Why operators hire OfRoot</h2>

        <p className="text-lg sm:text-xl text-gray-700 mb-6 leading-relaxed">
          Revenue leaks when intake, follow-up, and scheduling are split across tools and teams. Leads wait, crews stall, and your week disappears to glue work.
        </p>

        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
          We build and run the AI workflows that close that gap: faster first response, automated routing, and guardrailed outputs you can trust.
        </p>
      </div>
    </section>
  );
}
