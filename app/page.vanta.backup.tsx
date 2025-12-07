// app/page.vanta.backup.tsx
'use client';

/**
 * Full backup of the original Vanta + homepage implementation.
 *
 * This file is a safe snapshot before replacing `app/page.tsx` with a modular variant.
 * Keep this file until you're confident the new modular homepage is correct.
 */

import { Analytics } from "@vercel/analytics/react";
import Script from 'next/script';
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CONTACT_EMAIL_PUBLIC } from './config/public';
import PromoBanner from "@/components/PromoBanner";
import { Search, Target, PenTool, Code2, PlugZap, Rocket, CalendarDays, ClipboardList, Users, Wrench, BadgeDollarSign } from 'lucide-react';
import { track } from '@/app/lib/ab';
import SectionSnapper from '@/components/SectionSnapper';

// Calendly external widget URL (served by Calendly's CDN)
const calendlySrc = 'https://assets.calendly.com/assets/external/widget.js';

// Timeout (ms) to consider Calendly failed to initialize if global Calendly is not present
const CALENDLY_INIT_TIMEOUT = 8000;

const __IS_BROWSER__ = typeof window !== 'undefined';
let __vantaPreload: Promise<[any, any]> | null = null;
if (__IS_BROWSER__) {
  // Kick off both imports in parallel
  __vantaPreload = Promise.all([
    import(/* webpackPreload: true */ 'p5'),
    import(/* webpackPreload: true */ 'vanta/dist/vanta.topology.min'),
  ]);
}

export default function HomePage() {
  const vantaRef = useRef<HTMLDivElement | null>(null);
  const vantaEffect = useRef<any>(null);
  const calendlyRef = useRef<HTMLDivElement | null>(null);
  const [calendlyLoaded, setCalendlyLoaded] = useState<boolean | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const updateHealth = (resource: string, status: 'ok' | 'failed' | 'loading' | 'unknown') => {
    try {
      (window as any).__OFROOT_HEALTH = (window as any).__OFROOT_HEALTH || {};
      (window as any).__OFROOT_HEALTH[resource] = status;
      window.dispatchEvent(new CustomEvent('ofroot:healthupdate', { detail: { resource, status } }));
    } catch (e) {
      console.warn('Failed to update health status:', e);
    }
  };

  useEffect(() => { setHasMounted(true); }, []);

  useLayoutEffect(() => {
    let cancelled = false;
    const initVanta = async () => {
      updateHealth('vanta', 'loading');
      try {
        if (vantaEffect.current || !vantaRef.current) return;
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
        vantaEffect.current = TOPOLOGY({ el: vantaRef.current, p5, mouseControls: true, touchControls: true, minHeight: 200.0, minWidth: 200.0, scale: 1.0, scaleMobile: 1.0, speed: 15.90, color: 0x20b2aa, backgroundColor: 0xffffff });
        updateHealth('vanta', 'ok');
      } catch (err) {
        console.error('Vanta initialization failed (caught):', err);
        updateHealth('vanta', 'failed');
      }
    };
    initVanta();
    return () => { cancelled = true; if (vantaEffect.current) { try { vantaEffect.current.destroy(); } catch (err) { console.warn('Error while destroying Vanta effect:', err); } vantaEffect.current = null; updateHealth('vanta', 'unknown'); } };
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    updateHealth('calendly', 'loading');
    if ((window as any).Calendly) { setCalendlyLoaded(true); updateHealth('calendly', 'ok'); return; }
    setCalendlyLoaded(null);
    const onUnhandledRejection = (ev: PromiseRejectionEvent) => { console.error('Unhandled promise rejection:', ev.reason); };
    const globalErrorHandler = (ev: ErrorEvent) => { if (ev?.message && ev.message.toLowerCase().includes('failed to fetch')) { console.error('Global error detected (Failed to fetch):', ev.message, ev.filename, ev.lineno, ev.colno); } };
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', globalErrorHandler);
    const timeout = setTimeout(() => { if (!(window as any).Calendly) { setCalendlyLoaded(false); updateHealth('calendly', 'failed'); } }, CALENDLY_INIT_TIMEOUT);
    return () => { clearTimeout(timeout); window.removeEventListener('unhandledrejection', onUnhandledRejection); window.removeEventListener('error', globalErrorHandler); };
  }, [hasMounted]);

  const calendlyScriptExists = (() => { if (!hasMounted) return false; return !!document.querySelector(`script[src="${calendlySrc}"]`); })();

  useEffect(() => {
    if (!hasMounted) return;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)'); if (m.matches) return;
    const els = document.querySelectorAll<HTMLElement>('.reveal-in');
    const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { (entry.target as HTMLElement).classList.add('in-view'); observer.unobserve(entry.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [hasMounted]);

  return (
    <div className="font-sans">
      <Analytics />
      <a href="#services" className="sr-only">Skip to content</a>
      <PromoBanner spaced />
      <SectionSnapper containerId="home-snap" />
      <div id="home-snap" className="snap-page">
        <section data-snap-section className="section-full snap-fade" style={{ position: "relative", overflow: "hidden" }}>
          <div ref={vantaRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: 'none' }} data-vanta aria-hidden />
          <div style={{ position: "relative", zIndex: 1, height: "100%" }} className="hero-wrapper flex items-center justify-center p-8 sm:p-20">
            <main className="flex flex-col gap-[48px] items-center sm:items-start max-w-5xl">
              <div className="text-center sm:text-left">
                <span className="block text-xl font-semibold uppercase tracking-widest text-gray-500 mb-2 fade-up">INNOVATION AT THE ROOT</span>
                <h1 className="text-7xl sm:text-[6rem] font-extrabold mb-6 text-black leading-none fade-up delayed">OFROOT</h1>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-black mb-6 fade-up delayed">On‑demand engineering, automation, and AI — by subscription</h2>
                <p className="text-xl sm:text-2xl text-black/90 max-w-4xl mb-12 fade-up delayed readable">Ship product faster with a monthly engagement. We design and build web apps, automate workflows, and integrate AI — delivered in focused sprints with clear outcomes and transparent pricing.</p>
              </div>
              <div className="flex items-center flex-col sm:flex-row gap-3 sm:gap-4">
                <a className="loading-on-click inline-flex items-center justify-center text-center bg-white text-[#20b2aa] hover:bg-gray-100 font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg text-base fade-up delayed" href="#services" aria-label="Explore OfRoot services">Explore Services</a>
                <a className="loading-on-click inline-flex items-center justify-center text-center bg-[#20b2aa] text-white hover:bg-[#1a8f85] font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg text-base fade-up delayed" href="https://form.jotform.com/252643426225151" target="_blank" rel="noopener noreferrer" aria-label="Book a 20 minute scoping call" style={{ boxShadow: '0 6px 18px rgba(255,255,255,0.6), 0 4px 12px rgba(32,178,170,0.16)' }}>Book a 20-min scoping call</a>
                <a className="loading-on-click inline-flex items-center justify-center text-center bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg text-base fade-up delayed" href="#subscription" aria-label="Start your subscription">Subscribe</a>
              </div>
            </main>
          </div>
        </section>
      </div>
    </div>
  );
}
