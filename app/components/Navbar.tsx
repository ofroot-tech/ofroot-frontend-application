'use client';

import SiteBrand from '@/components/brand/SiteBrand';
import styles from './PublicChrome.module.css';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { track } from '@/app/lib/ab';

type NavigationLink = {
  label: string;
  href: string;
};

type NavigationGroup = {
  label: string;
  links: NavigationLink[];
};

const groups: NavigationGroup[] = [
  {
    label: 'Services',
    links: [
      { label: 'Websites & Growth', href: '/services/ai-discoverability' },
      { label: 'Integrations & Tools', href: '/services/automation-systems' },
      { label: 'AI & Deployment', href: '/services/private-company-ai' },
    ],
  },
  {
    label: 'Solutions',
    links: [
      { label: 'Generate Demand', href: '/solutions/generate-demand' },
      { label: 'Convert More Leads', href: '/solutions/convert-more-leads' },
      { label: 'Unlock Company Knowledge', href: '/solutions/unlock-company-knowledge' },
    ],
  },
  {
    label: 'Free Tools',
    links: [
      { label: 'Website Readiness Scanner', href: '/services/ai-audit' },
      { label: 'Business AI Assessment', href: '/ai-agent-readiness-assessment' },
    ],
  },
];

const links: NavigationLink[] = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Capabilities', href: '/results' },
  { label: 'News', href: '/news' },
  { label: 'Insights', href: '/insights' },
  { label: 'Security', href: '/security' },
];

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrandLink({ onNavigate }: { onNavigate?: () => void }) {
  return <SiteBrand onNavigate={onNavigate} />;
}

function DesktopGroup({ group, pathname }: { group: NavigationGroup; pathname: string }) {
  const active = group.links.some(link => isCurrentPath(pathname, link.href));

  return (
    <details
      className="group relative"
      onKeyDown={event => {
        if (event.key !== 'Escape' || !event.currentTarget.open) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.open = false;
        event.currentTarget.querySelector<HTMLElement>('summary')?.focus();
      }}
    >
      <summary
        className={`flex min-h-[40px] cursor-pointer list-none items-center gap-[6px] rounded-xl px-[12px] py-[8px] text-[14px] font-medium leading-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb78f] [&::-webkit-details-marker]:hidden ${
          active
            ? 'bg-white/[.09] text-white'
            : 'text-slate-300 hover:bg-white/[.055] hover:text-white'
        }`}
        aria-label={`${group.label} navigation`}
      >
        {group.label}
        <ChevronDown className="size-[14px] text-slate-500 transition-transform duration-200 group-open:rotate-180 group-open:text-slate-300 motion-reduce:transition-none" />
      </summary>
      <div className="absolute left-1/2 top-[calc(100%+10px)] w-72 -translate-x-1/2 rounded-2xl border border-white/[.11] bg-[#262231] p-2 shadow-[0_20px_55px_rgba(2,6,23,.42)] supports-[backdrop-filter]:bg-[#262231]/92 supports-[backdrop-filter]:backdrop-blur-2xl">
        <div className="px-3 pb-2 pt-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#c2a9e5]">
          {group.label}
        </div>
        {group.links.map(link => {
          const current = isCurrentPath(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={current ? 'page' : undefined}
              className={`group/link flex min-h-[44px] items-center justify-between rounded-xl !px-[12px] !py-[10px] !text-[14px] font-medium !leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ffb78f] ${
                current
                  ? 'bg-white/[.09] text-white'
                  : 'text-slate-300 hover:bg-white/[.06] hover:text-white'
              }`}
            >
              {link.label}
              <ArrowRight className="size-[14px] text-slate-600 transition-[color,transform] duration-200 group-hover/link:translate-x-0.5 group-hover/link:text-[#c2a9e5] motion-reduce:transform-none motion-reduce:transition-none" />
            </Link>
          );
        })}
      </div>
    </details>
  );
}

export default function Navbar() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const home = pathname === '/';
  const desktopLinks = home ? [
    { label: 'Our approach', href: '/#approach' },
    { label: 'Examples', href: '/#examples' },
    { label: 'Company', href: '/#contact' },
  ] : links;
  const panel = useRef<HTMLDivElement>(null);
  const shouldRender = !pathname.startsWith('/landing') && !pathname.startsWith('/dashboard');

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !panel.current) return;
      const nodes = Array.from(
        panel.current.querySelectorAll<HTMLElement>('a[href], button, [tabindex]:not([tabindex="-1"])'),
      ).filter(node => !node.hasAttribute('disabled'));
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
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

  return (
    <>
      <header className={`${styles.header} ${styles.homeHeader} sticky top-0 z-[9999] border-b border-white/[.08] text-white shadow-[0_1px_0_rgba(255,255,255,.025)]`}>
        <div className={`${styles.homeNav} flex items-center`}>
          <BrandLink />

          <nav className={`${styles.homeDesktop} ${home ? '' : styles.innerDesktop} ml-auto items-center`} aria-label="Primary navigation">
            {(home ? groups.slice(0, 1) : groups).map(group => (
              <DesktopGroup key={group.label} group={group} pathname={pathname} />
            ))}
            {desktopLinks.map(link => {
              const current = isCurrentPath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={current ? 'page' : undefined}
                  className={`inline-flex min-h-[40px] items-center rounded-xl !px-[12px] !py-[8px] !text-[14px] font-medium !leading-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb78f] ${
                    current
                      ? 'bg-white/[.09] text-white'
                      : 'text-slate-300 hover:bg-white/[.055] hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/book?source=nav"
              onClick={() =>
                track({ category: 'cta', action: 'audit_cta_clicked', label: 'nav', meta: { path: pathname } })
              }
              className={`${styles.homeCta} group/audit ml-2 inline-flex min-h-[44px] items-center gap-[10px] whitespace-nowrap rounded-full bg-[#FF9312] !py-[6px] !pl-[16px] !pr-[8px] !text-[14px] font-semibold !leading-none text-slate-950 shadow-sm ring-1 ring-inset ring-white/25 transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-[#ffad42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff0d7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17141f] motion-reduce:transform-none motion-reduce:transition-none`}
            >
              Discuss your project
              <span
                aria-hidden="true"
                className={styles.homeCtaArrow}
              >
                <ArrowRight className="size-[14px] transition-transform duration-200 group-hover/audit:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
              </span>
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`${styles.homeToggle} ${home ? '' : styles.innerToggle} ml-auto inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/[.12] bg-white/[.055] p-2 text-white transition-colors hover:bg-white/[.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb78f] lg:hidden`}
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open && (
        <div
          className={`${home ? '' : styles.innerOverlay} fixed inset-0 z-[10000] bg-slate-950/65 backdrop-blur-sm lg:hidden`}
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            id="mobile-navigation"
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className={`${styles.homePanel} absolute inset-y-3 right-3 flex w-[calc(100%_-_1.5rem)] max-w-[25rem] flex-col overflow-hidden rounded-3xl border border-white/[.11] bg-[#17141f] p-4 text-white shadow-[-20px_0_70px_rgba(2,6,23,.45)] supports-[backdrop-filter]:bg-[#17141f]/94 supports-[backdrop-filter]:backdrop-blur-2xl sm:p-5`}
          >
            <div className="flex items-center justify-between border-b border-white/[.09] pb-4">
              <BrandLink onNavigate={close} />
              <button
                type="button"
                onClick={close}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/[.12] bg-white/[.055] p-2 transition-colors hover:bg-white/[.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb78f]"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-3 flex-1 overflow-y-auto pr-1" aria-label="Mobile navigation">
              {groups.map(group => (
                <section key={group.label} className="border-b border-white/[.08] py-4">
                  <div className="px-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#c2a9e5]">
                    {group.label}
                  </div>
                  <div className="mt-1.5">
                    {group.links.map(link => {
                      const current = isCurrentPath(pathname, link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={close}
                          aria-current={current ? 'page' : undefined}
                          className={`flex min-h-[44px] items-center justify-between rounded-xl !px-[8px] !py-[10px] !text-[15px] font-medium !leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ffb78f] ${
                            current
                              ? 'bg-white/[.09] text-white'
                              : 'text-slate-200 hover:bg-white/[.06] hover:text-white'
                          }`}
                        >
                          {link.label}
                          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}

              <div className="py-3">
                {links.map(link => {
                  const current = isCurrentPath(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      aria-current={current ? 'page' : undefined}
                      className={`flex min-h-[44px] items-center justify-between rounded-xl !px-[8px] !py-[10px] !text-[15px] font-medium !leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ffb78f] ${
                        current
                          ? 'bg-white/[.09] text-white'
                          : 'text-slate-200 hover:bg-white/[.06] hover:text-white'
                      }`}
                    >
                      {link.label}
                      <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                    </Link>
                  );
                })}
              </div>
            </nav>

            <Link
              href="/book?source=mobile-nav"
              onClick={() => {
                close();
                track({ category: 'cta', action: 'audit_cta_clicked', label: 'mobile_nav', meta: { path: pathname } });
              }}
              className={`${styles.homeMobileCta} group/audit mt-3 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#FF9312] px-5 py-3 !text-[16px] font-bold !leading-none text-slate-950 transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-[#ffad42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff0d7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17141f] motion-reduce:transform-none motion-reduce:transition-none`}
            >
              Discuss your project
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/audit:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
