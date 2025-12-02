"use client";

import { useEffect } from "react";

/**
 * SectionSnapper
 * 
 * Progressive reveal effect for full-screen sections:
 * - At 10% scroll into section: 10% visible (clipped 90%)
 * - At 80% scroll into section: 100% visible
 * - Uses CSS custom property --section-progress for smooth transitions
 * 
 * Usage: 
 * - Container: id="home-snap" className="snap-page"
 * - Sections: data-snap-section className="section-full snap-fade"
 */
export default function SectionSnapper({ containerId }: { containerId: string }) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
     * Progress maps: 10% in view -> 0% visible, 80% in view -> 100% visible
     */
    const updateSectionProgress = () => {
      const containerRect = container.getBoundingClientRect();
      const containerHeight = containerRect.height;

      sections.forEach((section, idx) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top - containerRect.top;
        const sectionHeight = rect.height;
        
        // How much of the section has scrolled into view (0 to 1)
        const scrolledIntoView = 1 - (sectionTop / containerHeight);
        
        // Map: 0.1 (10%) -> 0 progress, 0.8 (80%) -> 1 progress
        // Linear interpolation: progress = (scrolledIntoView - 0.1) / 0.7
        let progress: number;
        
        if (prefersReducedMotion) {
          // For reduced motion, snap to visible at 50%
          progress = scrolledIntoView >= 0.5 ? 1 : 0;
        } else {
          progress = Math.max(0, Math.min(1, (scrolledIntoView - 0.1) / 0.7));
        }
        
        // Update CSS custom property for smooth opacity/clip transitions
        section.style.setProperty('--section-progress', progress.toString());
        
        // Update state classes for any CSS that relies on them
        section.classList.remove('is-active', 'is-past', 'is-future');
        
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

    // Throttled scroll handler for performance
    let ticking = false;
    const onScroll = () => {
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

    // Listen to scroll on the container
    container.addEventListener('scroll', onScroll, { passive: true });
    
    // Also handle resize
    window.addEventListener('resize', updateSectionProgress, { passive: true });

    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateSectionProgress);
    };
  }, [containerId]);

  return null;
}
