/**
 * PrimaryCta
 *
 * Purpose:
 *  - Reusable CTA component with integrated conversion tracking.
 *  - Logs clicks to Sentry for conversion funnel analysis.
 *  - Supports internal navigation (next/link) and external links.
 *
 * Features:
 *  - Automatic click tracking via Sentry captureMessage.
 *  - CTA name/label captured for funnel analysis.
 *  - Works with both internal and external links.
 *
 * Usage:
 *  - <PrimaryCta href="/pricing">See Plans</PrimaryCta>
 *  - <PrimaryCta href="https://example.com" external>External Link</PrimaryCta>
 */
'use client';

import Link from 'next/link';
import React from 'react';
import * as Sentry from '@sentry/nextjs';

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
};

export default function PrimaryCta({ href, children, className = '', external = false }: Props) {
  const handleClick = () => {
    const label = typeof children === 'string' ? children : 'CTA';
    Sentry.captureMessage(`CTA Clicked: ${label} (${href})`, {
      level: 'info',
      tags: {
        component: 'PrimaryCta',
        action: 'click',
        destination: href,
      },
    });
  };

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`inline-block rounded bg-black px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black hover:bg-gray-900 transition ${className}`}
        aria-label={typeof children === 'string' ? children : 'External action'}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`inline-block rounded bg-black px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black hover:bg-gray-900 transition ${className}`}
      aria-label={typeof children === 'string' ? children : 'Primary action'}
    >
      {children}
    </Link>
  );
}
