'use client';

/**
 * PublicNavbar — Minimal navigation for public flows (Subscribe, Onboarding)
 * 
 * A simplified version of the main navbar with fewer links.
 * Dark theme matching the main navbar for visual consistency.
 */

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useCallback } from 'react';

export default function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const toggleMenu = useCallback((next?: boolean) => {
    setOpen((prev) => {
      const resolved = typeof next === 'boolean' ? next : !prev;
      setLiveMessage(resolved ? 'Navigation menu opened' : 'Navigation menu closed');
      return resolved;
    });
  }, []);

  const closeMenu = () => toggleMenu(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleMenu(false);
      }
      if (e.key === 'Tab') {
        const container = menuRef.current;
        if (!container) return;
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>('a[href], button, [tabindex]:not([tabindex="-1"])')
        ).filter((el) => !el.hasAttribute('disabled'));
        if (focusable.length === 0) return;
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

    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      setTimeout(() => {
        menuRef.current?.querySelector<HTMLElement>('a[href], button')?.focus();
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
  }, [open, toggleMenu]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header role="banner" className="fixed top-0 left-0 right-0 z-[9999] bg-[#121212] border-b border-gray-800/50">
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
            <nav className="hidden lg:flex items-center gap-8" aria-label="Primary navigation">
              <Link
                href="/services"
                className={`text-sm font-medium transition-colors ${isActive('/services') ? 'text-white' : 'text-gray-300 hover:text-white'}`}
              >
                Services
              </Link>
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-white' : 'text-gray-300 hover:text-white'}`}
              >
                Development
              </Link>
              <Link
                href="/marketing"
                className={`text-sm font-medium transition-colors ${isActive('/marketing') ? 'text-white' : 'text-gray-300 hover:text-white'}`}
              >
                Marketing
              </Link>
              <Link
                href="/blog"
                className={`text-sm font-medium transition-colors ${isActive('/blog') ? 'text-white' : 'text-gray-300 hover:text-white'}`}
              >
                Blog
              </Link>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-white text-sm font-medium hover:text-gray-300 transition-colors"
              >
                Console
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-current">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <div className="flex lg:hidden items-center">
              <button
                type="button"
                onClick={() => toggleMenu()}
                className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls="mobile-menu-public"
              >
                {open ? (
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
      <div aria-live="polite" className="sr-only">{liveMessage}</div>

      {/* Mobile Menu Drawer */}
      <div
        id="mobile-menu-public"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`fixed inset-0 z-[10000] lg:hidden transition-all duration-300 ${open ? 'visible' : 'invisible'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <div
          className={`absolute inset-0 bg-[#121212] transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-gray-800/50">
            <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
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
              onClick={closeMenu}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="px-6 py-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
            {/* Console CTA */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-[#20b2aa] text-base font-medium">Console</span>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#0f766e] hover:bg-[#0f766e]/10 transition-colors"
                onClick={closeMenu}
                aria-label="Go to Console"
              >
                <ArrowRight className="w-5 h-5 text-[#0f766e]" />
              </Link>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-800 mb-6" />

            {/* Navigation Links */}
            <nav className="space-y-1" aria-label="Mobile navigation">
              <Link
                href="/services"
                onClick={closeMenu}
                className="block text-white text-base font-medium py-2 hover:text-[#20b2aa] transition-colors"
              >
                Services
              </Link>
              <Link
                href="/"
                onClick={closeMenu}
                className="block text-white text-base font-medium py-2 hover:text-[#20b2aa] transition-colors"
              >
                Development
              </Link>
              <Link
                href="/marketing"
                onClick={closeMenu}
                className="block text-white text-base font-medium py-2 hover:text-[#20b2aa] transition-colors"
              >
                Marketing
              </Link>
              <Link
                href="/blog"
                onClick={closeMenu}
                className="block text-white text-base font-medium py-2 hover:text-[#20b2aa] transition-colors"
              >
                Blog
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
}
