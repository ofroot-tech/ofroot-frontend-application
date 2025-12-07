/**
 * Booking Widget
 *
 * Purpose:
 *  - Client component that wraps Calendly embed.
 *  - Handles Calendly script initialization and mobile responsiveness.
 *  - Provides sticky sidebar for scheduling on desktop.
 *  - Tracks booking events via Sentry.
 *
 * Features:
 *  - Responsive sizing (mobile-first, sticky on desktop).
 *  - Calendly script loaded lazily (lazyOnload strategy).
 *  - Fallback link for users who can't access the widget.
 *  - Conversion tracking on widget load.
 *
 * Notes:
 *  - Uses hasMounted pattern to avoid SSR/hydration mismatches.
 *  - Calendly iframe sizing: desktop 630px height, mobile responsive.
 */

'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import * as Sentry from '@sentry/nextjs';

export default function BookingWidget() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const calendlySrc = 'https://assets.calendly.com/assets/external/widget.js';

  useEffect(() => {
    setHasMounted(true);

    // Detect mobile viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCalendlyLoad = () => {
    Sentry.captureMessage('Calendly widget loaded', {
      level: 'info',
      tags: { component: 'BookingWidget', event: 'calendly_loaded' },
    });
  };

  return (
    <div className={isMobile ? '' : 'sticky top-8'}>
      <h2 className="text-3xl font-extrabold mb-4 text-gray-900">Schedule a Call</h2>
      <p className="text-gray-600 mb-8">
        Pick a time that works best. All times shown in your timezone.
      </p>

      {/* Calendly Widget */}
      {hasMounted && (
        <>
          <Script
            src={calendlySrc}
            strategy="lazyOnload"
            onLoad={() => {
              handleCalendlyLoad();
              if ((window as any).Calendly) {
                (window as any).Calendly.initInlineWidget({
                  url: 'https://calendly.com/dimitri-mcdaniel-9oh/new-meeting',
                  parentElement: document.getElementById('calendly-inline'),
                });
              }
            }}
          />
          <div
            id="calendly-inline"
            style={{
              minWidth: '100%',
              maxWidth: '100%',
              height: isMobile ? '800px' : '630px',
            }}
            className="rounded-lg border border-gray-200 overflow-hidden"
          />
        </>
      )}

      {/* Fallback Link */}
      <div className="mt-4 p-4 rounded-lg bg-gray-50 text-center text-sm text-gray-600">
        Having trouble? Open Calendly{' '}
        <a
          href="https://calendly.com/dimitri-mcdaniel-9oh/new-meeting"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-black hover:underline"
          onClick={() => {
            Sentry.captureMessage('Calendly fallback link clicked', {
              level: 'info',
              tags: { component: 'BookingWidget', event: 'fallback_link_clicked' },
            });
          }}
        >
          in a new tab
        </a>
      </div>
    </div>
  );
}
