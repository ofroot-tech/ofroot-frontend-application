"use client";

import { useMemo } from 'react';
import { useCountUp } from './useCountUp';

export default function AmountDisplay({
  value,
  currency = 'USD',
  className,
  animate = true,
}: {
  value: number;
  currency?: string;
  className?: string;
  animate?: boolean;
}) {
  const animatedValue = useCountUp(Number(value) || 0, { durationMs: 700, resetOnChange: true });
  const v = animate ? animatedValue : value;
  const text = useMemo(() => {
    const n = Number.isFinite(v) ? v : 0;
    try {
      return n.toLocaleString(undefined, { style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch {
      return `${currency.toUpperCase()} ${n.toFixed(2)}`;
    }
  }, [v, currency]);
  return <span className={`text-green-600 tabular-nums font-mono ${className ?? ''}`}>{text}</span>;
}
