// app/services/components/ServiceHero.tsx
'use client';

import { track } from '@/app/lib/ab';

export default function ServiceHero({ title, subtitle, ctaHref, ctaLabel, secondaryCtaHref, secondaryCtaLabel = 'Talk to sales', analyticsServiceId }: { title: string; subtitle: string; ctaHref: string; ctaLabel: string; secondaryCtaHref?: string; secondaryCtaLabel?: string; analyticsServiceId?: string; }) {
  const SALES_URL = 'https://form.jotform.com/252643426225151';
  const secondaryHref = secondaryCtaHref || SALES_URL;
  return (
    <header className="mb-8 md:mb-12 reveal-in fade-only section-pad">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">{title}</h1>
      <p className="mt-3 text-lg text-gray-700 max-w-3xl">{subtitle}</p>
      <div className="mt-6 flex items-center gap-3 flex-wrap">
        <a
          href={ctaHref}
          className="inline-flex items-center bg-black text-white hover:bg-gray-900 font-semibold py-3 px-6 rounded-full"
          onClick={() => {
            try {
              if (analyticsServiceId) {
                track({ category: 'cta', action: 'service_cta_click', label: `primary:${analyticsServiceId}` });
              }
              // If CTA navigates to /subscribe?product=... also emit subscribe_cta_click
              try {
                const u = new URL(ctaHref, typeof window !== 'undefined' ? window.location.origin : 'https://example.com');
                const product = u.searchParams.get('product');
                if (product) {
                  track({ category: 'cta', action: 'subscribe_cta_click', label: product });
                }
              } catch {}
            } catch {}
          }}
        >
          {ctaLabel}
        </a>
        {secondaryHref && (
          <a
            href={secondaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center underline text-gray-800 hover:text-black font-semibold py-3 px-2"
            onClick={() => {
              try { if (analyticsServiceId) track({ category: 'cta', action: 'service_cta_click', label: `secondary:${analyticsServiceId}` }); } catch {}
            }}
          >
            {secondaryCtaLabel}
          </a>
        )}
      </div>
    </header>
  );
}
