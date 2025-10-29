"use client";

import { useEffect } from "react";

/**
 * LoadingOnClickManager
 * Adds a temporary loading state to elements with the class `loading-on-click`.
 * - Skips pure hash links (href starts with '#')
 * - Removes the state on pagehide or after a timeout fallback
 */
export default function LoadingOnClickManager({ timeoutMs = 2500 }: { timeoutMs?: number }) {
  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      const el = (ev.target as Element | null)?.closest<HTMLElement>('.loading-on-click');
      if (!el) return;
      const anchor = el.matches('a') ? (el as HTMLAnchorElement) : el.closest('a');
      const href = anchor?.getAttribute('href') || '';
      if (href && href.startsWith('#')) return; // skip pure hash

      el.classList.add('is-loading');
      el.setAttribute('aria-busy', 'true');
      el.style.pointerEvents = 'none';

      const clear = () => {
        el.classList.remove('is-loading');
        el.removeAttribute('aria-busy');
        el.style.pointerEvents = '';
      };

      // clear on navigation or after fallback timeout
      const onHide = () => { clear(); window.removeEventListener('pagehide', onHide); };
      window.addEventListener('pagehide', onHide, { once: true });
      const t = window.setTimeout(() => { clear(); window.removeEventListener('pagehide', onHide); }, timeoutMs);
      // also clear on user escape
      window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { clear(); } }, { once: true });

      // Prevent duplicate handlers
      setTimeout(() => window.clearTimeout(t), timeoutMs + 100);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [timeoutMs]);

  return null;
}
