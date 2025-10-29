"use client";

import { useEffect } from "react";

/**
 * SectionSnapperAll
 * Finds all containers with class "snap-page" and attaches the snap/fade behavior.
 * Skips containers already mounted (data-snap-mounted="1").
 */
export default function SectionSnapperAll() {
  useEffect(() => {
    const containers = Array.from(document.querySelectorAll<HTMLElement>('.snap-page'));
    const cleanups: Array<() => void> = [];
    const scrollTimers = new WeakMap<EventTarget, number>();

    containers.forEach((container) => {
      if (container.dataset.snapMounted === '1') return;
      container.dataset.snapMounted = '1';

      const sections = Array.from(
        container.querySelectorAll<HTMLElement>('[data-snap-section]')
      );
      if (!sections.length) return;

      // Initialize states
      sections.forEach((s, idx) => {
        s.classList.add(idx === 0 ? 'is-active' : 'is-future');
      });

      const io = new IntersectionObserver(
        (entries) => {
          // determine the most visible section within this container
          let best: IntersectionObserverEntry | null = null;
          for (const e of entries) {
            if (e.rootBounds && e.intersectionRatio > 0) {
              if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
            }
          }
          if (!best) return;
          const active = best.target as HTMLElement;
          let past = true;
          for (const s of sections) {
            s.classList.remove('is-active', 'is-past', 'is-future');
            if (s === active) {
              s.classList.add('is-active');
              past = false;
            } else if (past) {
              s.classList.add('is-past');
            } else {
              s.classList.add('is-future');
            }
          }
        },
        { root: container, threshold: [0.25, 0.5, 0.75, 1] }
      );

      sections.forEach((s) => io.observe(s));
      // Animate scrollbar color briefly when the user scrolls this container
      const onScroll = () => {
        try {
          container.classList.add('is-scrolling');
          const prev = scrollTimers.get(container);
          if (prev) window.clearTimeout(prev);
          const id = window.setTimeout(() => {
            container.classList.remove('is-scrolling');
          }, 900);
          scrollTimers.set(container, id);
        } catch {}
      };
      container.addEventListener('scroll', onScroll, { passive: true });

      // Smoothly chain scrolling to the outer document when reaching container boundaries
      const onWheel = (e: WheelEvent) => {
        const atTop = container.scrollTop <= 0;
        const atBottom = Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight;
        if (e.deltaY > 0 && atBottom) {
          // Continue scrolling the page when the inner container is at the bottom
          try { window.scrollBy({ top: e.deltaY, behavior: 'smooth' }); } catch {}
        } else if (e.deltaY < 0 && atTop) {
          // Continue scrolling the page when the inner container is at the top
          try { window.scrollBy({ top: e.deltaY, behavior: 'smooth' }); } catch {}
        }
      };
      container.addEventListener('wheel', onWheel, { passive: true });

      // Touch support for chaining on mobile
      let touchStartY = 0;
      const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0]?.clientY ?? 0; };
      const onTouchMove = (e: TouchEvent) => {
        const currentY = e.touches[0]?.clientY ?? touchStartY;
        const dy = touchStartY - currentY; // positive when swiping up (scrolling down)
        const atTop = container.scrollTop <= 0;
        const atBottom = Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight;
        if (dy > 0 && atBottom) {
          try { window.scrollBy({ top: dy, behavior: 'smooth' }); } catch {}
        } else if (dy < 0 && atTop) {
          try { window.scrollBy({ top: dy, behavior: 'smooth' }); } catch {}
        }
      };
      container.addEventListener('touchstart', onTouchStart, { passive: true });
      container.addEventListener('touchmove', onTouchMove, { passive: true });
      cleanups.push(() => {
        container.removeEventListener('scroll', onScroll);
        container.removeEventListener('wheel', onWheel);
        container.removeEventListener('touchstart', onTouchStart);
        container.removeEventListener('touchmove', onTouchMove);
        const prev = scrollTimers.get(container);
        if (prev) window.clearTimeout(prev);
      });
      cleanups.push(() => io.disconnect());
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
