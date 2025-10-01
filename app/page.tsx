// app/page.tsx
'use client';

/**
 * Home (client component)
 *
 * Key safety & fixes in this file:
 *  - Avoids global monkeypatching of window.fetch (dangerous for Next internals).
 *  - Guards all DOM and window interactions behind `hasMounted` to prevent SSR/client hydration mismatches.
 *  - Loads Vanta via dynamic import inside a client-only useEffect and cleans up on unmount.
 *  - Uses next/Script only for external script injection (Calendly). Does NOT use next/Script for JSON-LD.
 *  - Inserts JSON-LD with a client-side useEffect that creates a <script type="application/ld+json"> element
 *    and sets textContent (plain string). This prevents the `appendChild` Unexpected token ':' error.
 *  - Adds a timeout fallback for Calendly initialization and scoped diagnostic listeners.
 */

import { Analytics } from "@vercel/analytics/react";
import Script from 'next/script';
import { useEffect, useRef, useState } from "react";
import Footer from "./components/Footer";

/* ------------------------------
   Constants
   ------------------------------ */
// Calendly external widget URL (served by Calendly's CDN)
const calendlySrc = 'https://assets.calendly.com/assets/external/widget.js';

// Timeout (ms) to consider Calendly failed to initialize if global Calendly is not present
const CALENDLY_INIT_TIMEOUT = 8000;

export default function Home() {
  /* ------------------------------
     Refs & state
     ------------------------------ */
  const vantaRef = useRef<HTMLDivElement | null>(null);
  const vantaEffect = useRef<any>(null);

  // Container ref for Calendly widget markup; Calendly script will target markup with `calendly-inline-widget`.
  const calendlyRef = useRef<HTMLDivElement | null>(null);

  // State representing Calendly load status:
  // - null = unknown / still attempting to load
  // - true = Calendly script loaded and global Calendly available
  // - false = failed (error or timeout)
  const [calendlyLoaded, setCalendlyLoaded] = useState<boolean | null>(null);

  // Guard so we only render client-only pieces after hydration completes.
  // Prevents server -> client hydration mismatches where DOM depends on window/document.
  const [hasMounted, setHasMounted] = useState(false);

  /* ------------------------------
     Health broadcasting helper
     ------------------------------ */
  // Broadcast resource health so other parts of the app (e.g., Footer) can listen.
  const updateHealth = (resource: string, status: 'ok' | 'failed' | 'loading' | 'unknown') => {
    try {
      (window as any).__OFROOT_HEALTH = (window as any).__OFROOT_HEALTH || {};
      (window as any).__OFROOT_HEALTH[resource] = status;
      window.dispatchEvent(new CustomEvent('ofroot:healthupdate', { detail: { resource, status } }));
    } catch (e) {
      // Non-fatal — diagnostics only
      console.warn('Failed to update health status:', e);
    }
  };

  /* ------------------------------
     Mark mounted (client) — prevents SSR/CSR mismatches
     ------------------------------ */
  useEffect(() => {
    // Set flag that we are now running client-side; used to gate any DOM-only rendering.
    setHasMounted(true);
  }, []);

  /* ------------------------------
     Vanta.js background initialization (client-only)
     - Uses dynamic import for p5 and Vanta topology module.
     - Robust try/catch and cleanup on unmount to avoid leaving canvas listeners behind.
     ------------------------------ */
  useEffect(() => {
    if (!hasMounted) return;

    let cancelled = false;

    const initVanta = async () => {
      updateHealth('vanta', 'loading');

      try {
        // If effect already exists or target ref missing, skip initialization.
        if (vantaEffect.current || !vantaRef.current) return;

        // Dynamic import of p5 (large) and Vanta topology module.
        const p5Module = await import('p5').catch((e) => {
          console.error('Failed to import p5 for Vanta:', e);
          throw e;
        });
        const p5 = (p5Module?.default ?? p5Module) as any;

        const TOPOLOGYModule = await import('vanta/dist/vanta.topology.min').catch((e) => {
          console.error('Failed to import Vanta topology module:', e);
          throw e;
        });
        const TOPOLOGY = (TOPOLOGYModule?.default ?? TOPOLOGYModule) as any;

        if (cancelled) return;

        // Initialize Vanta effect into the target element.
        vantaEffect.current = TOPOLOGY({
          el: vantaRef.current,
          p5,
          mouseControls: true,
          touchControls: true,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: '#20b2aa',
          backgroundColor: '#ffffff',
        });

        updateHealth('vanta', 'ok');
      } catch (err) {
        // If anything fails here, mark health as failed but don't break the entire page.
        console.error('Vanta initialization failed (caught):', err);
        updateHealth('vanta', 'failed');
      }
    };

    initVanta();

    return () => {
      cancelled = true;
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch (err) {
          console.warn('Error while destroying Vanta effect:', err);
        }
        vantaEffect.current = null;
        updateHealth('vanta', 'unknown');
      }
    };
  }, [hasMounted]);

  /* ------------------------------
     Calendly loading & diagnostics (client-only)
     - No global fetch monkeypatching here.
     - Rely on next/script to inject the Calendly bundle.
     - A timeout marks failure if window.Calendly doesn't appear within a reasonable time.
     - Scoped error listeners provide extra diagnostics.
     ------------------------------ */
  useEffect(() => {
    if (!hasMounted) return;

    updateHealth('calendly', 'loading');

    // If Calendly global already present, mark success and skip further setup.
    if ((window as any).Calendly) {
      setCalendlyLoaded(true);
      updateHealth('calendly', 'ok');
      return;
    }

    // Reset to "unknown/loading" while waiting for script to load and initialize.
    setCalendlyLoaded(null);

    // Scoped diagnostics: capture unhandled rejections and errors while Calendly is initializing.
    const onUnhandledRejection = (ev: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', ev.reason);
    };
    const globalErrorHandler = (ev: ErrorEvent) => {
      // If an error message includes 'Failed to fetch', log additional context to help debugging.
      if (ev?.message && ev.message.toLowerCase().includes('failed to fetch')) {
        console.error('Global error detected (Failed to fetch):', ev.message, ev.filename, ev.lineno, ev.colno);
      }
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', globalErrorHandler);

    // Start a timeout that will mark Calendly as failed if it doesn't initialize in time.
    const timeout = setTimeout(() => {
      if (!(window as any).Calendly) {
        setCalendlyLoaded(false);
        updateHealth('calendly', 'failed');
      }
    }, CALENDLY_INIT_TIMEOUT);

    // Cleanup diagnostics on unmount
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', globalErrorHandler);
    };
  }, [hasMounted]);

  /* ------------------------------
     JSON-LD insertion (client-only)
     - We do NOT use next/Script for JSON-LD due to issues seen with some Next/Turbopack versions.
     - Instead we create a <script type="application/ld+json"> element and set textContent to a string.
     - Setting textContent guarantees the browser appends a plain text node (avoids appendChild parsing issues).
     ------------------------------ */
  useEffect(() => {
    if (!hasMounted) return;

    // Prepare the JSON-LD payload and convert to a plain string
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "OfRoot",
      "url": "https://ofroot.technology",
      "contactPoint": [{
        "@type": "ContactPoint",
        "telephone": "+1-614-500-2315",
        "contactType": "Sales",
        "areaServed": "US",
        "availableLanguage": ["English"]
      }]
    });

    // Create <script type="application/ld+json"> and set its textContent to the JSON string
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = jsonLd; // IMPORTANT: plain string
    // add a data attribute so cleanup is straightforward and idempotent
    script.setAttribute('data-ofroot-jsonld', '1');

    const target = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
    try {
      // Append script into head (or fallback to documentElement). This should not fail because textContent is a string.
      target.appendChild(script);
    } catch (err) {
      // If appendChild fails for any reason, log but do not break UX.
      console.error('Failed to append JSON-LD <script> to head:', err);
    }

    // Remove the script on cleanup to avoid duplicates if the component unmounts/mounts again.
    return () => {
      try {
        const existing = document.querySelector('script[data-ofroot-jsonld="1"]');
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
      } catch (err) {
        console.warn('Failed to remove JSON-LD script during cleanup:', err);
      }
    };
  }, [hasMounted]);

  /* ------------------------------
     Helper: detect existing Calendly script tag
     - Prevents duplicate script injections.
     - Only runs client-side (hasMounted guard used where this variable is referenced).
     ------------------------------ */
  const calendlyScriptExists = (() => {
    if (!hasMounted) return false;
    return !!document.querySelector(`script[src="${calendlySrc}"]`);
  })();

  /* ------------------------------
     Render (JSX)
     ------------------------------ */
  return (
    <div className="font-sans">
      {/* Vercel analytics (injects its own script) */}
      <Analytics />

      {/* Accessibility skip link */}
      <a href="#services" className="sr-only">Skip to content</a>

      {/* Hero section with Vanta background */}
      <section style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        <div
          ref={vantaRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
          aria-hidden
        />
        <div style={{ position: "relative", zIndex: 1, height: "100%" }} className="hero-wrapper flex items-center justify-center p-8 sm:p-20">
          <main className="flex flex-col gap-[48px] items-center sm:items-start max-w-5xl">
            <div className="text-center sm:text-left">
              <span className="block text-xl font-semibold uppercase tracking-widest text-gray-500 mb-2 fade-up">
                INNOVATION AT THE ROOT
              </span>

              <h1 className="text-7xl sm:text-[6rem] font-extrabold mb-6 text-black leading-none fade-up delayed">
                OFROOT
              </h1>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-black mb-8 fade-up delayed">
                Innovative Technology Solutions
              </h2>

              <p className="text-xl sm:text-2xl text-black/90 max-w-4xl mb-12 fade-up delayed readable">
                Empowering businesses with cutting-edge technology. From web and app development to automation and AI integrations, we deliver solutions that drive growth and efficiency.
              </p>
            </div>

            <div className="flex gap-6 items-center flex-col sm:flex-row">
              <a
                className="bg-white text-[#20b2aa] hover:bg-gray-100 font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-2xl text-lg fade-up delayed"
                href="#services"
                aria-label="Explore OfRoot services"
              >
                Explore Services
              </a>
              <a
                className="bg-[#20b2aa] text-white hover:bg-[#1a8f85] font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-2xl text-lg fade-up delayed gradient-glow-text"
                href="#contact"
                aria-label="Book a 20 minute scoping call"
                style={{ boxShadow: '0 8px 24px rgba(255,255,255,0.72), 0 6px 18px rgba(32,178,170,0.14)' }}
              >
                Book a 20-min scoping call
              </a>
            </div>
          </main>
        </div>
      </section>

      {/* Content area */}
      <div className="content-area relative">
        <div className="floating-circles" aria-hidden="true">
          <span className="c1" />
          <span className="c2" />
          <span className="c3" />
          <span className="c4" />
          <span className="c5" />
          <span className="c6" />
          <span className="c7" />
          <span className="c8" />
        </div>

        {/* Services section */}
        <section id="services" className="py-20 px-8 sm:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 max-w-4xl mx-auto">
              <span className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 text-center">
                WHAT WE DO
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-gray-800 text-center">
                Our Core Services
              </h2>
              <p className="text-lg text-gray-600 text-center readable max-w-3xl mx-auto">
                Focused expertise to accelerate product development, automate operations, and integrate intelligent systems — with pragmatic roadmaps and measurable outcomes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-stretch">
              <div className="rounded-lg p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-[#20b2aa] rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-2xl">⚙️</span>
                </div>
                <h3 className="font-bold text-2xl mb-2">Automation</h3>
                <p className="text-gray-600">Automate workflows, orchestration, and business processes to reduce manual work and increase reliability.</p>
              </div>

              <div className="rounded-lg p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-[#20b2aa] rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-2xl">🌐</span>
                </div>
                <h3 className="font-bold text-2xl mb-2">Website & App Development</h3>
                <p className="text-gray-600">Full-stack web and mobile development — prototypes, SaaS platforms, migrations, and performance-driven product engineering.</p>
              </div>

              <div className="rounded-lg p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1 flex flex-col items-start text-left">
                <div className="w-12 h-12 bg-[#20b2aa] rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-2xl">🤖</span>
                </div>
                <h3 className="font-bold text-2xl mb-2">AI Development & Integrations</h3>
                <p className="text-gray-600">
                  Custom AI models, LLM integrations, and automation of knowledge work to enhance decision-making and customer experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured / How / Proof sections (kept as in your original) */}
        <section id="featured" className="py-20 px-8 sm:px-20">
          {/* (content unchanged) */}
        </section>

        <section id="how" className="py-16 px-8 sm:px-20">
          {/* (content unchanged) */}
        </section>

        <section id="proof" className="py-20 px-8 sm:px-20 bg-gradient-to-r from-[#20b2aa]/10 to-[#007bff]/10">
          {/* (content unchanged) */}
        </section>

        {/* Contact / Calendly area */}
        <section id="contact" className="py-20 px-8 sm:px-20 bg-gradient-to-r from-[#20b2aa]/10 to-[#007bff]/10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <span className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 text-center">
                GET STARTED
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-gray-800">
                Book a 20-min scoping call
              </h2>
            </div>

            <p className="text-lg text-gray-600 mb-12 readable">
              Ready to explore a scoped plan or quick win? Book a short call and we'll prepare a brief agenda to make the most of our time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="p-6 rounded-lg shadow-lg border border-gray-200">
                <h3 className="font-semibold text-xl mb-4 text-[#20b2aa]">Contact Information</h3>
                <div className="space-y-3 text-left">
                  <p className="flex items-center">
                    <span className="text-[#20b2aa] mr-3">📧</span>
                    <span>dimitri.mcdaniel@gmail.com</span>
                  </p>
                  <p className="flex items-center">
                    <span className="text-[#20b2aa] mr-3">📞</span>
                    <span>+1 (614) 500-2315</span>
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-lg shadow-lg border border-gray-200">
                <h3 className="font-semibold text-xl mb-4 text-[#20b2aa]">Schedule a Call</h3>
                <p className="text-sm text-gray-600 mb-3">Use the scheduler below to book a 20-minute scoping call. The Calendly widget loads client-side.</p>

                {/* Calendly Script injection (only when client-side and no duplicate script exists) */}
                {hasMounted && !calendlyScriptExists && (
                  <Script
                    id="calendly-widget-script"
                    src={calendlySrc}
                    strategy="lazyOnload"
                    onLoad={() => {
                      // When script loads, set state based on presence of window.Calendly
                      setCalendlyLoaded(!!(window as any).Calendly);
                      updateHealth('calendly', 'ok');
                      console.log('Calendly script loaded via Next Script');
                    }}
                    onError={(e) => {
                      setCalendlyLoaded(false);
                      updateHealth('calendly', 'failed');
                      console.error('Calendly script failed to load via Next Script', e);
                    }}
                  />
                )}

                {/* Inline widget container (Calendly looks for the .calendly-inline-widget element) */}
                {hasMounted && (
                  <div
                    ref={calendlyRef}
                    className="calendly-inline-widget"
                    data-url="https://calendly.com/dimitri-mcdaniel-9oh/new-meeting"
                    style={{ minWidth: '320px', height: '640px' }}
                    aria-label="Calendly booking widget"
                  />
                )}

                {/* Show fallback UI for failure states (client-only to avoid hydration mismatches) */}
                {hasMounted && calendlyLoaded === false && (
                  <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200 text-center">
                    <p className="text-red-700 mb-2">Unable to load the inline scheduler right now.</p>
                    <a href="https://calendly.com/dimitri-mcdaniel-9oh/new-meeting" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#20b2aa] text-white py-2 px-4 rounded-md font-semibold hover:bg-[#1a8f85] transition">Open scheduler in a new tab</a>
                  </div>
                )}

                {hasMounted && calendlyLoaded === null && (
                  <div className="mt-4 text-sm text-gray-500">Loading scheduler… If this takes a while, you can open it in a new tab.</div>
                )}

                {/* noscript fallback for users with JS disabled */}
                <noscript>
                  <div className="mt-3">
                    <a href="https://calendly.com/dimitri-mcdaniel-9oh/new-meeting" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#20b2aa] text-white py-3 px-6 rounded-md font-semibold hover:bg-[#1a8f85] transition">Open scheduler in new tab</a>
                  </div>
                </noscript>
              </div>
            </div>

            <p className="text-sm text-gray-500">We'll respond within 1-2 business days. Looking forward to connecting!</p>
          </div>
        </section>

        <Footer />

        <style jsx>{`
          .gradient-glow-text {
            text-shadow:
              0 0 8px #20b2aa,
              0 0 16px #1a8f85,
              0 0 24px #ffe082;
          }
        `}</style>
      </div>
    </div>
  );
}
