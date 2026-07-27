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
    <Link href="/" onClick={close} className="group flex items-center gap-2.5 rounded-full pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37FFE0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071225]" aria-label="OfRoot home">
      <Image src="/ofroot-logo.png" alt="" width={40} height={40} priority className="h-10 w-10 rounded-full ring-1 ring-white/15 transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transition-none" />
      <span className="text-[1.08rem] font-extrabold tracking-[-0.01em]"><span className="text-white">of</span><span className="text-[#37FFE0]">root</span></span>
    </Link>
  );

  return <>
    <header className="sticky top-0 z-[9999] border-b border-white/10 bg-[#071225]/90 text-white shadow-[0_8px_28px_rgba(2,6,23,.16)] backdrop-blur-xl supports-[backdrop-filter]:bg-[#071225]/76">
      <div className="mx-auto flex min-h-[4.5rem] max-w-[92rem] items-center px-4 sm:px-6 lg:px-8">
        {logo}
        <nav className="ml-auto hidden items-center gap-6 xl:flex" aria-label="Primary navigation">
          {groups.map(group => (
            <details key={group.label} className="group relative">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37FFE0] [&::-webkit-details-marker]:hidden">{group.label}<ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" /></summary>
              <div className="absolute left-1/2 top-[calc(100%+8px)] w-72 -translate-x-1/2 rounded-2xl border border-white/15 bg-[#0b172b]/95 p-2 shadow-[0_18px_50px_rgba(2,6,23,.38)] backdrop-blur-xl supports-[backdrop-filter]:bg-[#0b172b]/86">
                {group.links.map(([label, href]) => <Link key={href} href={href} className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#37FFE0]">{label}</Link>)}
              </div>
            </details>
          ))}
          {links.map(([label, href]) => <Link key={href} href={href} className="rounded-full px-1.5 py-2 text-sm font-semibold text-slate-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37FFE0]">{label}</Link>)}
          <span className="h-6 w-px bg-white/15" aria-hidden="true" />
          <Link href="/book?source=nav" onClick={() => track({ category: 'cta', action: 'audit_cta_clicked', label: 'nav', meta: { path: pathname } })} className="group/audit inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-[#ffd08d]/55 bg-[#FF9312] px-5 py-2 text-sm font-extrabold text-slate-950 shadow-[0_8px_20px_rgba(255,147,18,.22)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-[#ffad42] hover:shadow-[0_12px_26px_rgba(255,147,18,.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff0d7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071225] motion-reduce:transform-none motion-reduce:transition-none">Book a Growth Systems Audit<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/audit:translate-x-0.5 motion-reduce:transition-none" /></Link>
        </nav>
        <button type="button" onClick={() => setOpen(true)} className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/[.06] p-2 text-white transition-colors hover:bg-white/[.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37FFE0] xl:hidden" aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-navigation"><Menu className="h-5 w-5" /></button>
      </div>
    </header>
    {open && (
      <div className="fixed inset-0 z-[10000] bg-slate-950/65 backdrop-blur-sm xl:hidden" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
        <div id="mobile-navigation" ref={panel} role="dialog" aria-modal="true" aria-label="Mobile navigation" className="ml-auto flex h-full w-full max-w-[26rem] flex-col border-l border-white/10 bg-[#071225]/95 p-4 text-white shadow-[-20px_0_60px_rgba(2,6,23,.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-[#071225]/88 sm:p-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">{logo}<button type="button" onClick={close} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/[.06] p-2 transition-colors hover:bg-white/[.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37FFE0]" aria-label="Close navigation"><X className="h-5 w-5" /></button></div>
          <nav className="mt-5 flex-1 overflow-y-auto pr-1" aria-label="Mobile navigation">
            {groups.map(group => <section key={group.label} className="mb-3 rounded-2xl border border-white/10 bg-white/[.035] p-2.5"><p className="mb-1.5 px-2 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#FFC46B]">{group.label}</p>{group.links.map(([label, href]) => <Link key={href} href={href} onClick={close} className="block rounded-xl px-2 py-2.5 text-[0.98rem] font-semibold text-slate-100 transition-colors hover:bg-white/[.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#37FFE0]">{label}</Link>)}</section>)}
            <div className="mt-4 border-t border-white/10 pt-3">{links.map(([label, href]) => <Link key={href} href={href} onClick={close} className="block rounded-xl px-3 py-3 text-[0.98rem] font-semibold text-slate-100 transition-colors hover:bg-white/[.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#37FFE0]">{label}</Link>)}</div>
          </nav>
          <Link href="/book?source=mobile-nav" onClick={() => { close(); track({ category: 'cta', action: 'audit_cta_clicked', label: 'mobile_nav', meta: { path: pathname } }); }} className="group/audit mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#ffd08d]/55 bg-[#FF9312] px-5 py-3 font-extrabold text-slate-950 shadow-[0_8px_20px_rgba(255,147,18,.22)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-[#ffad42] hover:shadow-[0_12px_26px_rgba(255,147,18,.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff0d7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071225] motion-reduce:transform-none motion-reduce:transition-none">Book a Growth Systems Audit<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/audit:translate-x-0.5 motion-reduce:transition-none" /></Link>
        </div>
      </div>
    )}
  </>;
}
