"use client";

import { useEffect, useRef } from 'react';
import { type LiquidOpenOptions } from './physics';
import { useLiquidOpenImpl } from './useLiquidOpenImpl';

export function useLiquidOpen(enabled: boolean, options?: LiquidOpenOptions & { mode?: 'open' | 'close' }) {
  return useLiquidOpenImpl(enabled, options);
}

// Convenience component to reveal children within a container when active
export function LiquidReveal({
  as: Tag = 'div',
  active,
  options,
  mode = 'open',
  className,
  children,
  ...rest
}: {
  as?: any;
  active: boolean;
  options?: LiquidOpenOptions;
  mode?: 'open' | 'close';
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}) {
  const ref = useLiquidOpen(active, { ...(options || {}), mode }) as unknown as React.RefObject<HTMLDivElement>;
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
