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
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, ChevronDown, ArrowRight } from 'lucide-react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';

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
  { label: 'Consulting', href: '/consulting' },
  { label: 'Services', href: '/services' },
  { label: 'Build', href: '/build' },
  { label: 'Pricing', href: '/pricing' },
  {
    label: 'Products',
    children: [
      { label: 'OnTask', href: '/ontask' },
      { label: 'Case Studies', href: '/case-studies' },
    ],
  },
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
   Arrow Button Component (Vast.ai style)
   ───────────────────────────────────────────────────────────── */
function ArrowButton({
  href,
  children,
  variant = 'outline',
  external = false,
  className = '',
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'outline' | 'primary';
  external?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const baseClasses = 'inline-flex items-center gap-2 text-sm font-medium transition-all duration-200';
  const variantClasses =
    variant === 'primary'
      ? 'text-[#20b2aa] hover:text-[#3cc4bc]'
      : 'text-white hover:text-gray-300';

  const content = (
    <>
      {children}
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${
        variant === 'primary' ? 'border-[#20b2aa]' : 'border-current'
      }`}>
        <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${variantClasses} ${className}`}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={`${baseClasses} ${variantClasses} ${className}`} onClick={onClick}>
      {content}
    </Link>
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

  const toggleMobileMenu = (next = !mobileMenuOpen) => {
    setMobileMenuOpen(next);
    setLiveMessage(next ? 'Navigation menu opened' : 'Navigation menu closed');
  };

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
      previouslyFocused.current?.focus?.();
      previouslyFocused.current = null;
    };
  }, [mobileMenuOpen]);

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
                <span className="text-white font-semibold text-lg tracking-tight">ofroot</span>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <NavigationMenu.Root className="relative hidden lg:flex items-center" aria-label="Primary navigation">
              <NavigationMenu.List className="flex items-center gap-4 lg:gap-8">
                {navItems.map((item) =>
                  item.children ? (
                    <NavigationMenu.Item key={item.label} className="relative">
                      <NavigationMenu.Trigger className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-sm font-medium data-[state=open]:text-white">
                        {item.label}
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </NavigationMenu.Trigger>
                      {/* Drop aligns to its trigger; absolute positioning removes hover gaps. */}
                      <NavigationMenu.Content className="absolute left-1/2 top-[calc(100%+6px)] z-20 -translate-x-1/2 min-w-[220px] rounded-xl bg-[#0f0f0f] border border-gray-800 shadow-2xl p-2 radix-state-open:animate-in radix-state-open:fade-in-0 radix-state-open:zoom-in-95 radix-state-closed:animate-out radix-state-closed:fade-out-0 radix-state-closed:zoom-out-95">
                        {item.children.map((child) => (
                          <NavigationMenu.Link key={child.label} asChild>
                            <Link
                              href={child.href}
                              target={child.external ? '_blank' : undefined}
                              rel={child.external ? 'noopener noreferrer' : undefined}
                              className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              {child.label}
                              {child.external && <span className="ml-1 text-gray-500">↗</span>}
                            </Link>
                          </NavigationMenu.Link>
                        ))}
                      </NavigationMenu.Content>
                    </NavigationMenu.Item>
                  ) : (
                    <NavigationMenu.Item key={item.label}>
                      <NavigationMenu.Link asChild>
                        <Link
                          href={item.href!}
                          target={item.external ? '_blank' : undefined}
                          rel={item.external ? 'noopener noreferrer' : undefined}
                          className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                        >
                          {item.label}
                        </Link>
                      </NavigationMenu.Link>
                    </NavigationMenu.Item>
                  )
                )}
              </NavigationMenu.List>
              <NavigationMenu.Viewport className="absolute left-0 top-full mt-2 w-[260px] overflow-hidden rounded-xl border border-gray-800 bg-[#0f0f0f] shadow-2xl radix-state-open:animate-in radix-state-open:fade-in-0 radix-state-open:zoom-in-95 radix-state-closed:animate-out radix-state-closed:fade-out-0 radix-state-closed:zoom-out-95" />
            </NavigationMenu.Root>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-6">
              <ArrowButton
                href="/consulting/book"
                variant="primary"
              >
                Book a Call
              </ArrowButton>
              <ArrowButton
                href="https://form.jotform.com/252643426225151"
                variant="outline"
                external
              >
                Contact Sales
              </ArrowButton>
              {/* Console button temporarily hidden
              <ArrowButton href="/dashboard" variant="outline">
                Console
              </ArrowButton>
              */}
            </div>

            {/* Mobile: CTA + Hamburger */}
            <div className="flex lg:hidden items-center gap-4">
              {/* Console button temporarily hidden
              <ArrowButton href="/dashboard" variant="outline" className="text-sm">
                Console
              </ArrowButton>
              */}
              <button
                type="button"
                onClick={() => toggleMobileMenu()}
                className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
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
                <span className="text-[#20b2aa] text-base font-medium">Book a Call</span>
                <Link
                  href="/consulting/book"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#20b2aa] hover:bg-[#20b2aa]/10 transition-colors"
                  onClick={closeMobileMenu}
                  aria-label="Book a discovery call"
                >
                  <ArrowRight className="w-5 h-5 text-[#20b2aa]" />
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
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#20b2aa] hover:bg-[#20b2aa]/10 transition-colors"
                  onClick={closeMobileMenu}
                  aria-label="Go to Console"
                >
                  <ArrowRight className="w-5 h-5 text-[#20b2aa]" />
                </Link>
              </div>
              */}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-800 mb-6" />

            {/* Navigation Links */}
            <nav className="space-y-1" aria-label="Mobile navigation">
              {navItems.map((item) =>
                item.children ? (
                  <MobileDropdown key={item.label} item={item} onNavigate={closeMobileMenu} />
                ) : (
                  <Link
                    key={item.label}
                    href={item.href!}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="block text-white text-base font-medium py-2 hover:text-[#20b2aa] transition-colors"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                    {item.external && <span className="ml-1 text-gray-500">↗</span>}
                  </Link>
                )
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
}
