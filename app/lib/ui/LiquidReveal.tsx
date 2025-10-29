"use client";

import { type LiquidOpenOptions } from './physics';
import { useLiquidOpenImpl } from './useLiquidOpenImpl';

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
  const ref = useLiquidOpenImpl(active, { ...(options || {}), mode }) as unknown as React.RefObject<HTMLDivElement>;
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
