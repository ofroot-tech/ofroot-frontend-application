"use client";

import { useEffect } from "react";

/**
 * SmoothAnchorScroll
 * Intercepts same-page hash links and performs a smooth scroll inside the
 * nearest `.snap-page` container. Temporarily disables snapping to avoid
 * clunky jumps, then re-enables when the target is reached.
 */
export default function SmoothAnchorScroll() {
  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      const t = ev.target as Element | null;
      if (!t) return;
      const a = t.closest('a');
      if (!a) return;

      const href = a.getAttribute('href') || '';
      // Only handle local hash links like "#features"
      if (!href || !href.startsWith('#')) return;

      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      // Use the nearest .snap-page container if present
      let container: HTMLElement | Window = window;
      let p: HTMLElement | null = target.parentElement;
      while (p) {
        if (p.classList.contains('snap-page')) { container = p; break; }
        p = p.parentElement;
      }

      ev.preventDefault();

      // Temporarily disable snapping during the smooth scroll
      if (container instanceof HTMLElement) {
        container.classList.add('snap-disabled');
      } else {
        // document scrolling is already smooth via html { scroll-behavior: smooth }
      }

      const finish = () => {
        if (container instanceof HTMLElement) {
          container.classList.remove('snap-disabled');
        }
      };

      // Scroll into view; scroll-margin on target (e.g., .scroll-target) is respected
      try {
        target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      } catch {
        // Fallback for older browsers
        const y = target.getBoundingClientRect().top + (container instanceof HTMLElement ? container.scrollTop : window.scrollY);
        if (container instanceof HTMLElement) container.scrollTo({ top: y, behavior: 'smooth' });
        else window.scrollTo({ top: y, behavior: 'smooth' });
      }

      // Re-enable snap shortly after (and also on stability check)
      let rafId = 0; let timeoutId = 0;
      const checkSettle = () => {
        const rect = target.getBoundingClientRect();
        const nearTop = Math.abs(rect.top - (container instanceof HTMLElement ? container.getBoundingClientRect().top : 0)) < 2;
        if (nearTop) {
          finish();
        } else {
          rafId = window.requestAnimationFrame(checkSettle);
        }
      };
      rafId = window.requestAnimationFrame(checkSettle);
      timeoutId = window.setTimeout(finish, 1000);

      const cleanup = () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (timeoutId) clearTimeout(timeoutId);
        finish();
      };

      // As a safety, re-enable on user wheel/touch interactions too
      const onUserInput = () => cleanup();
      window.addEventListener('wheel', onUserInput, { once: true, passive: true });
      window.addEventListener('touchstart', onUserInput, { once: true, passive: true });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
