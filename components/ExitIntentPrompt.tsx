"use client";

import { useEffect, useState } from 'react';
import { toast } from '@/components/Toaster';
import ExitIntentSnakeGame from '@/components/ExitIntentSnakeGame';

/**
 * ExitIntentPrompt
 * Shows a lightweight mini-game once per session when upward exit intent is detected.
 */
export default function ExitIntentPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storageKey = 'ofroot.exitIntentSnakeShown';
    const alreadyShown = sessionStorage.getItem(storageKey);
    if (alreadyShown === 'true') return;

    const handler = (event: MouseEvent) => {
      if (event.clientY > 0) return;
      if (sessionStorage.getItem(storageKey) === 'true') return;

      sessionStorage.setItem(storageKey, 'true');
      setOpen(true);
      toast({
        id: 'exit-intent-snake',
        type: 'info',
        title: 'Secret unlocked',
        message: 'Play a quick round of Snake before you leave.',
        duration: 4500,
      });
    };

    window.addEventListener('mouseout', handler);
    return () => window.removeEventListener('mouseout', handler);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-x-3 bottom-4 z-[10001] md:inset-x-auto md:right-4 md:w-[360px]">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Leaving already?</p>
            <p className="text-xs text-gray-600">Quick classic Snake break.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:text-black"
            aria-label="Close snake panel"
          >
            ✕
          </button>
        </div>
        <ExitIntentSnakeGame />
      </div>
    </div>
  );
}
