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

        <ul className="mt-6 space-y-4 text-lg text-gray-700 list-disc list-inside mx-auto max-w-md text-left">
          <li>I deliver fast.</li>
          <li>I build stable systems.</li>
          <li>I integrate AI + automation correctly.</li>
          <li>I reduce engineering cost.</li>
          <li>I think growth-first.</li>
        </ul>
      </div>
    </section>
  );
}
