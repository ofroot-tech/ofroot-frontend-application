'use client'; 
import Image from "next/image";
import { useEffect, useRef } from "react";
import Footer from "./components/Footer";

export default function Home() {
  const vantaRef = useRef(null);
  const vantaEffect = useRef<any>(null);
  const calendlyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initVanta = async () => {
      if (!vantaEffect.current && vantaRef.current) {
        const p5 = (await import('p5')).default;
        const TOPOLOGY = (await import('vanta/dist/vanta.topology.min')).default;
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
      }
    };
    initVanta();

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  // Load Calendly widget script client-side for the inline embed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const src = 'https://assets.calendly.com/assets/external/widget.js';
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      document.body.appendChild(s);
    }
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
        <div style={{ position: "relative", zIndex: 1, height: "100%" }} className="flex items-center justify-center p-8 sm:p-20">
          <main className="flex flex-col gap-[48px] items-center sm:items-start max-w-5xl">
            <div className="text-center sm:text-left">
              <h1 className="text-6xl sm:text-8xl font-bold mb-6 text-black">
                OFROOT
              </h1>
              <h2 className="text-3xl sm:text-5xl font-semibold text-black mb-8">
                 Innovative Technology Solutions
               </h2>
              <p className="text-xl sm:text-2xl text-black/90 max-w-4xl mb-12">
                 Empowering businesses with cutting-edge technology. From web and app development to automation and AI integrations, we deliver solutions that drive growth and efficiency.
               </p>
            </div>
            
            <div className="flex gap-6 items-center flex-col sm:flex-row">
              <a
                className="bg-white text-[#20b2aa] hover:bg-gray-100 font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-2xl text-lg"
                href="#services"
                aria-label="Explore OfRoot services"
              >
                Explore Services
              </a>
              <a
                className="bg-[#20b2aa] text-white hover:bg-[#1a8f85] font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-2xl text-lg"
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

      {/* Services Section - core offerings only */}
      <section id="services" className="py-16 px-8 sm:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-800">
            Our Core Services
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Focused expertise to accelerate product development, automate operations, and integrate intelligent systems — with pragmatic roadmaps and measurable outcomes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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

            <div className="rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-[#20b2aa] rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Development & Integrations</h3>
              <p className="text-gray-600 text-sm">Custom AI models, LLM integrations, and automation of knowledge work to enhance decision-making and customer experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product */}
      <section id="featured" className="py-16 px-8 sm:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2 p-8 rounded-lg shadow-lg border">
            <h3 className="text-2xl font-bold mb-2">Featured Product — Helpr</h3>
            <p className="text-gray-700 mb-4">Helpr is our vertical product for home service businesses — scheduling, invoicing, and crew management built with reliability and speed in mind. Built as a separate brand and product to preserve OfRoot's focus on technology and enterprise work.</p>
            <p className="text-gray-600 mb-6">Two distinct paths: customers book services quickly; providers manage work, dispatch, and payments. We support multi-tenant SaaS models and deep marketplace integrations.</p>
            <a href="https://Helpr.app" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#20b2aa] text-white py-3 px-6 rounded-md font-semibold hover:bg-[#1a8f85] transition">Visit Helpr</a>
          </div>

          <div className="p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-[#20b2aa] rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-3xl">📝</span>
            </div>
            <h4 className="font-semibold">Everything Home (Collaboration)</h4>
            <p className="text-gray-600 text-sm text-center mt-3">A collaborative venture for connecting customers and local home-service providers: streamlined booking, verified providers, and transparent pricing.</p>
            <ul className="text-sm text-gray-600 mt-3 space-y-1 text-left">
              <li>• Customer path: discover → compare → book</li>
              <li>• Provider path: claim jobs → manage crew → accept payments</li>
              <li>• Unique value: combined marketplace + operational tools</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="py-16 px-8 sm:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-800">Case Studies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-lg p-6 shadow-lg border border-gray-200">
              <h3 className="font-semibold text-xl mb-2">MetroAreaRemovalServices.com</h3>
              <p className="text-gray-600 text-sm mb-4">End-to-end platform rebuild and automation for a regional removal & hauling company.</p>
              <ul className="text-gray-700 text-sm space-y-2">
                <li>• Leads increased by 120% in 6 months</li>
                <li>• Online bookings grew 3x after redesign</li>
                <li>• Average job fulfillment time reduced by 40%</li>
                <li>• Revenue uplift: +28% YoY attributable to improved UX and automation</li>
              </ul>
            </div>

            <div className="rounded-lg p-6 shadow-lg border border-gray-200">
              <h3 className="font-semibold text-xl mb-2">Quick Win: Payment Flow Optimization</h3>
              <p className="text-gray-600 text-sm mb-4">Implemented an optimized payment flow and retry logic for a subscription product.</p>
              <ul className="text-gray-700 text-sm space-y-2">
                <li>• Churn reduced by 15% within 2 months</li>
                <li>• Payment success rate improved from 82% → 95%</li>
                <li>• Reduced support tickets related to billing by 60%</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section id="how" className="py-16 px-8 sm:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">How We Work</h2>
          <p className="text-gray-600 mb-8">Transparent, outcome-driven engagement: quick discovery, fast prototyping, and iterative delivery with measurable milestones and clear pricing.</p>

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
          <p className="text-center text-gray-600 mb-8">Trusted by teams of all sizes — results, security, and compliance you can count on.</p>
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
          <p className="text-lg text-gray-600 mb-8">
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

              {/* Calendly inline widget container - Calendly script will upgrade this div to the embedded widget */}
              <div ref={calendlyRef} className="calendly-inline-widget" data-url="https://calendly.com/dimitri-mcdaniel-9oh/new-meeting" style={{ minWidth: '320px', height: '640px' }} aria-label="Calendly booking widget" />

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
    </div>
  );
}
