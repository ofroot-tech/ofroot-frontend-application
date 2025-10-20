"use client";

import { useEffect } from 'react';
import { toast } from '@/components/Toaster';

/**
 * ExitIntentPrompt
 * Gently reminds visitors of the value before they abandon a high-intent page.
 * We keep it lightweight: a toast fires once per session on upward exit intent.
 */
export default function ExitIntentPrompt() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storageKey = 'ofroot.exitIntentShown';
    const alreadyShown = sessionStorage.getItem(storageKey);
    if (alreadyShown === 'true') return;

    const handler = (event: MouseEvent) => {
      if (event.clientY > 0) return;
      if (sessionStorage.getItem(storageKey) === 'true') return;

      sessionStorage.setItem(storageKey, 'true');
      toast({
        id: 'exit-intent-reminder',
        type: 'info',
        title: 'Before you go…',
        message: 'Need help scoping the work? Our team can spin up a sandbox or walkthrough in under 24 hours.',
        duration: 6000,
      });
    };

    window.addEventListener('mouseout', handler);
    return () => window.removeEventListener('mouseout', handler);
  }, []);

  return null;
}
