"use client";

import { useEffect, useRef } from 'react';
import { LiquidOpen, type LiquidOpenOptions } from './physics';

export function useLiquidOpenImpl(enabled: boolean, options?: LiquidOpenOptions & { mode?: 'open' | 'close' }) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return undefined;
    const engine = new LiquidOpen(ref.current, options);
    if (options?.mode === 'close') engine.startClose(); else engine.startOpen();
    return () => engine.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return ref;
}
