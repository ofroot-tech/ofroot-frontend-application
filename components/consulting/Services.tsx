/**
 * Services
 *
 * Purpose:
 *  - Alphabetized list of consulting competencies for quick scanning.
 */

import PrimaryCta from "@/components/ui/PrimaryCta";
import dynamic from "next/dynamic";

const LottiePlayer = dynamic(() => import("@/components/ui/LottiePlayer"), { ssr: false });

export default function Services() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-4xl sm:text-5xl font-extrabold">What I Do</h2>

            <ul className="mt-6 space-y-4 text-lg text-gray-700">
              <li className="pl-1">A. Architecture</li>
              <li className="pl-1">B. Automation</li>
              <li className="pl-1">C. Code Delivery</li>
              <li className="pl-1">D. Data & Reporting</li>
              <li className="pl-1">E. Growth Systems</li>
              <li className="pl-1">F. Integration</li>
              <li className="pl-1">G. Stability</li>
            </ul>

            <div className="mt-8">
              <PrimaryCta href="/consulting/book">Book a Strategy Call</PrimaryCta>
            </div>
          </div>

          <div className="flex items-center justify-center">
            {/* Lottie animation with SVG fallback for browsers without JS */}
            <div className="relative w-full max-w-md h-56">
              <div className="absolute -left-8 top-6 w-40 h-40 bg-amber-100 rounded-full filter blur-3xl opacity-70" />
              <div className="absolute right-6 bottom-6 w-28 h-28 bg-amber-100 rounded-full filter blur-2xl opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Client component renders Lottie; noscript falls back to SVG */}
                <div className="w-48 h-auto">
                  {/* Client-only Lottie player (fetches /animations/consulting.json) */}
                  <LottiePlayer src="/animations/consulting.json" className="w-48 h-48 mx-auto" />
                  <noscript>
                    <img src="/images/consulting-graphic.svg" alt="Illustration: person reviewing dashboard charts" className="w-48 h-auto" />
                  </noscript>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
