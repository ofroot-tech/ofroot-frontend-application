/**
 * SocialProof
 *
 * Purpose:
 *  - Short testimonials and sector notes to reduce risk for buyers.
 *  - Highlights the MetroAreaRemovalServices case study as live proof.
 */

export default function SocialProof() {
  return (
    <section className="py-24 px-6 sm:px-8 bg-white text-center">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-gray-900">Proof it works</h2>

        <p className="text-lg sm:text-xl text-gray-700 mb-10">Operator-led builds running in home services, consulting, and local trades.</p>

        <div className="space-y-6 text-left">
          <blockquote className="border-l-4 border-gray-900 pl-6 py-2 text-xl text-gray-700 italic font-medium">&ldquo;MetroAreaRemovalServices: AI intake + scheduling now drive reliable weekly bookings. No more missed calls or manual routing.&rdquo;</blockquote>
          <blockquote className="border-l-4 border-gray-200 pl-6 py-2 text-lg text-gray-700 font-medium">&ldquo;Senior engineers build and run it. We see weekly milestones and can request changes in one thread.&rdquo;</blockquote>
        </div>
      </div>
    </section>
  );
}
