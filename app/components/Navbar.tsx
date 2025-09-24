'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const showNavOnThesePages = ["/", "/blog"];
  if (!showNavOnThesePages.includes(pathname)) return null;

  const [open, setOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Toggle helper that also sets live region message
  const toggleMenu = (next = !open) => {
    setOpen(next);
    setLiveMessage(next ? 'Mobile menu opened' : 'Mobile menu closed');
  };

  // Focus trap and Escape handling
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
          container.querySelectorAll<HTMLElement>(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
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
      // Save previously focused element to restore later
      previouslyFocused.current = document.activeElement as HTMLElement | null;

      // Focus first focusable element in menu
      window.setTimeout(() => {
        const container = menuRef.current;
        if (!container) return;
        const focusable = container.querySelectorAll<HTMLElement>('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
        if (focusable.length) {
          (focusable[0] as HTMLElement).focus();
        }
      }, 0);

      document.addEventListener('keydown', handleKeyDown);
      // prevent body scroll while menu open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      // restore focus
      if (previouslyFocused.current) {
        previouslyFocused.current.focus();
        previouslyFocused.current = null;
      }
    };
  }, [open]);

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
          {pathname === "/" && (
            <>
              <a href="#services" className="text-gray-700 hover:text-[#20b2aa]">Services</a>
              <a href="#featured" className="text-gray-700 hover:text-[#20b2aa]">Featured</a>
              <a href="#how" className="text-gray-700 hover:text-[#20b2aa]">How</a>
              <a href="#proof" className="text-gray-700 hover:text-[#20b2aa]">Proof</a>
              <a href="#case-studies" className="text-gray-700 hover:text-[#20b2aa]">Case Studies</a>
            </>
          )}
            {/* Show Blog link if not on /blog or any /blog/* page */}
            {!(pathname === "/blog" || pathname.startsWith("/blog/")) && (
              <a href="/blog" className="text-gray-700 hover:text-[#20b2aa]">Blog</a>
            )}
            {/* Show Home link if on /blog or any /blog/* page */}
            {(pathname === "/blog" || pathname.startsWith("/blog/")) && (
              <a href="/" className="text-gray-700 hover:text-[#20b2aa]">Home</a>
            )}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="bg-[#20b2aa] text-white py-2 md:py-3 px-10 md:px-14 rounded-full tracking-wide shadow-sm min-w-[140px] md:min-w-[180px] inline-flex items-center justify-center gap-3 text-center hover:bg-[#1a8f85] transition-transform transform-gpu hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#20b2aa]"
            aria-label="Go to contact section to book a scoping call"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <path d="M7 10h10M7 14h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <span>Contact</span>
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="md:hidden p-2 text-xl"
            onClick={() => toggleMenu(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Live region for screen readers to announce menu state */}
      <div aria-live="polite" className="sr-only">{liveMessage}</div>

      {/* Backdrop overlay behind mobile menu (click to close) */}
      <div
        onClick={() => toggleMenu(false)}
        role="presentation"
        aria-hidden={!open}
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Mobile menu: always rendered so animation + focus trap work reliably */}
      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
        aria-hidden={!open}
        className={
          `md:hidden mobile-glass border-t border-gray-200 rounded-b-lg rounded-t-none p-3 m-3 shadow-lg rounded-lg transform origin-top transition-transform duration-200 ease-in-out ${open ? 'opacity-100 translate-y-0 scale-100 z-50' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'}`
        }
      >
        <div className="flex flex-col p-3 gap-3 max-w-6xl mx-auto">
          <a href="#services" onClick={() => toggleMenu(false)} className="text-gray-700">Services</a>
          <a href="#featured" onClick={() => toggleMenu(false)} className="text-gray-700">Featured</a>
          {/* <a href="#case-studies" onClick={() => toggleMenu(false)} className="text-gray-700">Case Studies</a> */}
          <a href="#how" onClick={() => toggleMenu(false)} className="text-gray-700">How</a>
          <a href="#proof" onClick={() => toggleMenu(false)} className="text-gray-700">Proof</a>
          <a href="/blog" onClick={()=> toggleMenu(false)} className="text-gray-700">Blog</a>
          <a href="#contact" onClick={() => toggleMenu(false)} className="text-gray-700">Contact</a>
        </div>
      </div>
    </header>
  );
}
