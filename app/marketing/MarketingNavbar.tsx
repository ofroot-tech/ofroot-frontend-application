'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState, useRef, useEffect } from 'react';
import { Newspaper } from 'lucide-react';

/**
 * OfRoot Marketing: Scalable Growth for Your Business
 *
 * We create scalable growth using data paired with experience and insight. Our team has worked with some of the top marketing companies across the industry, delivering millions in revenue for early-stage and established brands alike.
 *
 * Like CircleClick, we believe in Growth Science: making sure you get found in search, activating your audience on social, and creating compelling content that cuts through the noise. Our SEO and online marketing expertise is proven and battle-tested.
 *
 * Explore new ways to promote your business. Schedule a chat and see how OfRoot can accelerate your growth in competitive spaces.
 */

export default function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // New: Blog dropdown state + ref
  const [blogOpen, setBlogOpen] = useState(false);
  const blogMenuRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = useCallback((next?: boolean) => {
    setOpen((prev) => {
      const resolved = typeof next === 'boolean' ? next : !prev;
      setLiveMessage(resolved ? 'Mobile menu opened' : 'Mobile menu closed');
      return resolved;
    });
  }, []);

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
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      window.setTimeout(() => {
        const container = menuRef.current;
        if (!container) return;
        const focusable = container.querySelectorAll<HTMLElement>('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
        if (focusable.length) {
          (focusable[0] as HTMLElement).focus();
        }
      }, 0);
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (previouslyFocused.current) {
        previouslyFocused.current.focus();
        previouslyFocused.current = null;
      }
    };
  }, [open, toggleMenu]);

  // Close blog dropdown on outside click or Escape
  useEffect(() => {
    if (!blogOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (blogMenuRef.current && target && !blogMenuRef.current.contains(target)) {
        setBlogOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBlogOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [blogOpen]);

  return (
    <header role="banner" className="w-full fixed top-0 left-0 z-50 bg-transparent backdrop-blur-sm h-14 md:h-16">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 h-full">
        <div className="flex items-center">
          <Link href="/" aria-label="OfRoot Marketing homepage">
            <Image
              src="/ofroot-logo.png"
              alt="OfRoot logo"
              width={32}
              height={32}
              priority
              className="rounded-full object-cover transition-transform duration-150 ease-out hover:scale-105 active:scale-95 focus:scale-95 focus:outline-none focus:ring-2 focus:ring-[#20b2aa] w-8 h-8 md:w-10 md:h-10"
            />
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
          <Link href="/" className="text-gray-700 hover:text-[#20b2aa]">Development</Link>
          <a href="https://form.jotform.com/252643454932157" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#20b2aa]">Waitlist</a>
          {/* Blog dropdown */}
          <div className="relative" ref={blogMenuRef}>
            <button
              type="button"
              onClick={() => setBlogOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={blogOpen}
              aria-controls="mk-blog-menu"
              className="group inline-flex items-center gap-2 bg-[#0f766e] text-white hover:bg-white hover:text-black border border-transparent hover:border-black py-2 px-4 rounded-full shadow-sm hover:shadow-lg transform-gpu will-change-transform transition-all duration-200 motion-reduce:transition-none hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
            >
              <Newspaper size={16} aria-hidden className="transition-colors duration-200 motion-reduce:transition-none group-hover:text-black" />
              <span className="transition-colors duration-200 motion-reduce:transition-none group-hover:text-black">Blog</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`transition-transform duration-200 motion-reduce:transition-none ${blogOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div
              id="mk-blog-menu"
              role="menu"
              aria-label="Blog menu"
              className={`absolute right-0 mt-2 w-56 rounded-lg border border-[#115e59] bg-[#0f766e] text-white shadow-xl backdrop-blur-sm transition-all duration-200 ease-out motion-reduce:transition-none transform origin-top-right ${blogOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            >
              <Link
                href="/blog"
                role="menuitem"
                data-analytics="nav_blog_internal"
                className="block px-4 py-2.5 text-white hover:bg:white hover:text-black focus:bg:white focus:text-black focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 transition-colors duration-150"
                onClick={() => setBlogOpen(false)}
              >
                Internal blog
              </Link>
              <a
                href="https://substack.com/@ofroot/posts"
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                data-analytics="nav_blog_substack"
                className="block px-4 py-2.5 text-white hover:bg:white hover:text-black focus:bg:white focus:text-black focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 transition-colors duration-150"
                onClick={() => setBlogOpen(false)}
              >
                Substack
              </a>
            </div>
          </div>
          <a href="https://form.jotform.com/252643426225151" target="_blank" rel="noopener noreferrer" className="bg-[#0f766e] text-white py-2 md:py-3 px-10 md:px-14 rounded-full tracking-wide shadow-sm min-w-[140px] md:min-w-[180px] inline-flex items-center justify-center gap-3 text-center hover:bg-[#115e59] transition-transform transform-gpu hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#0f766e]">
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
      <div aria-live="polite" className="sr-only">{liveMessage}</div>
      <div
        onClick={() => toggleMenu(false)}
        role="presentation"
        aria-hidden={!open}
        className={`fixed inset-0 nav-backdrop-teal transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
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
          <Link href="/marketing" onClick={() => toggleMenu(false)} className="text-gray-700">Home</Link>
          <a href="https://form.jotform.com/252643454932157" target="_blank" rel="noopener noreferrer" onClick={() => toggleMenu(false)} className="text-gray-700">Waitlist</a>
          {/* Blog group in mobile */}
          <div className="pt-1">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Blog</div>
            <Link href="/blog" onClick={() => toggleMenu(false)} className="text-gray-700 block py-1">Internal blog</Link>
            <a href="https://substack.com/@ofroot/posts" target="_blank" rel="noopener noreferrer" onClick={()=> toggleMenu(false)} className="text-gray-700 block py-1">Substack</a>
          </div>
          <a href="https://form.jotform.com/252643426225151" target="_blank" rel="noopener noreferrer" onClick={() => toggleMenu(false)} className="text-gray-700">Contact</a>
        </div>
      </div>
    </header>
  );
}
