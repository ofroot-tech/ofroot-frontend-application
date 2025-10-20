'use client';

// PublicNavbar — a minimal top navigation for public flows (e.g., Subscribe)
// ---------------------------------------------------------------------------
// Intent: Reuse the home look-and-feel but keep links focused on top-level
// marketing entry points. We avoid product/app links to reduce cognitive load
// during onboarding.
//
// Links: Development (home) • Marketing • Blog
// - Development points to the homepage (/), which highlights our dev services.
// - Marketing points to /marketing.
// - Blog points to /blog.
//
// Accessibility: Fixed header with proper roles, keyboardable mobile menu,
// and a polite live region for announcing open/close state.

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const toggleMenu = (next = !open) => {
    setOpen(next);
    setLiveMessage(next ? 'Mobile menu opened' : 'Mobile menu closed');
  };

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
        const container = menuRef.current;
        if (!container) return;
        const focusable = container.querySelectorAll<HTMLElement>('a[href], button, [tabindex]:not([tabindex="-1"])');
        if (focusable.length) focusable[0]?.focus();
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
  }, [open]);

  const linkClass = (href: string) => `text-gray-700 hover:text-[#20b2aa] ${pathname === href ? 'font-medium' : ''}`;

  return (
    <header role="banner" className="w-full fixed top-0 left-0 z-50 bg-transparent backdrop-blur-sm h-14 md:h-16">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 h-full">
        <div className="flex items-center">
          <Link href="/" aria-label="OfRoot homepage">
            <Image
              src="/ofroot-logo.png"
              alt="OfRoot logo"
              width={64}
              height={64}
              priority
              className="rounded-full object-cover transition-transform duration-150 ease-out hover:scale-105 active:scale-95 focus:scale-95 focus:outline-none focus:ring-2 focus:ring-[#20b2aa] w-10 h-10 md:w-16 md:h-16"
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
          <Link href="/services" className={linkClass('/services')}>Services</Link>
          <Link href="/" className={linkClass('/')}>Development</Link>
          <Link href="/marketing" className={linkClass('/marketing')}>Marketing</Link>
          <Link href="/blog" className={linkClass('/blog')}>Blog</Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="md:hidden p-2 text-xl"
            onClick={() => toggleMenu(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu-public"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <div aria-live="polite" className="sr-only">{liveMessage}</div>

      <div
        onClick={() => toggleMenu(false)}
        role="presentation"
        aria-hidden={!open}
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      <div
        id="mobile-menu-public"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
        aria-hidden={!open}
        className={`md:hidden mobile-glass border-t border-gray-200 rounded-b-lg rounded-t-none p-3 m-3 shadow-lg rounded-lg transform origin-top transition-transform duration-200 ease-in-out ${open ? 'opacity-100 translate-y-0 scale-100 z-50' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'}`}
      >
        <div className="flex flex-col p-3 gap-3 max-w-6xl mx-auto">
          <Link href="/services" onClick={() => toggleMenu(false)} className="text-gray-700">Services</Link>
          <Link href="/" onClick={() => toggleMenu(false)} className="text-gray-700">Development</Link>
          <Link href="/marketing" onClick={() => toggleMenu(false)} className="text-gray-700">Marketing</Link>
          <Link href="/blog" onClick={() => toggleMenu(false)} className="text-gray-700">Blog</Link>
        </div>
      </div>
    </header>
  );
}
