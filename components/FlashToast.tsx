"use client";

/**
 * FlashToast — a quiet interpreter of intent.
 *
 * Given a compact token (the "flash"), it speaks a brief, humane
 * message. This lets redirects carry sentiment without ceremony,
 * and pages respond with grace.
 */
import { useEffect } from 'react';
import { toast } from '@/components/Toaster';

export default function FlashToast({ flash }: { flash?: string }) {
  useEffect(() => {
    if (!flash) return;

    // Defer emission to avoid duplicate toasts during hydration/refetch.
    const show = () => {
      switch (flash) {
        case 'registered':
          toast({ type: 'success', title: 'Welcome!', message: 'Your account was created.' });
          break;
        case 'signed-out':
          toast({ type: 'info', title: 'Signed out', message: 'You have been logged out.' });
          break;
        case 'saved':
          toast({ type: 'success', title: 'Saved', message: 'Changes saved successfully.' });
          break;
        default:
          break;
      }
    };

    queueMicrotask(show);
  }, [flash]);

  // Nothing to render; the work is the whisper.
  return null;
}
