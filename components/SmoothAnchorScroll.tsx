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
    let cancelScroll: (() => void) | undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onClick = (ev: MouseEvent) => {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      const t = ev.target as Element | null;
      if (!t) return;
      const a = t.closest('a');
      if (!a || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;

      const href = a.getAttribute('href') || '';
      // Only handle local hash links like "#features"
      if (!href || !href.startsWith('#')) return;

      let id: string;
      try { id = decodeURIComponent(href.slice(1)); } catch { return; }
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
      cancelScroll?.();

      // Temporarily disable snapping during the smooth scroll
      if (container instanceof HTMLElement) {
        container.classList.add('snap-disabled');
      }

      let timeoutId: number | undefined;
      const finish = () => {
        window.clearTimeout(timeoutId);
        container.removeEventListener('scrollend', finish);
        window.removeEventListener('wheel', finish);
        window.removeEventListener('touchstart', finish);
        reducedMotion.removeEventListener('change', onMotionChange);
        if (container instanceof HTMLElement) {
          container.classList.remove('snap-disabled');
        }
        if (cancelScroll === finish) cancelScroll = undefined;
      };

      const scrollToTarget = (behavior: ScrollBehavior) => {
        try {
          target.scrollIntoView({ behavior, block: 'start', inline: 'nearest' });
        } catch {
          const margin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
          const containerTop = container instanceof HTMLElement ? container.getBoundingClientRect().top + container.clientTop : 0;
          const y = target.getBoundingClientRect().top - containerTop - margin + (container instanceof HTMLElement ? container.scrollTop : window.scrollY);
          container.scrollTo({ top: y, behavior });
        }
      };

      const onMotionChange = () => {
        if (reducedMotion.matches) {
          scrollToTarget('instant');
          finish();
        }
      };

      cancelScroll = finish;
      container.addEventListener('scrollend', finish, { once: true });
      window.addEventListener('wheel', finish, { once: true, passive: true });
      window.addEventListener('touchstart', finish, { once: true, passive: true });
      reducedMotion.addEventListener('change', onMotionChange);
      // A bounded fallback also covers targets with scroll margins and browsers without scrollend.
      timeoutId = window.setTimeout(finish, 1000);
      scrollToTarget(reducedMotion.matches ? 'instant' : 'smooth');
      if (reducedMotion.matches) finish();
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      cancelScroll?.();
    };
  }, []);

  return null;
}
