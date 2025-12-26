"use client";

/**
 * Hotjar
 *
 * Narrative:
 *  - Loads Hotjar only when public IDs are present to avoid noisy builds in preview or local runs.
 *  - Uses Next.js Script with afterInteractive strategy so hydration is never blocked.
 *  - Marks the document root with a data flag for quick debugging and segmenting in click maps.
 */

import Script from "next/script";

const siteIdEnv = process.env.NEXT_PUBLIC_HOTJAR_ID;
const siteVersionEnv = process.env.NEXT_PUBLIC_HOTJAR_SV;

const siteId = siteIdEnv ? Number(siteIdEnv) : null;
const siteVersion = siteVersionEnv && !Number.isNaN(Number(siteVersionEnv)) ? Number(siteVersionEnv) : 6;

export default function Hotjar() {
  const isConfigured = siteId !== null && !Number.isNaN(siteId);

  if (!isConfigured) return null;

  const snippet = `
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${siteId},hjsv:${siteVersion}};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  `;

  return (
    <>
      <Script id="hotjar-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: snippet }} />
      <Script id="hotjar-flag" strategy="afterInteractive">
        {"document.documentElement.dataset.hotjar='enabled';"}
      </Script>
    </>
  );
}
