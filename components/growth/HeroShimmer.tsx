'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import styles from './ApprovedHome.module.css';

type Point = { x: number; y: number; nx: number; ny: number; noise: number };

/** One canvas loop; React state changes only for the accessible motion control. */
export default function HeroShimmer({ children, headingId = 'home-hero-heading', className = '' }: { children: ReactNode; headingId?: string; className?: string }) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const toggle = useRef<(() => void) | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const element = section.current;
    const surface = canvas.current;
    const context = surface?.getContext('2d', { alpha: true });
    if (!element || !surface || !context) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let width = 0;
    let height = 0;
    let points: Point[] = [];
    let frame: number | null = null;
    let last = 0;
    let time = 0;
    let stopped = false;
    let visible = true;
    let disposed = false;
    let px = .72;
    let py = .38;
    let tx = px;
    let ty = py;
    let active = 0;
    let targetActive = 0;
    const canAnimate = () => !disposed && !stopped && !motion.matches && visible && !document.hidden && width > 0 && height > 0;
    const hash = (x: number, y: number) => {
      const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return value - Math.floor(value);
    };

    function draw() {
      if (disposed || !context || width <= 0 || height <= 0) return;
      context.clearRect(0, 0, width, height);
      const clouds = [
        { x: -.08 + Math.sin(time * .35) * .15, y: .13 + Math.sin(time * .48) * .15, sx: .32, sy: .34, power: 1.1 },
        { x: 1.02 + Math.sin(time * .4) * .14, y: .22 + Math.cos(time * .45) * .17, sx: .30, sy: .34, power: 1.15 },
        { x: .86 + Math.sin(time * .41) * .12, y: .78 + Math.sin(time * .35) * .13, sx: .29, sy: .29, power: 1.05 },
        { x: .2 + Math.sin(time * .23) * .07, y: 1.07, sx: .29, sy: .25, power: .48 },
      ];
      for (const point of points) {
        let density = 0;
        for (const cloud of clouds) {
          const x = (point.nx - cloud.x) / cloud.sx;
          const y = (point.ny - cloud.y) / cloud.sy;
          density += Math.exp(-(x * x + y * y)) * cloud.power;
        }
        const center = Math.exp(-((point.nx - .38) ** 2 / .16 + (point.ny - .35) ** 2 / .1));
        density *= 1 - center * .86;
        const edge = Math.pow(Math.abs(point.nx - .5) * 2, 2.4);
        const dx = point.nx - px;
        const dy = (point.ny - py) * height / width;
        const pointer = Math.exp(-(dx * dx + dy * dy) / .025) * active;
        const wave = (Math.sin(point.nx * 13 + point.ny * 10 + time * 1.6) + Math.sin(point.nx * 5 - point.ny * 11 - time * 1.2)) * .20 + .75;
        const alpha = Math.max(0, Math.min(.76, density * wave * .56 - point.noise * .10 + pointer * (.16 + edge * .38)));
        if (alpha < .025) continue;
        context.fillStyle = point.nx < .28 && point.ny > .48 ? `rgba(236,181,175,${alpha})` : `rgba(196,174,229,${alpha})`;
        const shift = pointer * edge * 10;
        const size = 1.55 + point.noise * .5;
        context.fillRect(point.x + dx * shift, point.y + dy * shift, size, size);
      }
    }

    function tick(now: number) {
      frame = null;
      if (!canAnimate()) return;
      const elapsed = last ? Math.min(now - last, 50) : 16.7;
      last = now;
      time += elapsed * .00024;
      const easing = 1 - Math.exp(-elapsed / 300);
      px += (tx - px) * easing;
      py += (ty - py) * easing;
      active += (targetActive - active) * easing;
      draw();
      if (canAnimate()) frame = requestAnimationFrame(tick);
    }

    function start() {
      if (frame === null && canAnimate()) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    }

    function stop() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      last = 0;
    }

    function resize() {
      if (!element || !surface || !context || disposed) return;
      const bounds = element.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (width <= 0 || height <= 0) { stop(); return; }
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      surface.width = Math.round(width * dpr);
      surface.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const step = Math.max(width < 760 ? 7 : 6.5, Math.sqrt(width * height / 27000));
      points = [];
      for (let y = 3; y < height; y += step) {
        for (let x = 3; x < width; x += step) points.push({ x, y, nx: x / width, ny: y / height, noise: hash(x, y) });
      }
      draw();
      start();
    }

    function pointerMove(event: PointerEvent) {
      if (!element || !finePointer.matches || motion.matches || stopped) return;
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      tx = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      ty = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
      targetActive = 1;
    }
    function pointerLeave() { targetActive = 0; tx = .72; ty = .38; }
    function visibilityChange() { if (document.hidden) stop(); else start(); }
    function preferenceChange() {
      setReduced(motion.matches);
      if (motion.matches) { stop(); active = 0; draw(); } else start();
    }

    toggle.current = () => {
      stopped = !stopped;
      setPaused(stopped);
      if (stopped) stop(); else start();
    };
    setAvailable(true);
    setReduced(motion.matches);
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    resizeObserver?.observe(element);
    if (!resizeObserver) window.addEventListener('resize', resize);
    const intersection = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    });
    intersection?.observe(element);
    element.addEventListener('pointermove', pointerMove, { passive: true });
    element.addEventListener('pointerleave', pointerLeave, { passive: true });
    document.addEventListener('visibilitychange', visibilityChange);
    motion.addEventListener('change', preferenceChange);
    resize();

    return () => {
      disposed = true;
      stop();
      resizeObserver?.disconnect();
      intersection?.disconnect();
      window.removeEventListener('resize', resize);
      element.removeEventListener('pointermove', pointerMove);
      element.removeEventListener('pointerleave', pointerLeave);
      document.removeEventListener('visibilitychange', visibilityChange);
      motion.removeEventListener('change', preferenceChange);
      toggle.current = null;
    };
  }, []);

  return (
    <section ref={section} className={`${styles.hero} ${className}`} aria-labelledby={headingId}>
      <canvas ref={canvas} className={styles.field} aria-hidden="true" />
      {children}
      {available && <button type="button" className={styles.motionControl} onClick={() => toggle.current?.()} disabled={reduced} aria-pressed={paused || reduced} aria-label={reduced ? 'Background animation disabled by reduced motion preference' : paused ? 'Resume background animation' : 'Pause background animation'}>
        {paused && !reduced ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
        <span>{reduced ? 'Motion reduced' : paused ? 'Resume motion' : 'Pause motion'}</span>
      </button>}
    </section>
  );
}
