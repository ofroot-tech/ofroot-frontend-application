"use client";

import { useEffect } from "react";

/**
 * SectionSnapperAll
 * 
 * Finds all containers with class "snap-page" and attaches progressive reveal behavior.
 * Skips containers already mounted (data-snap-mounted="1").
 * 
 * Progressive reveal: 
 * - At 10% scroll into section: 10% visible
 * - At 80% scroll into section: 100% visible
 */
export default function SectionSnapperAll() {
  useEffect(() => {
    const containers = Array.from(document.querySelectorAll<HTMLElement>('.snap-page'));
    const cleanups: Array<() => void> = [];
    const scrollTimers = new WeakMap<EventTarget, number>();

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    containers.forEach((container) => {
      if (container.dataset.snapMounted === '1') return;
      container.dataset.snapMounted = '1';

      const sections = Array.from(
        container.querySelectorAll<HTMLElement>('[data-snap-section]')
      );
      if (!sections.length) return;

      // Initialize: first section fully visible, others will be revealed on scroll
      sections.forEach((s, idx) => {
        if (idx === 0) {
          s.style.setProperty('--section-progress', '1');
          s.classList.add('is-active');
        } else {
          s.style.setProperty('--section-progress', '0');
          s.classList.add('is-future');
        }
      });

      /**
       * Calculate section visibility progress based on scroll position
       */
      const updateSectionProgress = () => {
        const containerRect = container.getBoundingClientRect();
        const containerHeight = containerRect.height;

        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top - containerRect.top;
          
          // How much of the section has scrolled into view (0 to 1)
          const scrolledIntoView = 1 - (sectionTop / containerHeight);
          
          // Map: 0.1 (10%) -> 0 progress, 0.8 (80%) -> 1 progress
          let progress: number;
          
          if (prefersReducedMotion) {
            progress = scrolledIntoView >= 0.5 ? 1 : 0;
          } else {
            progress = Math.max(0, Math.min(1, (scrolledIntoView - 0.1) / 0.7));
          }
          
          section.style.setProperty('--section-progress', progress.toString());
          
          section.classList.remove('is-active', 'is-past', 'is-future', 'is-entering');
          
          if (progress >= 0.9) {
            section.classList.add('is-active');
          } else if (progress > 0) {
            section.classList.add('is-entering');
          } else if (sectionTop < 0) {
            section.classList.add('is-past');
          } else {
            section.classList.add('is-future');
          }
        });
      };

      // Throttled scroll handler
      let ticking = false;
      const onScroll = () => {
        // Animate scrollbar color briefly
        try {
          container.classList.add('is-scrolling');
          const prev = scrollTimers.get(container);
          if (prev) window.clearTimeout(prev);
          const id = window.setTimeout(() => {
            container.classList.remove('is-scrolling');
          }, 900);
          scrollTimers.set(container, id);
        } catch {}

        // Update section progress
        if (!ticking) {
          requestAnimationFrame(() => {
            updateSectionProgress();
            ticking = false;
          });
          ticking = true;
        }
      };

      // Initial calculation
      updateSectionProgress();

      container.addEventListener('scroll', onScroll, { passive: true });

      // Smoothly chain scrolling to the outer document when reaching container boundaries
      const onWheel = (e: WheelEvent) => {
        const atTop = container.scrollTop <= 0;
        const atBottom = Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight;
        if (e.deltaY > 0 && atBottom) {
          try { window.scrollBy({ top: e.deltaY, behavior: 'smooth' }); } catch {}
        } else if (e.deltaY < 0 && atTop) {
          try { window.scrollBy({ top: e.deltaY, behavior: 'smooth' }); } catch {}
        }
      };
      container.addEventListener('wheel', onWheel, { passive: true });

      // Touch support for chaining on mobile
      let touchStartY = 0;
      const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0]?.clientY ?? 0; };
      const onTouchMove = (e: TouchEvent) => {
        const currentY = e.touches[0]?.clientY ?? touchStartY;
        const dy = touchStartY - currentY;
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

      // Resize handler
      window.addEventListener('resize', updateSectionProgress, { passive: true });

      cleanups.push(() => {
        container.removeEventListener('scroll', onScroll);
        container.removeEventListener('wheel', onWheel);
        container.removeEventListener('touchstart', onTouchStart);
        container.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('resize', updateSectionProgress);
        const prev = scrollTimers.get(container);
        if (prev) window.clearTimeout(prev);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
