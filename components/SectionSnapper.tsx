"use client";

import { useEffect } from "react";

/**
 * SectionSnapper
 * Adds fade states to full-screen sections inside a scroll container.
 * Usage: wrap page sections with a container that has id, e.g., id="ontask-snap" and className="snap-page".
 * Mark each section with data-snap-section and className "section-full snap-fade".
 */
export default function SectionSnapper({ containerId }: { containerId: string }) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>('[data-snap-section]')
    );
  if (!sections.length) return;

  // Initialize states: mark first as active instantly to avoid flash
  sections.forEach((s, idx) => s.classList.add(idx === 0 ? 'is-active' : 'is-future'));

    const io = new IntersectionObserver(
      (entries) => {
        // Find most visible section
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (!best) return;

        const active = best.target as HTMLElement;
        // Mark sections before active as past, after as future
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
      {
        root: container,
        threshold: [0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [containerId]);

  return null;
}
