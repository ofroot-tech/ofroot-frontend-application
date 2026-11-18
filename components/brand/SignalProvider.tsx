'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { drawSignal } from './signal-renderer';
import styles from './Signal.module.css';

type Placement = 'hero' | 'background' | 'footer';
type Surface = { placement: Placement; element: HTMLDivElement; canvas: HTMLCanvasElement };
type SignalContextValue = {
  enabled: boolean;
  paused: boolean;
  reduced: boolean;
  ready: boolean;
  toggle: () => void;
  register: (surface: Surface) => () => void;
};
const SignalContext = createContext<SignalContextValue | null>(null);
const pauseKey = 'ofroot-signal-paused-v1';
const idleDelay = 800;

/** Public branding stays out of signed-in, payment, and operational screens. */
export function isSignalPublicPath(pathname: string) {
  return !/^\/(?:dashboard|auth|login|settings|debug|api|invoice|onboarding|build|dialer|intro-letters|automations|sentry-example-page)(?:\/|$)/.test(pathname);
}

/** One clock and one frame loop survive all public route and placement changes. */
export default function SignalProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/';
  const enabled = isSignalPublicPath(pathname);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const system = useRef<HTMLDivElement>(null);
  const surfaces = useRef(new Map<HTMLElement, Surface>());
  const wake = useRef<() => void>(() => {});
  const clock = useRef(0);
  const pauseRef = useRef(false);
  const register = useCallback((surface: Surface) => {
    surfaces.current.set(surface.element, surface);
    wake.current();
    return () => {
      surfaces.current.delete(surface.element);
      wake.current();
    };
  }, []);

  const toggle = useCallback(() => {
    pauseRef.current = !pauseRef.current;
    setPaused(pauseRef.current);
    try { sessionStorage.setItem(pauseKey, String(pauseRef.current)); } catch { /* Keep the in-memory choice. */ }
    wake.current();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    try { pauseRef.current = sessionStorage.getItem(pauseKey) === 'true'; } catch { /* Storage is optional. */ }
    setPaused(pauseRef.current);
    setReduced(preference.matches);
    setReady(true);

    let frame: number | null = null;
    let lastPaint = 0;
    let lastAdvance = 0;
    let scrollingUntil = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let dirty = true;
    let disposed = false;
    let previous: Surface | undefined;
    let exclusions: DOMRect[] = [];
    const contexts = new Map<HTMLCanvasElement, CanvasRenderingContext2D | null>();
    const observed = new Set<HTMLElement>();
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => { dirty = true; requestFrame(); });

    function requestFrame() {
      if (frame === null && !disposed && !document.hidden) frame = requestAnimationFrame(paint);
    }

    function paint(now: number) {
      frame = null;
      if (disposed || document.hidden) return;
      if (lastPaint && now - lastPaint < 1000 / 30) { requestFrame(); return; }
      lastPaint = now;
      let hero: Surface | undefined;
      let footer: Surface | undefined;
      let background: Surface | undefined;
      for (const surface of surfaces.current.values()) {
        if (!observed.has(surface.element)) { resize?.observe(surface.element); observed.add(surface.element); }
        if (surface.placement === 'background') { background = surface; continue; }
        const rect = surface.element.getBoundingClientRect();
        const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
        if (rect.width > 0 && visible >= Math.min(rect.height * .35, 80)) {
          if (surface.placement === 'hero') hero = surface;
          else footer = surface;
        }
      }
      // Keep keyboard focus usable without keeping the background animation alive.
      const controlFocused = background?.element.contains(document.activeElement);
      const target = hero || footer || (!preference.matches && now < scrollingUntil ? background : undefined);
      if (system.current) system.current.dataset.signalMode = target?.placement || 'footer';
      for (const surface of surfaces.current.values()) surface.element.dataset.active = String(surface === target);
      if (background) background.element.dataset.controlVisible = String(background === target || controlFocused);
      if (previous !== target) dirty = true;
      previous = target;

      const moving = !!target && !pauseRef.current && !preference.matches;
      if (moving && lastAdvance) clock.current += Math.min(now - lastAdvance, 100) / 1000;
      lastAdvance = moving ? now : 0;

      let rendered = false;
      if (target) {
        const canvas = target.canvas;
        if (!contexts.has(canvas)) contexts.set(canvas, canvas.getContext('2d', { alpha: true }));
        const context = contexts.get(canvas);
        const bounds = canvas.getBoundingClientRect();
        if (context && bounds.width > 0 && bounds.height > 0) {
          const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
          const pixelWidth = Math.round(bounds.width * dpr);
          const pixelHeight = Math.round(bounds.height * dpr);
          if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
          }
          drawSignal(context, bounds.width, bounds.height, clock.current, { still: preference.matches });
          if (target.placement === 'background') {
            if (dirty) {
              // The layer clears real reading and control bounds, so opaque page
              // backgrounds cannot hide it and foreground content stays untouched.
              exclusions = Array.from(document.querySelectorAll<HTMLElement>(
                'main :is(p,h1,h2,h3,h4,h5,h6,a,button,input,select,textarea,label,summary,li,pre,blockquote,img,video,table),header,nav,[role="dialog"]',
              )).map(node => node.getBoundingClientRect()).filter(rect =>
                rect.width > 0 && rect.height > 0 && rect.right > bounds.left && rect.left < bounds.right && rect.bottom > bounds.top && rect.top < bounds.bottom,
              );
            }
            for (const rect of exclusions) context.clearRect(rect.left - bounds.left - 9, rect.top - bounds.top - 9, rect.width + 18, rect.height + 18);
          }
          target.element.dataset.rendered = 'true';
          rendered = true;
        }
      }
      dirty = false;
      if (moving && rendered) requestFrame();
    }

    function onScroll() {
      scrollingUntil = performance.now() + idleDelay;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(requestFrame, idleDelay + 1);
      dirty = true;
      requestFrame();
    }
    function onResize() { dirty = true; requestFrame(); }
    function onVisibility() {
      if (document.hidden) {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        lastAdvance = 0;
      } else { dirty = true; requestFrame(); }
    }
    function onPreference() { setReduced(preference.matches); lastAdvance = 0; dirty = true; requestFrame(); }
    wake.current = () => { dirty = true; requestFrame(); };
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('focusin', requestFrame);
    document.addEventListener('focusout', requestFrame);
    window.addEventListener('resize', onResize, { passive: true });
    preference.addEventListener('change', onPreference);
    requestFrame();
    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
      resize?.disconnect();
      document.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('focusin', requestFrame);
      document.removeEventListener('focusout', requestFrame);
      window.removeEventListener('resize', onResize);
      preference.removeEventListener('change', onPreference);
      wake.current = () => {};
    };
  }, [enabled, pathname]);

  const value = useMemo(() => ({ enabled, paused, reduced, ready, toggle, register }), [enabled, paused, reduced, ready, toggle, register]);
  return <SignalContext.Provider value={value}>
    <div ref={system} className={styles.system} data-signal-system data-signal-mode="footer">
      {children}
      {enabled && <SignalSurface placement="background" />}
    </div>
  </SignalContext.Provider>;
}

function MotionControl() {
  const signal = useContext(SignalContext);
  if (!signal?.ready) return null;
  return <button type="button" className={styles.control} onClick={signal.toggle}
    disabled={signal.reduced} aria-pressed={signal.paused || signal.reduced}
    aria-label={signal.reduced ? 'Signal motion disabled by reduced motion preference' : signal.paused ? 'Resume signal motion' : 'Pause signal motion'}>
    {signal.paused && !signal.reduced ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
    <span>{signal.reduced ? 'Motion reduced' : signal.paused ? 'Resume motion' : 'Pause motion'}</span>
  </button>;
}

export function SignalSurface({ placement }: { placement: Placement }) {
  const signal = useContext(SignalContext);
  const enabled = signal?.enabled;
  const register = signal?.register;
  const element = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!enabled || !register || !element.current || !canvas.current) return;
    return register({ placement, element: element.current, canvas: canvas.current });
  }, [enabled, register, placement]);
  if (!enabled) return null;
  return <div className={`${styles.surface} ${styles[placement]}`} data-signal-placement={placement} ref={element}>
    <div className={styles.art} aria-hidden="true">
      <Image className={styles.fallback} src="/brand/ofroot-pixel-signal-still.svg" width={960} height={320} alt="" unoptimized />
      <canvas ref={canvas} className={styles.canvas} />
    </div>
    <MotionControl />
  </div>;
}
