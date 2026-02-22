"use client";

import Link from 'next/link';
import { track } from '@/app/lib/ab';
import type { ReactNode } from 'react';

type HomeTrackedLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  label: string;
  placement: string;
  action?: string;
};

export default function HomeTrackedLink({
  href,
  className,
  children,
  label,
  placement,
  action = 'home_cta_click',
}: HomeTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        try {
          track({
            category: 'cta',
            action,
            label,
            meta: {
              placement,
              href,
              path: typeof window !== 'undefined' ? window.location.pathname : '/',
            },
          });
        } catch {}
      }}
    >
      {children}
    </Link>
  );
}
