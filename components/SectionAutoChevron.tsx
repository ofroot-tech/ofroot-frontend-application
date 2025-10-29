"use client";

import { useEffect } from "react";

/**
 * SectionAutoChevron
 * Automatically injects a glowing chevron link at the bottom of every
 * `[data-snap-section]` within each `.snap-page` container. Links scroll to the
 * next section's id. If a section lacks an id, one is generated.
 */
export default function SectionAutoChevron() {
  useEffect(() => {
    // Prefer explicit snap containers; if none found, fall back to all <section> elements in the document
    const snapContainers = Array.from(document.querySelectorAll<HTMLElement>('.snap-page'));

    type ContainerSpec = { container: HTMLElement; sections: HTMLElement[] };
    const all: ContainerSpec[] = [];

    if (snapContainers.length) {
      snapContainers.forEach((container) => {
        const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-snap-section]'));
        if (sections.length) all.push({ container, sections });
      });
    } else {
      // Fallback: use all <section> elements on the page
      const sections = Array.from(document.querySelectorAll<HTMLElement>('section'));
      if (sections.length) all.push({ container: document.body, sections });
    }

    all.forEach(({ sections }, cIdx) => {
      // Ensure each section has an id and acts as positioning context
      sections.forEach((s, i) => {
        if (!s.id) s.id = `section-${cIdx + 1}-${i + 1}`;
        try {
          const pos = getComputedStyle(s).position;
          if (!pos || pos === 'static') s.style.position = 'relative';
        } catch {}
      });

      sections.forEach((s, i) => {
        // If a manual scroll indicator already exists in this section (e.g., hero chevron),
        // skip auto-injection to avoid duplicates.
        if (s.querySelector('.scroll-indicator')) {
          return;
        }
        const isFirst = i === 0;
        const isLast = i === sections.length - 1;

        // Remove any old injected chevrons from previous implementations
        s.querySelectorAll('[data-auto-chevron], [data-auto-chevron-prev], [data-auto-chevron-stack]')
          .forEach((el) => el.remove());

        // Create a single stacked container at the end of each section
        const stack = document.createElement('div');
        stack.className = 'section-chevron-stack';
        stack.setAttribute('data-auto-chevron-stack', '1');

        // Up chevron (to previous section), hidden for first section by CSS
        if (!isFirst) {
          const prev = sections[i - 1];
          const up = document.createElement('a');
          up.href = `#${prev.id}`;
          up.className = 'scroll-indicator chevron-up';
          up.setAttribute('aria-label', 'Previous section');
          up.innerHTML = `
            <span class="chevron-disc" aria-hidden="true"></span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="6 15 12 9 18 15"></polyline>
            </svg>
          `;
          stack.appendChild(up);
        }

        // Down chevron (to next section), hidden for last section by CSS
        if (!isLast) {
          const next = sections[i + 1];
          const down = document.createElement('a');
          down.href = `#${next.id}`;
          down.className = 'scroll-indicator chevron-down';
          down.setAttribute('aria-label', 'Next section');
          down.innerHTML = `
            <span class="chevron-disc" aria-hidden="true"></span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          `;
          stack.appendChild(down);
        }

        s.appendChild(stack);
      });
    });
  }, []);

  return null;
}
