"use client";

/**
 * Toaster — a small herald for transient truths.
 *
 * Purpose
 *   Deliver short, ephemeral messages to the reader without ceremony.
 *   It listens for a single custom event, "toast", and renders a brief
 *   notice with graceful disappearance. Nothing more, nothing less.
 *
 * Contract
 *   - No global state beyond one custom event channel.
 *   - Non-blocking: the UI remains calm while messages come and go.
 *   - Deterministic removal after a bounded lifetime.
 *
 * Design Notes
 *   - We favor composure: no external deps, a whisper of CSS, and a
 *     predictable exit. Events are typed to keep intent sharp.
 */
import { useEffect, useState } from 'react';

export type Toast = {
  /** stable identity for scheduled removal */
  id: string;
  /** a headline for the eye to catch */
  title?: string;
  /** the message itself—the useful part */
  message: string;
  /** tone sets the border; content sets the meaning */
  type?: 'success' | 'error' | 'info' | 'warning';
  /** lifespan in milliseconds; brevity is kind */
  duration?: number; // ms
};

declare global {
  interface WindowEventMap {
    /** our one tiny conduit for public notices */
    toast: CustomEvent<Toast>;
  }
}

export default function Toaster() {
  // The current chorus of messages on stage; short-lived by design.
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    /**
     * When summoned, a toast joins the cast, bows out on cue, and leaves no trace.
     * The staging is simple: append now, schedule removal with a timer.
     */
    function onToast(e: CustomEvent<Toast>) {
      const t = e.detail;
      setToasts((prev) => [...prev, { duration: 4000, type: 'info', ...t }]);
      const duration = t.duration ?? 4000;
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), duration);
    }

    window.addEventListener('toast', onToast as EventListener);
    return () => {
      window.removeEventListener('toast', onToast as EventListener);
    };
  }, []);

  /** a gentle manual exit for any given toast */
  function close(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Position: bottom-right on mobile (avoids header/hero overlap),
          switches to a comfortable top offset on desktop. */}
      <div
        className="absolute right-4 bottom-20 md:top-20 md:bottom-auto flex w-full max-w-sm flex-col gap-2"
        style={{
          // Respect device safe areas so we don't collide with notches/home indicators
          paddingRight: 'env(safe-area-inset-right, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-md border bg-white p-3 shadow-sm text-sm ${
              t.type === 'success' ? 'border-green-300' : t.type === 'error' ? 'border-red-300' : 'border-gray-200'
            }`}
          >
            {t.title && <div className="font-medium mb-1">{t.title}</div>}
            <div className="flex items-start gap-3">
              <div className="flex-1 text-gray-800">{t.message}</div>
              <button aria-label="Dismiss notification" className="text-gray-500 hover:text-black" onClick={() => close(t.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * toast — a small utility to announce a message.
 *
 * Usage
 *   toast({ type: 'success', title: 'Saved', message: 'All is well' })
 *
 * Guarantees
 *   - Returns the id for optional manual dismissal.
 *   - Dispatch is synchronous; rendering is React’s domain.
 */
export function toast(input: Omit<Toast, 'id'> & { id?: string }) {
  const id = input.id || Math.random().toString(36).slice(2);
  const event = new CustomEvent<Toast>('toast', { detail: { id, ...input } });
  window.dispatchEvent(event);
  return id;
}
