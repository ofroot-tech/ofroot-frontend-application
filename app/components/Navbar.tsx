'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X, Cog, Star, PlayCircle, CheckCircle, BookOpen, ExternalLink, Mail, MessageCircle, Home } from 'lucide-react';
import { useEffect as ReactUseEffect } from 'react';
import { useLiquidOpen } from '@/app/lib/ui/useLiquidOpen';

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
  // Render navbar on all pages by default. Certain layouts (like /landing/*)
  // intentionally omit the global navbar; detect and hide for those paths.
  // Also hide on dashboard routes so the dashboard's internal sidebar/header isn't occluded.
  const shouldRenderNav = !normalized.startsWith('/landing') && !normalized.startsWith('/dashboard');

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const overlayPanelRef = useLiquidOpen(visible, {
    spring: { stiffness: 420, damping: 36 },
    mode: open ? 'open' : 'close',
    shape: 'roundedRect',
    borderRadius: 24, // match md:rounded-3xl
    // Let LiquidOpen compute center from bounds (slightly top-biased by default)
  }) as unknown as React.RefObject<HTMLDivElement>;

  const toggleMenu = (next = !open) => {
    setOpen(next);
    setLiveMessage(next ? 'Navigation opened' : 'Navigation closed');
  };

  // Keep overlay mounted briefly to play close animation
  useEffect(() => {
    if (open) {
      setVisible(true);
      return;
    }
    const t = setTimeout(() => setVisible(false), 220);
    return () => clearTimeout(t);
  }, [open]);

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
      document.body.classList.add('ofroot-nav-fading');
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.body.classList.remove('ofroot-nav-fading');
      previouslyFocused.current?.focus?.();
      previouslyFocused.current = null;
    };
  }, [open]);

  // Top-fixed header with high z-index so it sits above hero
  // Slightly reduced z-index and tighter header for a less dominant global navbar
  const headerClass = `fixed top-0 left-0 right-0 z-[9999] isolate pointer-events-auto nav-header-gradient border-transparent will-change-transform transform-gpu`;
  // no-op: useLiquidOpen handles animation lifecycle

  const navItems: NavItem[] = (() => {
    const items: NavItem[] = [];
    if (pathname !== '/') items.push({ label: 'Home', href: '/', icon: Home });
    if (pathname === '/') {
      items.push({ label: 'Services', href: '#services', icon: Cog });
      items.push({ label: 'Featured', href: '#featured', icon: Star });
      items.push({ label: 'How it works', href: '#how', icon: PlayCircle });
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

  const NavButton = ({ item, i, openState }: { item: NavItem; i: number; openState: boolean }) => {
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
        className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg font-semibold text-gray-900 shadow-lg ring-1 ring-black/5 transition-all duration-300 ease-out hover:bg-[#20b2aa] hover:text-white hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#20b2aa] focus:ring-offset-2 flex items-center justify-center gap-2 ${openState ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
        style={{ transform: 'scale(var(--press-scale, 1))', willChange: 'transform', transitionDelay: `${i * 50}ms` }}
      >
        <item.icon size={24} className="sm:w-6 sm:h-6 w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">{item.label}</span>
      </button>
    );
  };

  if (!shouldRenderNav) {
    return null;
  }

  return (
    <header role="banner" className={`${headerClass} h-12 md:h-14 transition-all duration-300`}>
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="OfRoot homepage">
            <Image
              src="/ofroot-logo.png"
              alt="OfRoot logo"
              width={48}
              height={48}
              priority
              className="h-9 w-9 rounded-full object-cover transition-transform duration-120 ease-out hover:scale-102 active:scale-95 focus:scale-95 focus:outline-none focus:ring-2 focus:ring-[#20b2aa] md:h-12 md:w-12"
            />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => toggleMenu()}
          className={`relative z-[100000] h-9 w-9 rounded-full nav-hamburger bg-white/80 text-gray-900 shadow-sm ring-1 ring-black/5 transition hover:border-white/60 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#20b2aa] ${open ? 'animate-[nav-rotate_600ms_ease-in-out_forwards] opacity-0 pointer-events-none' : ''}`}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="ofroot-nav-overlay"
        >
          <span className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out ${open ? 'rotate-180' : 'rotate-0'}`}>
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
        aria-hidden={!visible}
        className={`fixed inset-0 nav-backdrop-teal transition-opacity duration-700 ease-in-out ${visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        style={{ willChange: 'opacity', transitionTimingFunction: 'cubic-bezier(.16,.84,.2,1)' }}
      />

      <div
        id="ofroot-nav-overlay"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-hidden={!visible}
  className={`fixed inset-0 z-[100001] flex items-center justify-center transition-opacity duration-300 ${visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <div className={`absolute inset-0 bg-white/80 backdrop-blur-xl transition-transform duration-300 hidden md:block ${open ? 'translate-y-0' : 'translate-y-6'}`} />
        <div
          ref={overlayPanelRef}
          className={`relative z-[100002] mx-auto flex w-full h-full md:h-auto md:min-h-[60vh] md:max-w-xl flex-col items-center justify-center gap-6 px-6 md:px-6 py-8 md:py-0 pt-safe text-center transition-all duration-300 ${open ? 'modal-lowered translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} bg-white/85 backdrop-blur-xl md:bg-transparent md:backdrop-blur-0`}
        >
          <div className="mx-auto w-full max-w-none md:max-w-sm rounded-none md:rounded-3xl md:border md:border-gray-100 md:bg-white/70 p-0 md:p-5 shadow-none md:shadow-2xl ring-0 md:ring-1 md:ring-black/5 backdrop-blur-0 md:backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              {navItems.map((item, idx) => (
                <NavButton key={item.label} item={item} i={idx} openState={open} />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleMenu(false)}
            className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#20b2aa]"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
