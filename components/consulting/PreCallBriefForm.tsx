/**
 * Pre-Call Brief Form
 *
 * Purpose:
 *  - Collects context and project details from users before their discovery call.
 *  - Integrates with JotForm for data collection and follow-up.
 *  - Appears after user books a Calendly slot.
 *  - Reduces call time by establishing baseline context.
 *
 * Features:
 *  - Form embedded via JotForm iframe.
 *  - Mobile-responsive form sizing.
 *  - Automatic tracking via Sentry on form submission.
 *  - Fallback link for form submission issues.
 *
 * Notes:
 *  - JotForm ID: 252643426225151 (pre-call brief form)
 *  - Uses lazyLoad to avoid blocking render.
 */

'use client';

import { useState } from 'react';
import Script from 'next/script';
import * as Sentry from '@sentry/nextjs';

export default function PreCallBriefForm() {
  const [formLoaded, setFormLoaded] = useState(false);
  const jotformId = '252643426225151';
  const jotformUrl = `https://form.jotform.com/${jotformId}`;

  const handleFormLoad = () => {
    setFormLoaded(true);
    Sentry.captureMessage('Pre-call brief form loaded', {
      level: 'info',
      tags: { component: 'PreCallBriefForm', event: 'form_loaded' },
    });
  };

  const handleSubmit = () => {
    Sentry.captureMessage('Pre-call brief form submitted', {
      level: 'info',
      tags: { component: 'PreCallBriefForm', event: 'form_submitted' },
    });
  };

  return (
    <div className="w-full bg-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Tell us about your project</h2>
          <p className="text-lg text-gray-600">
            Help us prepare by sharing some context. This 2-minute form gives us everything we need to make the most of your call.
          </p>
        </div>

        {/* JotForm Embed */}
        <div className="relative w-full bg-gray-50 rounded-lg border border-gray-200 p-8 min-h-[600px]">
          {!formLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">Loading form...</p>
              </div>
            </div>
          )}

          <Script
            src="https://cdn.jotfor.ms/s/umd/latest/for.js"
            strategy="lazyOnload"
            onLoad={() => {
              handleFormLoad();
              if ((window as any).JotForm) {
                (window as any).JotForm.init(() => {
                  (window as any).JotForm.setHeight();
                });
              }
            }}
          />

          <iframe
            id="JotFormIFrame"
            title="Pre-call brief form"
            onLoad={handleFormLoad}
            src={jotformUrl}
            style={{
              display: formLoaded ? 'block' : 'none',
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            className="w-full"
            frameBorder="0"
            scrolling="no"
            allow="geolocation; microphone; camera"
          />
        </div>

        {/* Alternative Link */}
        <div className="mt-8 p-6 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-gray-700 mb-3">
            <strong>Can&apos;t see the form?</strong> Open it directly:
          </p>
          <a
            href={jotformUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 font-semibold text-black hover:underline"
          >
            Open Pre-Call Brief Form →
          </a>
        </div>

        {/* Next Steps */}
        <div className="mt-12 p-6 rounded-lg bg-gray-100 border border-gray-300">
          <h3 className="font-bold text-gray-900 mb-4">What happens next?</h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-black">1.</span>
              <span>Fill out this brief so we understand your project.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-black">2.</span>
              <span>Attend your scheduled discovery call with Dimitri.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-black">3.</span>
              <span>Within 2 days, receive a proposal or architecture roadmap.</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
