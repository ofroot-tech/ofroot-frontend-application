"use client";

import * as React from 'react';

/**
 * AlphaTextReveal
 * - Adds alphabetical, staggered reveal to paragraph TEXT at the character level.
 * - Within each <p>, characters are revealed by their alphabetical rank: A..Z first → last.
 * - Characters in the same rank (e.g., all 'a') get a micro-stagger so they don't pop in at once.
 * - Non-letters (digits, punctuation, spaces) appear after letters by default.
 * - Config via:
 *   - props: stagger (ms between ranks), withinStagger (micro-delay within same rank), baseDelay
 *   - CSS vars (overridable): --alpha-char-duration, --alpha-ease
 */
export default function AlphaTextReveal({
  stagger = 70,
  withinStagger = 12,
  baseDelay = 40,
}: {
  stagger?: number; // ms between alphabetical ranks (a..z)
  withinStagger?: number; // ms between characters in the same rank
  baseDelay?: number; // starting delay per container/paragraph set
}) {
  React.useEffect(() => {
    // Only operate on explicitly opted-in containers to avoid interfering with pages like the homepage/Vanta
    const containers = Array.from(document.querySelectorAll<HTMLElement>('.alpha-scope'));

    const isLetter = (c: string) => /[a-z]/i.test(c);
    const rankOf = (c: string) => {
      if (!isLetter(c)) return 27; // non-letters after A..Z
      const r = c.toLowerCase().charCodeAt(0) - 97; // 0..25
      return r >= 0 && r <= 25 ? r : 27;
    };

    const wrapTextNodes = (node: Node, perRankCounters: number[]) => {
      // Recursively process text nodes, leaving existing markup intact (a, strong, etc.)
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? '';
        const frag = document.createDocumentFragment();
        // Build words (sequences of non-whitespace) so wrapping only occurs between words.
        let i = 0;
        while (i < text.length) {
          const ch = text[i];
          if (ch === ' ' || ch === '\n' || ch === '\t') {
            // Preserve whitespace as real text nodes so normal wrapping occurs at spaces only
            frag.appendChild(document.createTextNode(ch));
            i++;
            continue;
          }
          // Accumulate a word (contiguous non-whitespace)
          let j = i;
          while (j < text.length && !(/\s/.test(text[j]))) j++;
          const word = text.slice(i, j);
          const wordSpan = document.createElement('span');
          wordSpan.className = 'alpha-word';
          // Wrap each character in the word
          for (let k = 0; k < word.length; k++) {
            const c = word[k];
            const span = document.createElement('span');
            span.className = 'alpha-char';
            span.textContent = c;
            const r = rankOf(c);
            const indexInRank = perRankCounters[r] || 0;
            perRankCounters[r] = indexInRank + 1;
            const delay = baseDelay + r * stagger + indexInRank * withinStagger;
            span.style.setProperty('--alpha-delay', `${delay}ms`);
            wordSpan.appendChild(span);
          }
          frag.appendChild(wordSpan);
          i = j;
        }
        node.parentNode?.replaceChild(frag, node);
        return;
      }
      // Recurse children for element nodes
      const childNodes = Array.from(node.childNodes);
      childNodes.forEach((n) => wrapTextNodes(n, perRankCounters));
    };

    const apply = (el: HTMLElement) => {
      el.classList.add('alpha-reveal');
      const paras = Array.from(el.querySelectorAll<HTMLParagraphElement>('p'));
      if (!paras.length) return;

      // Optionally, reveal paragraphs themselves in alphabetical order (by first letter)
      // but we won't fade the entire paragraph to avoid double-animations; we only decorate characters.
      const items = paras.map((p, idx) => {
        const m = (p.textContent || '').trim().match(/[a-zA-Z]/);
        const ch = m ? m[0].toLowerCase() : 'z';
        const r = ch.charCodeAt(0) - 97; // 0..25
        return { p, idx, rank: isFinite(r) && r >= 0 ? r : 26 };
      });
      const sorted = [...items].sort((a, b) => a.rank - b.rank || a.idx - b.idx);

      sorted.forEach((item, i) => {
        const p = item.p;
        if (p.dataset.alphaPrepared === '1') return;
        p.dataset.alphaPrepared = '1';
        // Prepare per-rank counters for micro-stagger
        const perRankCounters: number[] = Array(30).fill(0);
        wrapTextNodes(p, perRankCounters);
      });
    };

    // Use IntersectionObserver so each section reveals when in view
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            apply(entry.target as HTMLElement);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    containers.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [stagger, withinStagger, baseDelay]);

  return null;
}
