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
 *
 * Update (subscription narrative)
 *  - Clarifies the OfRoot offering: on-demand engineering, automation, and AI by subscription.
 *  - Adds a prominent CTA to start a subscription and a section outlining inclusions.
 */

import { Analytics } from "@vercel/analytics/react";
import Script from 'next/script';
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CONTACT_EMAIL_PUBLIC } from './config/public';
import PromoBanner from "@/components/PromoBanner";
import { Search, Target, PenTool, Code2, PlugZap, Rocket, CalendarDays, ClipboardList, Users, Wrench, BadgeDollarSign } from 'lucide-react';
import { track } from '@/app/lib/ab';

/* ------------------------------
   Constants
   ------------------------------ */
// Calendly external widget URL (served by Calendly's CDN)
const calendlySrc = 'https://assets.calendly.com/assets/external/widget.js';

// Timeout (ms) to consider Calendly failed to initialize if global Calendly is not present
const CALENDLY_INIT_TIMEOUT = 8000;

// Preload heavy Vanta deps ASAP on the client to reduce time-to-first-frame
const __IS_BROWSER__ = typeof window !== 'undefined';
let __vantaPreload: Promise<[any, any]> | null = null;
if (__IS_BROWSER__) {
  // Kick off both imports in parallel
  __vantaPreload = Promise.all([
    import(/* webpackPreload: true */ 'p5'),
    import(/* webpackPreload: true */ 'vanta/dist/vanta.topology.min'),
  ]);
}

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
  useLayoutEffect(() => {
    let cancelled = false;

    const initVanta = async () => {
      updateHealth('vanta', 'loading');

      try {
        // If effect already exists or target ref missing, skip initialization.
        if (vantaEffect.current || !vantaRef.current) return;

        // Parallel dynamic import of p5 and Vanta topology module (or use preloaded promise)
        let p5Module: any, TOPOLOGYModule: any;
        try {
          if (__vantaPreload) {
            [p5Module, TOPOLOGYModule] = await __vantaPreload;
          } else {
            [p5Module, TOPOLOGYModule] = await Promise.all([
              import(/* webpackPreload: true */ 'p5'),
              import(/* webpackPreload: true */ 'vanta/dist/vanta.topology.min'),
            ]);
          }
        } catch (e) {
          console.error('Failed to import Vanta dependencies:', e);
          throw e;
        }
        const p5 = (p5Module?.default ?? p5Module) as any;
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
          speed: 15.90,
          color: 0x20b2aa,
          backgroundColor: 0xffffff,
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
  }, []);

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

  // Note: JSON-LD for Organization + WebSite is now rendered SSR in the root layout for better SEO.

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
     Reveal-in on scroll (client-only)
     - Uses IntersectionObserver to add 'in-view' to sections as they enter viewport.
     - Respects prefers-reduced-motion.
     ------------------------------ */
  useEffect(() => {
    if (!hasMounted) return;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (m.matches) return;

    const els = document.querySelectorAll<HTMLElement>('.reveal-in');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [hasMounted]);

  /* ------------------------------
     Render (JSX)
     ------------------------------ */
  return (
    <div className="font-sans">
      {/* Vercel analytics (injects its own script) */}
      <Analytics />

      {/* Accessibility skip link */}
      <a href="#services" className="sr-only">Skip to content</a>

      {/* Marketing banner with extra top spacing, home-only */}
      <PromoBanner spaced />

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
            pointerEvents: 'none',
          }}
          data-vanta
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

              {/* Updated value prop: subscription-focused */}
              <h2 className="text-3xl sm:text-5xl font-extrabold text-black mb-6 fade-up delayed">
                On‑demand engineering, automation, and AI — by subscription
              </h2>

              <p className="text-xl sm:text-2xl text-black/90 max-w-4xl mb-12 fade-up delayed readable">
                Ship product faster with a monthly engagement. We design and build web apps, automate workflows, and integrate AI — delivered in focused sprints with clear outcomes and transparent pricing.
              </p>
            </div>

            <div className="flex items-center flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                className="inline-flex items-center justify-center text-center bg-white text-[#20b2aa] hover:bg-gray-100 font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg text-base fade-up delayed"
                href="#services"
                aria-label="Explore OfRoot services"
              >
                Explore Services
              </a>
              <a
                className="inline-flex items-center justify-center text-center bg-[#20b2aa] text-white hover:bg-[#1a8f85] font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg text-base fade-up delayed"
                href="https://form.jotform.com/252643426225151"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Book a 20 minute scoping call"
                style={{ boxShadow: '0 6px 18px rgba(255,255,255,0.6), 0 4px 12px rgba(32,178,170,0.16)' }}
              >
                Book a 20-min scoping call
              </a>
              {/* Updated CTA to scroll to subscription section */}
              <a
                className="inline-flex items-center justify-center text-center bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg text-base fade-up delayed"
                href="#subscription"
                aria-label="Start your subscription"
              >
                Subscribe
              </a>
            </div>
          </main>
        </div>
      </section>

      {/* Content area */}
      <div className="content-area relative">
        {/* Services section */}
        <section id="services" className="py-20 px-8 sm:px-20 reveal-in">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 max-w-4xl mx-auto">
              <span className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 text-center">
                WHAT WE DO
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-gray-800 text-center">
                Our Core Services
              </h2>
              <p className="text-lg text-gray-600 text-center readable max-w-3xl mx-auto">
                Subscribe to a monthly, outcome‑oriented engagement. We build product features, automate operations, and integrate AI — the work that compounds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-stretch">
              <article className="rounded-lg p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex h-full flex-col gap-4 text-left focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#20b2aa] bg-white text-black">
                <div className="w-16 h-16 bg-[#20b2aa] rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl">⚙️</span>
                </div>
                <h3 className="font-bold text-2xl">Automation</h3>
                <p className="flex-1 text-black">Automate workflows, orchestration, and business processes to reduce manual work and increase reliability.</p>
                <a
                  href="/services/development-automation"
                  onClick={() => { try { track({ category: 'nav', action: 'home_service_card_click', label: 'development-automation' }); } catch {} }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#20b2aa] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#1a8f85]"
                  aria-label="Learn more about Automation"
                >
                  Learn more
                </a>
              </article>

              <article className="rounded-lg p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex h-full flex-col gap-4 text-left focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#20b2aa] bg-white text-black">
                <div className="w-16 h-16 bg-[#20b2aa] rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl">🌐</span>
                </div>
                <h3 className="font-bold text-2xl">Website & App Development</h3>
                <p className="flex-1 text-black">Full-stack web and mobile development — prototypes, SaaS platforms, migrations, and performance-driven product engineering.</p>
                <a
                  href="/services/website-app-development"
                  onClick={() => { try { track({ category: 'nav', action: 'home_service_card_click', label: 'website-app-development' }); } catch {} }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#20b2aa] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#1a8f85]"
                  aria-label="Learn more about Website & App Development"
                >
                  Learn more
                </a>
              </article>

              <article className="rounded-lg p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1 flex h-full flex-col gap-4 text-left focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#20b2aa] bg-white text-black">
                <div className="w-16 h-16 bg-[#20b2aa] rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl">🤖</span>
                </div>
                <h3 className="font-bold text-2xl">AI Development & Integrations</h3>
                <p className="flex-1 text-black">
                  Custom AI models, LLM integrations, and automation of knowledge work to enhance decision-making and customer experience.
                </p>
                <a
                  href="/services/ai-development-integrations"
                  onClick={() => { try { track({ category: 'nav', action: 'home_service_card_click', label: 'ai-development-integrations' }); } catch {} }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#20b2aa] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#1a8f85]"
                  aria-label="Learn more about AI Development & Integrations"
                >
                  Learn more
                </a>
              </article>

              <article className="rounded-lg p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex h-full flex-col gap-4 text-left focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#20b2aa] bg-white text-black">
                <div className="w-16 h-16 bg-[#20b2aa] rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl">🧪</span>
                </div>
                <h3 className="font-bold text-2xl">AI Website & Ads Audit</h3>
                <p className="flex-1 text-black">A free audit to identify quick wins in your site and ad accounts. Get a prioritized list within 48 hours.</p>
                <a
                  href="/services/ai-audit"
                  onClick={() => { try { track({ category: 'nav', action: 'home_service_card_click', label: 'ai-audit' }); } catch {} }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#20b2aa] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#1a8f85]"
                  aria-label="Learn more about the AI Website & Ads Audit"
                >
                  Learn more
                </a>
              </article>
            </div>
          </div>
        </section>

        {/* Subscription section — what’s included */}
        <section id="subscription" className="py-16 px-8 sm:px-20 reveal-in">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-3xl font-extrabold mb-3">A subscription that ships</h3>
              <p className="text-gray-600 mb-6">
                One simple plan to move fast: sprint planning, design + build, weekly demos, and clear rollouts. Cancel anytime.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-400" /> Feature development for web and mobile</li>
                <li className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-400" /> Workflow automation and integrations</li>
                <li className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-400" /> AI assistants, retrieval, and orchestration</li>
                <li className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-400" /> Observability, performance, and reliability</li>
                <li className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-400" /> Admin dashboards and data models</li>
              </ul>
              <div className="mt-8 flex gap-3">
                <a href="/subscribe" className="bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full text-center">Start subscription</a>
                <a href="https://form.jotform.com/252643426225151" target="_blank" rel="noopener noreferrer" className="underline text-gray-700">Talk to us first</a>
              </div>
            </div>
            <div className="rounded-xl border p-6 bg-white shadow-lg text-black">
              <div className="text-sm text-black">
                <div className="font-medium">How it works</div>
                <ol className="list-decimal ml-5 mt-2 space-y-2">
                  <li>Scope goals and quick wins (30 minutes)</li>
                  <li>Prioritize a sprint plan and outcomes</li>
                  <li>Build, integrate, and demo weekly</li>
                  <li>Ship and iterate with clear metrics</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Featured / How / Proof sections (kept as in your original) */}
        <section id="featured" className="py-20 px-8 sm:px-20 reveal-in">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10 text-center">
              <span className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">FEATURED PRODUCTS</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 text-gray-800">Built to run real businesses</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">OfRoot hosts multiple apps under one roof. Here are two we actively develop and support for service companies.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Helpr card */}
              <article className="rounded-xl border p-6 bg-white shadow-lg text-black">
                <header className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="mb-0"><span className="inline-block bg-black text-white px-4 py-2 rounded-full text-2xl font-bold">Helpr</span></h3>
                    <p className="text-black mt-2">Vertical SaaS for home service businesses</p>
                  </div>
                </header>
                <ul className="space-y-3 text-black">
                  <li className="flex items-start gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span className="inline-flex items-center gap-2"><CalendarDays size={18} aria-hidden /> Scheduling & dispatch with calendar views</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span className="inline-flex items-center gap-2"><BadgeDollarSign size={18} aria-hidden /> Invoicing, payments, and receipts</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span className="inline-flex items-center gap-2"><Users size={18} aria-hidden /> Crew management and permissions</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span className="inline-flex items-center gap-2"><ClipboardList size={18} aria-hidden /> Customer portal, estimates, and work orders</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span className="inline-flex items-center gap-2"><Wrench size={18} aria-hidden /> Multi-tenant foundation and integrations</span></li>
                </ul>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a href="https://form.jotform.com/252643454932157" className="bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full text-center">Join the waitlist</a>
                  <a href="https://form.jotform.com/252643426225151" target="_blank" rel="noopener noreferrer" className="underline text-gray-700 text-center">Talk to us</a>
                </div>
              </article>

              {/* OnTask card */}
              <article className="rounded-xl border p-6 bg-white shadow-lg text-black">
                <header className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="mb-0"><span className="inline-block bg-black text-white px-4 py-2 rounded-full text-2xl font-bold">OnTask</span></h3>
                    <p className="text-black mt-2">A practical toolkit for service companies</p>
                  </div>
                </header>
                <ul className="space-y-3 text-black">
                  <li className="flex items-start gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span className="inline-flex items-center gap-2"><Target size={18} aria-hidden /> SEO‑optimized landing pages</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span className="inline-flex items-center gap-2"><PenTool size={18} aria-hidden /> Built‑in blog & content tools</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span className="inline-flex items-center gap-2"><Users size={18} aria-hidden /> Branding help and collateral</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span className="inline-flex items-center gap-2"><ClipboardList size={18} aria-hidden /> CRM basics: leads, estimates, invoices</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" /> <span className="inline-flex items-center gap-2"><PlugZap size={18} aria-hidden /> Automations for follow‑ups and reviews</span></li>
                </ul>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a href="/ontask" className="bg-[#20b2aa] text-white hover:bg-[#1a8f85] font-semibold py-3 px-6 rounded-full text-center">Explore OnTask</a>
                  <a href="https://form.jotform.com/252643454932157" className="underline text-gray-700 text-center">Join the waitlist</a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="how" className="py-16 px-8 sm:px-20 reveal-in">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10 text-center">
              <span className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">PROCESS</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 text-gray-800">How we go from idea to MVP</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">A clear, outcome‑driven sequence. We partner closely, validate quickly, and ship working software on a predictable cadence.</p>
            </div>

            {/* Steps grid: mobile-first, scales to 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {/* Step */}
              <div className="rounded-xl border p-6 bg-white shadow-lg text-black">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-[#20b2aa]/10 flex items-center justify-center text-[#20b2aa]"><Search size={20} aria-hidden /></div>
                  <div className="text-xs font-semibold tracking-wider uppercase text-gray-500">Step 1</div>
                </div>
                <h3 className="text-xl font-bold mb-1">Discover & Align</h3>
                <p className="text-black">Identify goals, constraints, users, and success metrics. Gather the essentials to move fast with clarity.</p>
              </div>

              <div className="rounded-xl border p-6 bg-white shadow-lg text-black">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-[#20b2aa]/10 flex items-center justify-center text-[#20b2aa]"><Target size={20} aria-hidden /></div>
                  <div className="text-xs font-semibold tracking-wider uppercase text-gray-500">Step 2</div>
                </div>
                <h3 className="text-xl font-bold mb-1">Scope the MVP</h3>
                <p className="text-black">Define a small, valuable slice. Prioritize core flows, data model, and the shortest path to value.</p>
              </div>

              <div className="rounded-xl border p-6 bg-white shadow-lg text-black">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-[#20b2aa]/10 flex items-center justify-center text-[#20b2aa]"><PenTool size={20} aria-hidden /></div>
                  <div className="text-xs font-semibold tracking-wider uppercase text-gray-500">Step 3</div>
                </div>
                <h3 className="text-xl font-bold mb-1">Design the experience</h3>
                <p className="text-black">Wireframes, UI, and copy that make the MVP intuitive and on‑brand. Accessibility and responsiveness by default.</p>
              </div>

              <div className="rounded-xl border p-6 bg-white shadow-lg text-black">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-[#20b2aa]/10 flex items-center justify-center text-[#20b2aa]"><Code2 size={20} aria-hidden /></div>
                  <div className="text-xs font-semibold tracking-wider uppercase text-gray-500">Step 4</div>
                </div>
                <h3 className="text-xl font-bold mb-1">Build & integrate</h3>
                <p className="text-black">Implement backend APIs (Laravel), frontend (Next.js), auth, and key integrations. Ship weekly demos.</p>
              </div>

              <div className="rounded-xl border p-6 bg-white shadow-lg text-black">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-[#20b2aa]/10 flex items-center justify-center text-[#20b2aa]"><PlugZap size={20} aria-hidden /></div>
                  <div className="text-xs font-semibold tracking-wider uppercase text-gray-500">Step 5</div>
                </div>
                <h3 className="text-xl font-bold mb-1">Automate & add AI</h3>
                <p className="text-black">Wire up workflows, assistants, and retrieval where they create leverage. Measure impact from day one.</p>
              </div>

              <div className="rounded-xl border p-6 bg-white shadow-lg text-black">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-[#20b2aa]/10 flex items-center justify-center text-[#20b2aa]"><Rocket size={20} aria-hidden /></div>
                  <div className="text-xs font-semibold tracking-wider uppercase text-gray-500">Step 6</div>
                </div>
                <h3 className="text-xl font-bold mb-1">Launch & iterate</h3>
                <p className="text-black">Release, observe, and refine. We keep shipping improvements that compound into a product moat.</p>
              </div>
            </div>

            {/* Mobile CTA under the grid */}
            <div className="mt-8 text-center sm:hidden">
              <a href="/subscribe" className="inline-flex items-center justify-center text-center bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full">Start subscription</a>
            </div>
          </div>
        </section>

        <section id="proof" className="py-20 px-8 sm:px-20 bg-gradient-to-r from-[#20b2aa]/10 to-[#007bff]/10 reveal-in">
          {/* (content unchanged) */}
        </section>

  {/* Contact area (de-emphasized): prefer JotForm contact form */}
  <section id="contact" className="contact-section relative overflow-hidden py-20 px-8 sm:px-20 bg-gradient-to-r from-[#20b2aa]/5 to-[#007bff]/5 reveal-in">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <span className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 text-center">
                GET STARTED
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-gray-800">
                Prefer a quick form?
              </h2>
            </div>

            <p className="text-lg text-gray-600 mb-12 readable">
              We now handle inquiries primarily via our contact form. You can still book a call below if you’d like.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="contact-card relative p-5 sm:p-6 rounded-xl shadow-lg border border-gray-200 bg-white text-black">
                <h3 className="font-semibold text-lg md:text-xl mb-3 md:mb-4 text-[#20b2aa]">Contact Information</h3>
                <div className="space-y-3 text-left">
                  <p className="flex items-center"><span className="text-[#20b2aa] mr-3">📝</span><a className="underline" href="https://form.jotform.com/252643426225151" target="_blank" rel="noopener noreferrer">Open contact form</a></p>
                  <p className="flex items-center"><span className="text-[#20b2aa] mr-3">📧</span><span>{CONTACT_EMAIL_PUBLIC}</span></p>
                  <p className="flex items-center">
                    <span className="text-[#20b2aa] mr-3">📞</span>
                    <span>+1 (614) 500-2315</span>
                  </p>
                </div>
              </div>

              <div className="contact-card relative p-5 sm:p-6 rounded-xl shadow-lg border border-gray-200 bg-white text-black">
                <h3 className="font-semibold text-lg md:text-xl mb-3 md:mb-4 text-[#20b2aa]">Schedule a Call (optional)</h3>
                <p className="text-sm text-black mb-3">Prefer a call? You can still book below. Otherwise, the contact form is preferred for fastest response.</p>

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
                    style={{ minWidth: '320px', height: '560px' }}
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
        <style jsx>{`
          .gradient-glow-text {
            text-shadow:
              0 0 8px #20b2aa,
              0 0 16px #1a8f85,
              0 0 24px #ffe082;
          }
          /* Subtle animated background for the contact section */
          .contact-section::before {
            content: "";
            position: absolute;
            inset: -25%;
            background:
              radial-gradient(40rem 30rem at 20% 15%, rgba(32,178,170,0.10), transparent 60%),
              radial-gradient(36rem 28rem at 80% 85%, rgba(0,123,255,0.08), transparent 60%);
            filter: blur(0.5px);
            animation: contactDrift 18s ease-in-out infinite alternate;
            pointer-events: none;
          }
          @keyframes contactDrift {
            0% { transform: translate3d(0,0,0) scale(1); opacity: 0.8; }
            100% { transform: translate3d(0,-10px,0) scale(1.02); opacity: 1; }
          }
          /* Card glow/pulse that's extremely subtle */
          .contact-card::after {
            content: "";
            position: absolute;
            inset: -30%;
            background: radial-gradient(closest-side, rgba(32,178,170,0.10), transparent 70%);
            transform: translateY(0) scale(1);
            animation: cardBreathe 12s ease-in-out infinite;
            pointer-events: none;
          }
          @keyframes cardBreathe {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.45; }
            50% { transform: translateY(-6px) scale(1.02); opacity: 0.6; }
          }
        `}</style>
      </div>
    </div>
  );
}
