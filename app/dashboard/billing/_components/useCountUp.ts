"use client";

import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, opts?: { durationMs?: number; resetOnChange?: boolean }) {
  const { durationMs = 700, resetOnChange = true } = opts || {};
  const [value, setValue] = useState<number>(resetOnChange ? 0 : target);
  const raf = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const startVal = useRef<number>(resetOnChange ? 0 : target);

  useEffect(() => {
    if (resetOnChange) {
      startVal.current = 0;
      setValue(0);
    } else {
      startVal.current = value;
    }
    startTime.current = null;
    if (raf.current) cancelAnimationFrame(raf.current);

    const animate = (t: number) => {
      if (startTime.current == null) startTime.current = t;
      const elapsed = t - startTime.current;
      const progress = Math.min(1, elapsed / durationMs);
      // easeOutCubic for a pleasant glide
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = startVal.current + (target - startVal.current) * eased;
      setValue(next);
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };

    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}
