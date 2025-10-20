'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X, Cog, Star, PlayCircle, CheckCircle, BookOpen, ExternalLink, Mail, MessageCircle, Home } from 'lucide-react';

type NavItem = {
  label: string;
  href?: string;
  external?: boolean;
  chat?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

export default function Navbar() {
  const pathname = (usePathname() ?? '/') || '/';
  const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  // Show navbar on home and blog pages
  const showNavOnThesePages = new Set<string>(['/', '/blog']);
  const shouldRenderNav = showNavOnThesePages.has(normalized);

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const toggleMenu = (next = !open) => {
    setOpen(next);
    setLiveMessage(next ? 'Navigation opened' : 'Navigation closed');
  };

  // focus trap & body scroll lock
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
          container.querySelectorAll<HTMLElement>('button,a[href]')
        ).filter((el) => !el.hasAttribute('disabled'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
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
        const focusable = container.querySelectorAll<HTMLElement>('button,a[href]');
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

  // Top-fixed header with high z-index so it sits above hero
  const headerClass = 'fixed top-0 left-0 right-0 z-[99999] isolate pointer-events-auto bg-white/95 backdrop-blur-sm border-b border-gray-100 will-change-transform transform-gpu';

  const navItems: NavItem[] = (() => {
    const items: NavItem[] = [];
    if (pathname !== '/') items.push({ label: 'Home', href: '/', icon: Home });
    if (pathname === '/') {
      items.push({ label: 'Services', href: '#services', icon: Cog });
      items.push({ label: 'Featured', href: '#featured', icon: Star });
      items.push({ label: 'How it works', href: '#how', icon: PlayCircle });
      items.push({ label: 'Proof', href: '#proof', icon: CheckCircle });
    }
  items.push({ label: 'Blog', href: '/blog', icon: BookOpen });
  items.push({ label: 'Substack', href: 'https://substack.com/@ofroot/posts', external: true, icon: ExternalLink });
  // Route contact to external JotForm per sales flow
  items.push({ label: 'Contact', href: 'https://form.jotform.com/252643426225151', external: true, icon: Mail });
    items.push({ label: 'Chat with OfRoot', chat: true, icon: MessageCircle });
    return items;
  })();

  const handleNavClick = (item: NavItem) => {
    if (item.chat) {
      window.dispatchEvent(new CustomEvent('ofroot:chat-open'));
      toggleMenu(false);
      return;
    }

    if (item.external && item.href) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      toggleMenu(false);
      return;
    }

    if (item.href?.startsWith('#')) {
      toggleMenu(false);
      if (pathname === '/') {
        const target = document.querySelector(item.href);
        if (target) {
          setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
        }
      } else {
        router.push(`/${item.href}`);
      }
      return;
    }

    toggleMenu(false);
    if (item.href) {
      router.push(item.href);
    }
  };

  const NavButton = ({ item }: { item: NavItem }) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
  const frame = useRef<number | null>(null);

    const animateScale = (scale: number) => {
      if (!buttonRef.current) return;
      buttonRef.current.style.setProperty('--press-scale', scale.toString());
    };

    const handleMove = (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const dist = Math.sqrt(x * x + y * y);
      const scale = Math.max(0.9, 1 - dist * 0.12);
  if (frame.current !== null) cancelAnimationFrame(frame.current);
  frame.current = requestAnimationFrame(() => animateScale(scale));
    };

    const resetScale = () => {
  if (frame.current !== null) cancelAnimationFrame(frame.current);
  frame.current = null;
      animateScale(1);
    };

    return (
      <button
        ref={buttonRef}
        key={item.label}
        type="button"
        onClick={() => handleNavClick(item)}
        onMouseMove={handleMove}
        onMouseLeave={resetScale}
        onBlur={resetScale}
        onFocus={() => animateScale(0.95)}
        aria-label={item.label}
        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 px-4 py-2 sm:px-6 sm:py-3 text-lg font-semibold text-gray-900 shadow-lg transition-all duration-300 ease-out hover:bg-[#20b2aa] hover:text-white hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#20b2aa] focus:ring-offset-2 flex items-center justify-center gap-2"
        style={{ transform: 'scale(var(--press-scale, 1))', willChange: 'transform' }}
      >
        <item.icon size={24} className="sm:w-6 sm:h-6 w-5 h-5" />
        <span className="hidden md:inline text-sm font-medium">{item.label}</span>
      </button>
    );
  };

  if (!shouldRenderNav) {
    return null;
  }

  return (
    <header role="banner" className={`${headerClass} h-14 md:h-16 transition-all duration-300`}>
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="OfRoot homepage">
            <Image
              src="/ofroot-logo.png"
              alt="OfRoot logo"
              width={64}
              height={64}
              priority
              className="h-10 w-10 rounded-full object-cover transition-transform duration-150 ease-out hover:scale-105 active:scale-95 focus:scale-95 focus:outline-none focus:ring-2 focus:ring-[#20b2aa] md:h-16 md:w-16"
            />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => toggleMenu()}
          className="relative z-[100000] h-10 w-10 rounded-full border border-gray-300 bg-white text-gray-900 shadow-sm transition hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#20b2aa]"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="ofroot-nav-overlay"
        >
          <span className={`absolute inset-0 flex items-center justify-center transition-transform duration-200`}>
            {open ? (
              <X size={20} />
            ) : (
              <span className="grid grid-cols-2 grid-rows-2 gap-[3px]">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <span
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    className="h-2 w-2 rounded-full bg-gray-900 transition-transform duration-200"
                  />
                ))}
              </span>
            )}
          </span>
        </button>
      </div>

      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      <div
        onClick={() => toggleMenu(false)}
        role="presentation"
        aria-hidden={!open}
        className={`fixed inset-0 bg-gray-600/50 transition-opacity duration-300 ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <div
        id="ofroot-nav-overlay"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed inset-0 z-[99990] flex items-center justify-center transition-opacity duration-300 ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <div className={`absolute inset-0 bg-white/80 backdrop-blur-xl transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-6'}`} />
        <div
          className={`relative z-10 mx-auto flex max-w-lg flex-col items-stretch gap-6 px-6 text-center transition-all duration-300 ${open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
        >
          <button
            type="button"
            onClick={() => toggleMenu(false)}
            className="self-end mb-4 rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#20b2aa]"
            aria-label="Close navigation"
          >
            <X size={24} />
          </button>
          <div className="grid grid-cols-2 gap-4">
            {navItems.map((item) => (
              <NavButton key={item.label} item={item} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
