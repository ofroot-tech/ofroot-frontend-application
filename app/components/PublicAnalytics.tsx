'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { isPrivateSignalRoute } from '@/app/lib/signal-subscriptions/privacy';

/** Public content keeps its existing analytics. Mailbox tokens and newsletter
 * forms never become analytics URLs, form events, or email-address payloads. */
export default function PublicAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const privatePage = isPrivateSignalRoute(pathname);
  useEffect(() => {
    const target = window as unknown as Record<string, unknown>;
    target[`ga-disable-${measurementId}`] = privatePage;
    return () => { target[`ga-disable-${measurementId}`] = false; };
  }, [measurementId, privatePage]);
  if (privatePage) return null;
  return <>
    <Analytics beforeSend={event => isPrivateSignalRoute(window.location.pathname) || isPrivateSignalRoute(event.url) ? null : event} />
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
    <Script id="google-analytics" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', ${JSON.stringify(measurementId)}, { page_location: location.origin + location.pathname });
    `}</Script>
  </>;
}
