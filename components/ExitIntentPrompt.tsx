"use client";

import { useEffect, useState } from 'react';
import { toast } from '@/components/Toaster';
import ExitIntentSnakeGame from './ExitIntentSnakeGame';

/**
 * ExitIntentPrompt
 * Shows a lightweight mini-game once per session when upward exit intent is detected.
 */
export default function ExitIntentPrompt() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

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
      setMinimized(false);
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

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-3 z-[10001] rounded-full border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-lg md:right-4"
      >
        Snake + 10% off
      </button>
    );
  }

  return (
    <div className="fixed inset-x-2 bottom-3 z-[10001] md:inset-x-auto md:right-4 md:w-[380px]">
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-xl sm:p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Leaving already?</p>
            <p className="text-xs text-gray-600">Quick classic Snake break.</p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setMinimized(true)}
              className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:text-black"
              aria-label="Minimize snake panel"
            >
              _
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:text-black"
              aria-label="Close snake panel"
            >
              ✕
            </button>
          </div>
        </div>
        <ExitIntentSnakeGame />
      </div>
    </div>
  );
}
