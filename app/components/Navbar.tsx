'use client';

/**
 * Navbar Component - Vast.ai Inspired Design
 * 
 * A modern, dark navigation bar with:
 * - Desktop: Horizontal nav with dropdowns, CTAs on right
 * - Mobile: Logo + CTA + hamburger that opens full-screen dark drawer
 * 
 * Design inspired by vast.ai navigation patterns.
 */

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, ChevronDown, ArrowRight } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────────────────────── */
const COLORS = {
  bg: '#121212',
  bgSecondary: '#1a1a1a',
  accent: '#20b2aa',
  text: '#ffffff',
  textSecondary: '#gray-400',
  border: '#gray-800',
} as const;

/* ─────────────────────────────────────────────────────────────
   Navigation Data Structure
   ───────────────────────────────────────────────────────────── */
type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

type NavItem = {
  label: string;
  href?: string;
  external?: boolean;
  children?: NavLink[];
};

const navItems: NavItem[] = [
  // { label: 'Consulting', href: '/consulting' },
  { label: 'Integrations', href: '/services/integration' },
  { label: 'Automations', href: '/automations' },
  {
    label: 'Solutions',
    children: [
      { label: 'HubSpot Integration', href: '/hubspot-integration' },
      { label: 'Meta Conversions API', href: '/meta-conversions-api' },
      { label: 'Make + Zapier Automation', href: '/make-zapier-automation' },
      { label: 'Agent Integrations', href: '/agent-integrations' },
      { label: 'GPU + LLM Training', href: '/gpu-llm-training' },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Blog', href: '/blog' },
  {
    label: 'Company',
    children: [
      { label: 'About', href: '/#services' },
      { label: 'Substack', href: 'https://substack.com/@ofroot/posts', external: true },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   Shared Nav Rendering Function
   ───────────────────────────────────────────────────────────── */
function renderNavItems(
  items: NavItem[],
  isDesktop: boolean,
  onNavigate?: () => void
) {
  return items.map((item) =>
    item.children ? (
      isDesktop ? (
        <DesktopDropdown key={item.label} item={item} />
      ) : (
        <MobileDropdown key={item.label} item={item} onNavigate={onNavigate!} />
      )
    ) : (
      <Link
        key={item.label}
        href={item.href!}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
        className={
          isDesktop
            ? 'text-white hover:text-[#20b2aa] transition-colors px-3 py-2 rounded-md'
            : 'block text-white text-base font-medium py-2 hover:text-[#20b2aa] transition-colors'
        }
        onClick={onNavigate}
      >
        {item.label}
        {item.external && <span className={`ml-1 ${isDesktop ? 'text-gray-400' : 'text-gray-500'}`}>↗</span>}
      </Link>
    )
  );
}

/* ─────────────────────────────────────────────────────────────
   Desktop Dropdown Component
   ───────────────────────────────────────────────────────────── */
function DesktopDropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center text-white hover:text-[#20b2aa] transition-colors px-3 py-2 rounded-md"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={`dropdown-${item.label}`}
      >
        {item.label}
        <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        id={`dropdown-${item.label}`}
        role="menu"
        className={`absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-gray-700 rounded-lg py-2 min-w-48 shadow-lg transition-all duration-200 ${
          open ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}
      >
        {item.children?.map((child) => (
          <Link
            key={child.label}
            href={child.href}
            target={child.external ? '_blank' : undefined}
            rel={child.external ? 'noopener noreferrer' : undefined}
            className="block px-4 py-2 text-white hover:bg-gray-700 hover:text-[#20b2aa] transition-colors"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            {child.label}
            {child.external && <span className="ml-1 text-gray-400">↗</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Mobile Dropdown Component
   ───────────────────────────────────────────────────────────── */
function MobileDropdown({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-white text-base font-medium py-2"
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Children */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pl-4 py-2 space-y-2">
          {item.children?.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              target={child.external ? '_blank' : undefined}
              rel={child.external ? 'noopener noreferrer' : undefined}
              className="block text-gray-400 hover:text-white text-sm py-1.5 transition-colors"
              onClick={onNavigate}
            >
              {child.label}
              {child.external && <span className="ml-1">↗</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Navbar Component
   ───────────────────────────────────────────────────────────── */
export default function Navbar() {
  const pathname = usePathname() ?? '/';
  const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  // Hide navbar on landing pages and dashboard (they have their own nav)
  const shouldRenderNav = !normalized.startsWith('/landing') && !normalized.startsWith('/dashboard');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const toggleMobileMenu = useCallback((next?: boolean) => {
    setMobileMenuOpen((prev) => {
      const resolved = typeof next === 'boolean' ? next : !prev;
      setLiveMessage(resolved ? 'Navigation menu opened' : 'Navigation menu closed');
      return resolved;
    });
  }, []);

  const closeMobileMenu = () => {
    toggleMobileMenu(false);
  };

  // Focus trap and body scroll lock for mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mobileMenuOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleMobileMenu(false);
      }
      if (e.key === 'Tab') {
        const container = menuRef.current;
        if (!container) return;
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')
        ).filter((el) => !el.hasAttribute('disabled'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    if (mobileMenuOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      setTimeout(() => {
        menuRef.current?.querySelector<HTMLElement>('button, a[href]')?.focus();
      }, 0);
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (previouslyFocused.current) {
        previouslyFocused.current.focus();
      }
      previouslyFocused.current = null;
    };
  }, [mobileMenuOpen, toggleMobileMenu]);

  if (!shouldRenderNav) {
    return null;
  }

  return (
    <>
      {/* ─────────────────────────────────────────────────────────
          Desktop Navigation Bar
          ───────────────────────────────────────────────────────── */}
      <header
        role="banner"
        className="navbar-header fixed top-0 left-0 right-0 z-[9999] bg-[#121212] border-b border-gray-800/50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" aria-label="OfRoot homepage" className="flex items-center gap-2">
                <Image
                  src="/ofroot-logo.png"
                  alt=""
                  width={36}
                  height={36}
                  priority
                  className="h-9 w-9 rounded-full object-cover"
                  aria-hidden="true"
                />
                <span className="text-white font-semibold text-base md:text-lg tracking-tight">ofroot</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Desktop navigation">
              {renderNavItems(navItems, true)}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-4 ml-8">
              <Link
                href="/consulting/book"
                className="text-[#20b2aa] hover:text-white transition-colors px-4 py-2 rounded-md font-medium"
              >
                Book an integration call
              </Link>
              <a
                href="https://form.jotform.com/252643426225151"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#20b2aa] transition-colors px-4 py-2 rounded-md font-medium"
              >
                Talk to an engineer
              </a>
            </div>

            {/* Mobile-first nav: single drawer used across all breakpoints for consistency */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => toggleMobileMenu()}
                className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-drawer"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                    <span className="block w-full h-0.5 bg-current" />
                    <span className="block w-full h-0.5 bg-current" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Screen reader announcement */}
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      {/* ─────────────────────────────────────────────────────────
          Mobile Navigation Drawer
          ───────────────────────────────────────────────────────── */}
      <div
        id="mobile-nav-drawer"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`fixed inset-0 z-[10000] lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <div
          className={`absolute inset-0 bg-[#121212] transform transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-gray-800/50">
            <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
              <Image
                src="/ofroot-logo.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
                aria-hidden="true"
              />
              <span className="text-white font-semibold text-lg">ofroot</span>
            </Link>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="px-6 py-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
            {/* Primary CTAs */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-[#20b2aa] text-base font-medium">Book an integration call</span>
                <Link
                  href="/consulting/book"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#0f766e] hover:bg-[#0f766e]/10 transition-colors"
                  onClick={closeMobileMenu}
                  aria-label="Book a discovery call"
                >
                  <ArrowRight className="w-5 h-5 text-[#0f766e]" />
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white text-base font-medium">Contact Sales</span>
                <a
                  href="https://form.jotform.com/252643426225151"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 hover:border-gray-500 transition-colors"
                  onClick={closeMobileMenu}
                  aria-label="Contact Sales"
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </a>
              </div>
              {/* Console button temporarily hidden
              <div className="flex items-center justify-between">
                <span className="text-[#20b2aa] text-base font-medium">Console</span>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#0f766e] hover:bg-[#0f766e]/10 transition-colors"
                  onClick={closeMobileMenu}
                  aria-label="Go to Console"
                >
                  <ArrowRight className="w-5 h-5 text-[#0f766e]" />
                </Link>
              </div>
              */}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-800 mb-6" />

            {/* Navigation Links */}
            <nav className="space-y-1" aria-label="Mobile navigation">
              {renderNavItems(navItems, false, closeMobileMenu)}
            </nav>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
}
