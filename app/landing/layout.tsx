/**
 * Landing Layout (literate/Knuth-style notes)
 *
 * Purpose
 *  - Provide a minimal, neutral wrapper around all landing pages.
 *  - Keep visual responsibility (spacing, container width) out of the landing page
 *    implementation so authors can focus on content and blocks.
 *
 * Design choices
 *  - No global navbar: landings often want focused attention without nav leaks.
 *  - A gentle max-width container keeps content readable on large displays.
 *  - A simple footer link back to the main site avoids dead-ends for crawlers and users.
 *
 * Extensibility
 *  - If a landing needs a bespoke header/footer, prefer doing it in the page file
 *    rather than adding conditionals here. The layout should remain predictable.
 */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
      <footer className="py-10 text-center text-sm text-gray-500">
        <a href="/" className="hover:underline">← Back to Home</a>
      </footer>
    </div>
  );
}
