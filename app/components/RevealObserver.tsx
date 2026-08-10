"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Globally observes the legacy `.reveal-in` contract and the progressive
 * `.motion-reveal` contract. New motion content stays visible until this
 * observer marks the document ready, so JavaScript is never required to read
 * the page.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal-in, .motion-reveal'));
    const reveal = (element: HTMLElement) => element.classList.add('in-view');

    if (!elements.length) {
      document.documentElement.dataset.motionReady = 'true';
      return;
    }

    if (mediaQuery.matches || typeof IntersectionObserver === 'undefined') {
      elements.forEach(reveal);
      document.documentElement.dataset.motionReady = 'true';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -12% 0px' }
    );

    elements.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      if (bounds.top <= window.innerHeight * 0.92 && bounds.bottom >= 0) reveal(element);
      else observer.observe(element);
    });

    document.documentElement.dataset.motionReady = 'true';

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      observer.disconnect();
      elements.forEach(reveal);
    };
    mediaQuery.addEventListener?.('change', handleMotionPreference);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener?.('change', handleMotionPreference);
    };
  }, [pathname]);

  return null;
}
