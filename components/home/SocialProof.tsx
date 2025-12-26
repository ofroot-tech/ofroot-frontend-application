/**
 * SocialProof
 *
 * Purpose:
 *  - Short testimonials and sector notes to reduce risk for buyers.
 */

export default function SocialProof() {
  return (
    <section className="py-24 px-6 sm:px-8 bg-white text-center">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-gray-900">Proof It Works</h2>

        <p className="text-lg sm:text-xl text-gray-700 mb-10">Used by businesses in home services, consulting, real estate, and local trades.</p>

        <blockquote className="border-l-4 border-gray-900 pl-6 py-2 text-xl text-gray-700 italic font-medium">&ldquo;We got a full system in 48 hours — website, branding, CRM, automations. First 3 leads arrived that same week.&rdquo;</blockquote>
      </div>
    </section>
  );
}
