'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { track } from '@/app/lib/ab';

const groups = [
  { label: 'Services', links: [['AI Discoverability', '/services/ai-discoverability'], ['Automation Systems', '/services/automation-systems'], ['Private Company AI', '/services/private-company-ai']] },
  { label: 'Solutions', links: [['Generate Demand', '/solutions/generate-demand'], ['Convert More Leads', '/solutions/convert-more-leads'], ['Unlock Company Knowledge', '/solutions/unlock-company-knowledge']] },
];
const links = [['Results', '/results'], ['Insights', '/insights'], ['Security', '/security']];

export default function Navbar() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const shouldRender = !pathname.startsWith('/landing') && !pathname.startsWith('/dashboard');

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab' || !panel.current) return;
      const nodes = Array.from(panel.current.querySelectorAll<HTMLElement>('a, button'));
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', keydown);
    panel.current?.querySelector<HTMLElement>('button')?.focus();
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', keydown);
      previous?.focus();
    };
  }, [open]);

  if (!shouldRender) return null;
  const close = () => setOpen(false);
  const logo = (
    <Link href="/" onClick={close} className="flex items-center gap-2" aria-label="OfRoot home">
      <Image src="/ofroot-logo.png" alt="" width={36} height={36} priority className="h-9 w-9 rounded-full" />
      <span className="text-lg font-bold"><span className="text-white">Of</span><span className="text-[#FF9312]">Root</span></span>
    </Link>
  );

  return <>
    <header className="sticky top-0 z-[9999] border-b border-white/10 bg-[#071225]/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[92rem] items-center px-4 sm:px-6 lg:px-8">
        {logo}
        <nav className="ml-auto hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {groups.map(group => (
            <details key={group.label} className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 py-5 text-sm font-semibold text-slate-200 hover:text-white">{group.label}<ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></summary>
              <div className="absolute left-1/2 top-[56px] w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0b172b] p-2 shadow-2xl">
                {group.links.map(([label, href]) => <Link key={href} href={href} className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 hover:text-white">{label}</Link>)}
              </div>
            </details>
          ))}
          {links.map(([label, href]) => <Link key={href} href={href} className="text-sm font-semibold text-slate-200 hover:text-white">{label}</Link>)}
          <Link href="/book?source=nav" onClick={() => track({ category: 'cta', action: 'audit_cta_clicked', label: 'nav', meta: { path: pathname } })} className="inline-flex items-center gap-2 rounded-full bg-[#FF9312] px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-[#ffad42]">Book a Growth Systems Audit<ArrowRight className="h-4 w-4" /></Link>
        </nav>
        <button type="button" onClick={() => setOpen(true)} className="ml-auto rounded-lg p-2 text-white hover:bg-white/10 lg:hidden" aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-navigation"><Menu className="h-6 w-6" /></button>
      </div>
    </header>
    {open && (
      <div className="fixed inset-0 z-[10000] bg-black/60 lg:hidden" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
        <div id="mobile-navigation" ref={panel} role="dialog" aria-modal="true" aria-label="Mobile navigation" className="ml-auto flex h-full w-full max-w-md flex-col bg-[#071225] p-5 text-white">
          <div className="flex items-center justify-between">{logo}<button type="button" onClick={close} className="rounded-lg p-2 hover:bg-white/10" aria-label="Close navigation"><X className="h-6 w-6" /></button></div>
          <nav className="mt-8 flex-1 overflow-y-auto" aria-label="Mobile navigation">
            {groups.map(group => <div key={group.label} className="border-b border-white/10 py-5"><p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-[#FFC46B]">{group.label}</p>{group.links.map(([label, href]) => <Link key={href} href={href} onClick={close} className="block py-2 font-semibold text-slate-200">{label}</Link>)}</div>)}
            <div className="py-4">{links.map(([label, href]) => <Link key={href} href={href} onClick={close} className="block py-3 font-semibold text-slate-200">{label}</Link>)}</div>
          </nav>
          <Link href="/book?source=mobile-nav" onClick={() => { close(); track({ category: 'cta', action: 'audit_cta_clicked', label: 'mobile_nav', meta: { path: pathname } }); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF9312] px-5 py-3 font-bold text-slate-950">Book a Growth Systems Audit<ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    )}
  </>;
}
