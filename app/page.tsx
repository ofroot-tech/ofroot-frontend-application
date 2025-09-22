'use client';
import Image from "next/image";
import Script from 'next/script';
import { useEffect, useRef, useState } from "react";
import Footer from "./components/Footer";

export default function Home() {
  const vantaRef = useRef(null);
  const vantaEffect = useRef<any>(null);
  const calendlyRef = useRef<HTMLDivElement | null>(null);
  const [calendlyLoaded, setCalendlyLoaded] = useState<boolean | null>(null); // null = unknown, true = loaded, false = failed

  // Small helper to broadcast resource health to the rest of the app (Footer listens)
  const updateHealth = (resource: string, status: 'ok' | 'failed' | 'loading' | 'unknown') => {
    try {
      (window as any).__OFROOT_HEALTH = (window as any).__OFROOT_HEALTH || {};
      (window as any).__OFROOT_HEALTH[resource] = status;
      window.dispatchEvent(new CustomEvent('ofroot:healthupdate', { detail: { resource, status } }));
    } catch (e) {
      console.warn('Failed to update health status:', e);
    }
  };

  useEffect(() => {
    const initVanta = async () => {
      updateHealth('vanta', 'loading');
      try {
        if (!vantaEffect.current && vantaRef.current) {
          // Dynamic imports can fail if the bundle isn't reachable — guard and log errors
          const p5Module = await import('p5').catch((e) => {
            console.error('Failed to import p5 for Vanta:', e);
            throw e;
          });
          const p5 = p5Module?.default ?? p5Module;

          const TOPOLOGYModule = await import('vanta/dist/vanta.topology.min').catch((e) => {
            console.error('Failed to import Vanta topology module:', e);
            throw e;
          });
          const TOPOLOGY = TOPOLOGYModule?.default ?? TOPOLOGYModule;

          // If imports succeeded, initialize Vanta
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

          // signal success
          updateHealth('vanta', 'ok');
        }
      } catch (err) {
        // Friendly, consistent logging to help identify fetch/import failures
        console.error('Vanta initialization failed (caught):', err);
        updateHealth('vanta', 'failed');
      }
    };
    initVanta();

    return () => {
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
  }, []);

  // Calendly script URL (will be loaded with Next's <Script> component)
  const calendlySrc = 'https://assets.calendly.com/assets/external/widget.js';

  // Load Calendly widget client-side and keep diagnostic fetch-wrapper/listeners in place.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    updateHealth('calendly', 'loading');

    // If script already present and Calendly global available, mark as loaded
    if (document.querySelector(`script[src="${calendlySrc}"]`) && (window as any).Calendly) {
      setCalendlyLoaded(true);
      updateHealth('calendly', 'ok');
      return;
    }

    // Otherwise rely on Next <Script> to load the bundle; set state to unknown while it loads
    setCalendlyLoaded(null);

    // Enhanced diagnostics: wrapper for fetch to log failed responses and errors
    const originalFetch = window.fetch.bind(window);
    (window as any).fetch = async (...args: any[]) => {
      try {
        const res = await originalFetch.apply(window, args as any);
        if (!res.ok) {
          try { console.error('Fetch returned non-OK status:', res.status, res.statusText, args[0]); } catch (e) { /* ignore */ }
        }
        return res;
      } catch (err) {
        console.error('Fetch error for', args[0], err);
        throw err;
      }
    };

    const onUnhandledRejection = (ev: PromiseRejectionEvent) => { console.error('Unhandled promise rejection:', ev.reason); };
    const globalErrorHandler = (ev: ErrorEvent) => {
      if (ev?.message && ev.message.toLowerCase().includes('failed to fetch')) {
        console.error('Global error detected (Failed to fetch):', ev.message, ev.filename, ev.lineno, ev.colno);
      }
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', globalErrorHandler);

    return () => {
      try { (window as any).fetch = originalFetch; } catch (e) { /* ignore */ }
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', globalErrorHandler);
    };
  }, []);

  return (
    <div className="font-sans">
      {/* Skip link for keyboard users */}
      <a href="#services" className="sr-only">Skip to content</a>
      {/* Hero Section with Vanta Background */}
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
        />
        <div style={{ position: "relative", zIndex: 1, height: "100%" }} className="hero-wrapper flex items-center justify-center p-8 sm:p-20">
          <main className="flex flex-col gap-[48px] items-center sm:items-start max-w-5xl">
            <div className="text-center sm:text-left">
              <h1 className="text-6xl sm:text-8xl font-bold mb-6 text-black fade-up">
                OFROOT
              </h1>
              <h2 className="text-3xl sm:text-5xl font-semibold text-black mb-8 fade-up delayed">
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

      {/* Floating circles background for area beneath the hero */}
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
 
      {/* Services Section - core offerings only */}
      <section id="services" className="py-16 px-8 sm:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-800">
            Our Core Services
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto readable">
            Focused expertise to accelerate product development, automate operations, and integrate intelligent systems — with pragmatic roadmaps and measurable outcomes.
          </p>

          {/*  
              CORE SERVICES GRID
              The next three divs within this section that hold content are the core services currently offered: automation, website and app development, and AI development and integrations.
              Each div has an icon, title, and description.
              The grid layout is responsive:
              - On large screens (lg:), it shows three columns.
              - On medium screens (md:), it shows two columns.
              - On small screens, it shows one column.
              The AI service card is centered under the two above on md screens.
          */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            <div className="rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-[#20b2aa] rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl">⚙️</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Automation</h3>
              <p className="text-gray-600 text-sm">Automate workflows, orchestration, and business processes to reduce manual work and increase reliability.</p>
            </div>

            <div className="rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-[#20b2aa] rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🌐</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Website & App Development</h3>
              <p className="text-gray-600 text-sm">Full-stack web and mobile development — prototypes, SaaS platforms, migrations, and performance-driven product engineering.</p>
            </div>

            {/* Centered on md screens */}
            <div className="rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 md:col-span-2 md:col-start-1 lg:col-span-1 lg:col-start-auto">
              <div className="w-12 h-12 bg-[#20b2aa] rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Development & Integrations</h3>
              <p className="text-gray-600 text-sm">
                Custom AI models, LLM integrations, and automation of knowledge work to enhance decision-making and customer experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product */}
      {/* 
          The grid layout of this section will be two per row on large screens and stacked within one column on small medium screens
      */}
      <section id="featured" className="py-16 px-8 sm:px-20">
        <div className="max-w-6xl mx-auto">

          {/* Heading at top of section */}
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-800">
            Featured Products
          </h2>

          {/* Cards: 1 column on sm/md, 2 columns on lg+ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Helpr Product Card */}
            <div className="p-8 rounded-lg shadow-lg border flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#20b2aa] rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-3xl" aria-hidden>🛠️</span>
              </div>

              <h3 className="text-2xl font-bold mb-2">Helpr</h3>

              <p className="text-gray-700 mb-4 readable">
                Helpr is our vertical SaaS for home service businesses — scheduling, invoicing, and crew management built with reliability and speed in mind.
              </p>
              <p className="text-gray-600 mb-4 readable">
                It operates as a separate brand and product, preserving OfRoot’s focus on technology and enterprise work.
              </p>
              <p className="text-gray-600 mb-4 readable">
                Two distinct paths:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 text-left mx-auto max-w-md">
                <li>• <strong>Customers</strong>: book services quickly and seamlessly.</li>
                <li>• <strong>Providers</strong>: manage work, dispatch teams, and handle payments with ease.</li>
              </ul>
              <p className="text-gray-600 mt-4 readable">
                We support multi-tenant SaaS models and deep marketplace integrations.
              </p>

              <a
                href="https://form.jotform.com/252643454932157"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block bg-[#20b2aa] text-white py-2 px-5 rounded-md font-semibold hover:bg-[#1a8f85] transition"
                aria-label="Explore Helpr"
              >
                Explore Helpr
              </a>
            </div>

            {/* OnTask Product Card */}
            <div className="p-8 rounded-lg shadow-lg border flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#20b2aa] rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-3xl" aria-hidden>🏗️</span>
              </div>

              <h3 className="text-2xl font-bold mb-2">OnTask</h3>

              <p className="text-gray-700 mb-4 readable">
                A BluePro-style toolkit for home service companies. Everything needed to run daily operations.
              </p>

              <ul className="text-sm text-gray-600 mt-2 space-y-1 text-left mx-auto max-w-md">
                <li>• Blog (built-in)</li>
                <li>• Branding help</li>
                <li>• Clothing & uniforms</li>
                <li>• LLC formation</li>
                <li>• Landing page (SEO-optimized)</li>
                <li>• Operations tooling (CRM, invoicing, scheduling)</li>
              </ul>
              <div className="mt-26" />
              <a
                href="https://form.jotform.com/252643454932157"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block bg-[#20b2aa] text-white py-2 px-5 rounded-md font-semibold hover:bg-[#1a8f85] transition"
                aria-label="Explore OnTask"
              >
                Explore OnTask
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* How We Work */}
      <section id="how" className="py-16 px-8 sm:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">How We Work</h2>
          <p className="text-gray-600 mb-8 readable">Transparent, outcome-driven engagement: quick discovery, fast prototyping, and iterative delivery with measurable milestones and clear pricing.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg shadow border border-gray-200">
              <h4 className="font-semibold mb-2">Discovery</h4>
              <p className="text-sm text-gray-600">Focused workshops to capture goals, constraints, and success metrics.</p>
            </div>
            <div className="p-6 rounded-lg shadow border border-gray-200">
              <h4 className="font-semibold mb-2">Quick Win</h4>
              <p className="text-sm text-gray-600">Deliver a fast, high-impact prototype or automation to prove value early.</p>
            </div>
            <div className="p-6 rounded-lg shadow border border-gray-200">
              <h4 className="font-semibold mb-2">Iterate</h4>
              <p className="text-sm text-gray-600">Continuous improvement guided by metrics and user feedback.</p>
            </div>
          </div>

          <p className="text-gray-600 mt-6">We publish clear, scoped estimates for outcomes — hourly or fixed-price for well-defined work — and favor transparent engagement models.</p>
        </div>
      </section>

      {/* Proof Section */}
      <section id="proof" className="py-16 px-8 sm:px-20 bg-gradient-to-r from-[#20b2aa]/10 to-[#007bff]/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-gray-800">Proof & Trust</h2>
          <p className="text-center text-gray-600 mb-8 readable">Trusted by teams of all sizes — results, security, and compliance you can count on.</p>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="p-6 rounded-lg shadow flex-1 text-center border border-gray-200">
              <p className="font-semibold mb-2">Testimonials</p>
              <blockquote className="text-sm text-gray-600">“OfRoot helped us launch a new booking flow in weeks, not months — the impact was immediate.” — Operations Lead</blockquote>
            </div>
            <div className="p-6 rounded-lg shadow flex-1 text-center border border-gray-200">
              <p className="font-semibold mb-2">Security & Compliance</p>
              <p className="text-sm text-gray-600">SOC2 readiness, secure data handling, and regular audits for enterprise engagements.</p>
            </div>
          </div>
          <div className="text-center">
            <a
              href="#contact"
              className="inline-block bg-[#20b2aa] text-white py-3 px-6 rounded-md font-semibold hover:bg-[#1a8f85] transition"
              style={{ boxShadow: '0 8px 20px rgba(255,255,255,0.68), 0 4px 12px rgba(32,178,170,0.12)' }}
            >
              Book a 20-min scoping call
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-8 sm:px-20 bg-gradient-to-r from-[#20b2aa]/10 to-[#007bff]/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-800">
            Book a 20-min scoping call
          </h2>
          <p className="text-lg text-gray-600 mb-8 readable">
            Ready to explore a scoped plan or quick win? Book a short call and we'll prepare a brief agenda to make the most of our time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 text-[#20b2aa]">Contact Information</h3>
              <div className="space-y-3 text-left">
                <p className="flex items-center">
                  <span className="text-[#20b2aa] mr-3">📧</span>
                  <span>dimitri.mcdaniel@gmail.com</span>
                </p>
                <p className="flex items-center">
                  <span className="text-[#20b2aa] mr-3">📞</span>
                  <span>+1 (614) 500-2315</span>
                </p>
                <p className="flex items-center">
                  <span className="text-[#20b2aa] mr-3">📍</span>
                  <span>500 West Broad Street, Columbus, OH</span>
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 text-[#20b2aa]">Schedule a Call</h3>
              <p className="text-sm text-gray-600 mb-3">Use the scheduler below to book a 20-minute scoping call. The Calendly widget loads client-side.</p>

              {/* Calendly inline widget container - loaded via Next.js Script */}
              <Script
                src={calendlySrc}
                strategy="lazyOnload"
                onLoad={() => { setCalendlyLoaded(true); updateHealth('calendly', 'ok'); console.log('Calendly script loaded via Next Script'); }}
                onError={(e) => { setCalendlyLoaded(false); updateHealth('calendly', 'failed'); console.error('Calendly script failed to load via Next Script', e); }}
              />
              <div ref={calendlyRef} className="calendly-inline-widget" data-url="https://calendly.com/dimitri-mcdaniel-9oh/new-meeting" style={{ minWidth: '320px', height: '640px' }} aria-label="Calendly booking widget" />

              {/* Visible fallback for when Calendly fails to load (or after timeout) */}
              {calendlyLoaded === false && (
                <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200 text-center">
                  <p className="text-red-700 mb-2">Unable to load the inline scheduler right now.</p>
                  <a href="https://calendly.com/dimitri-mcdaniel-9oh/new-meeting" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#20b2aa] text-white py-2 px-4 rounded-md font-semibold hover:bg-[#1a8f85] transition">Open scheduler in a new tab</a>
                </div>
              )}

              {/* If unknown after some time, show an alternative CTA but keep widget area available */}
              {calendlyLoaded === null && (
                <div className="mt-4 text-sm text-gray-500">Loading scheduler… If this takes a while, you can open it in a new tab.</div>
              )}

              {/* Fallback link for users with scripts disabled or for SEO crawlability */}
              <noscript>
                <div className="mt-3">
                  <a href="https://calendly.com/dimitri-mcdaniel-9oh/new-meeting" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#20b2aa] text-white py-3 px-6 rounded-md font-semibold hover:bg-[#1a8f85] transition">Open scheduler in new tab</a>
                </div>
              </noscript>

              {/* JSON-LD structured data for Organization and contactPoint (helps SEO & rich results) */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  "name": "OfRoot",
                  "url": "https://ofroot.com",
                  "contactPoint": [{
                    "@type": "ContactPoint",
                    "telephone": "+1-614-500-2315",
                    "contactType": "Sales",
                    "areaServed": "US",
                    "availableLanguage": ["English"]
                  }]
                }) }}
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-500">We'll respond within 1-2 business days. Looking forward to connecting!</p>
        </div>
      </section>

      {/* Footer Section */}
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
