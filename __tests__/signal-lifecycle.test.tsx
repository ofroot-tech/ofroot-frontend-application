/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import SignalProvider, { isSignalPublicPath, SignalSurface } from '@/components/brand/SignalProvider';
import { drawSignal } from '@/components/brand/signal-renderer';

let mockPathname = '/';
jest.mock('next/navigation', () => ({ usePathname: () => mockPathname }));
jest.mock('@/components/brand/Signal.module.css', () => ({}));
jest.mock('@/components/brand/signal-renderer', () => ({ drawSignal: jest.fn() }));

type Placement = 'hero' | 'background' | 'footer';
type Bounds = { top: number; left: number; width: number; height: number };

describe('shared signal motion lifecycle', () => {
  let container: HTMLDivElement;
  let root: Root;
  let frames: Map<number, FrameRequestCallback>;
  let preferenceListeners: Set<() => void>;
  let bounds: Record<Placement, Bounds>;
  let disconnectResize: jest.Mock;
  let now: number;
  let reduced: boolean;
  const paint = jest.mocked(drawSignal);

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    jest.useFakeTimers({ doNotFake: ['performance'] });
    sessionStorage.clear();
    mockPathname = '/';
    now = 0;
    reduced = false;
    frames = new Map();
    preferenceListeners = new Set();
    bounds = {
      hero: { left: 900, top: 120, width: 400, height: 250 },
      background: { left: 1040, top: 450, width: 520, height: 210 },
      footer: { left: 100, top: 2200, width: 390, height: 180 },
    };
    let id = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.set(++id, callback); return id; });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(frame => { frames.delete(frame); });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: jest.fn(() => ({
      get matches() { return reduced; },
      addEventListener: (_event: string, callback: () => void) => preferenceListeners.add(callback),
      removeEventListener: (_event: string, callback: () => void) => preferenceListeners.delete(callback),
    })) });
    disconnectResize = jest.fn();
    global.ResizeObserver = class { observe() {} unobserve() {} disconnect = disconnectResize; } as unknown as typeof ResizeObserver;
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const placement = this.closest<HTMLElement>('[data-signal-placement]')?.dataset.signalPlacement as Placement | undefined;
      const rect = placement ? bounds[placement] : { top: 0, left: 0, width: 0, height: 0 };
      return { ...rect, x: rect.left, y: rect.top, right: rect.left + rect.width, bottom: rect.top + rect.height, toJSON: () => ({}) };
    });
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ clearRect: jest.fn(), setTransform: jest.fn() } as unknown as CanvasRenderingContext2D);
    paint.mockClear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    jest.restoreAllMocks();
    jest.useRealTimers();
    sessionStorage.clear();
    Reflect.deleteProperty(document, 'hidden');
    delete (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  function mount() {
    act(() => root.render(<SignalProvider><main><SignalSurface placement="hero" /><h1>Public page</h1></main><footer><SignalSurface placement="footer" /></footer></SignalProvider>));
  }

  function step() {
    const pending = frames.entries().next().value;
    expect(pending).toBeDefined();
    if (!pending) return;
    const [id, callback] = pending;
    frames.delete(id);
    now += 40;
    act(() => callback(now));
  }

  function surface(placement: Placement) { return container.querySelector<HTMLElement>(`[data-signal-placement="${placement}"]`)!; }
  function active() { return container.querySelector<HTMLElement>('[data-signal-placement][data-active="true"]')?.dataset.signalPlacement; }
  function button(placement: Placement) { return surface(placement).querySelector('button')!; }
  function scroll() { act(() => document.dispatchEvent(new Event('scroll'))); step(); }
  function idle() { act(() => { now += 801; jest.advanceTimersByTime(801); }); step(); }
  function changePreference(value: boolean) { act(() => { reduced = value; preferenceListeners.forEach(callback => callback()); }); step(); }

  it('uses one frame loop and one clock for all three mounted placements', () => {
    mount();
    expect(container.querySelectorAll('canvas')).toHaveLength(3);
    expect(frames.size).toBe(1);
    step();
    expect(active()).toBe('hero');
    expect(paint).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(1);
    step();
    expect(paint).toHaveBeenCalledTimes(2);
    const heroTime = paint.mock.calls[1][3];
    bounds.hero.top = -500;
    scroll();
    expect(active()).toBe('background');
    expect(paint.mock.calls.at(-1)?.[3]).toBeGreaterThan(heroTime);
    expect(frames.size).toBe(1);
    bounds.footer.top = 550;
    scroll();
    expect(active()).toBe('footer');
    expect(frames.size).toBe(1);
  });

  it('parks in the offscreen footer after scrolling stops without a floating signal loop', () => {
    mount();
    step();
    bounds.hero.top = -500;
    scroll();
    expect(active()).toBe('background');
    idle();
    expect(active()).toBeUndefined();
    expect(container.querySelector<HTMLElement>('[data-signal-system]')?.dataset.signalMode).toBe('footer');
    expect(frames.size).toBe(0);
    bounds.footer.top = 550;
    scroll();
    expect(active()).toBe('footer');
    expect(frames.size).toBe(1);
  });

  it('shares pause across controls, freezes the clock, and resumes only one loop', () => {
    mount();
    step();
    step();
    const time = paint.mock.calls.at(-1)?.[3];
    act(() => button('hero').click());
    step();
    expect(frames.size).toBe(0);
    for (const placement of ['hero', 'footer', 'background'] as Placement[]) {
      expect(button(placement).getAttribute('aria-pressed')).toBe('true');
      expect(button(placement).getAttribute('aria-label')).toBe('Resume signal motion');
    }
    expect(paint.mock.calls.at(-1)?.[3]).toBe(time);
    expect(sessionStorage.getItem('ofroot-signal-paused-v1')).toBe('true');
    now += 5000;
    act(() => button('footer').click());
    expect(frames.size).toBe(1);
    step();
    expect(paint.mock.calls.at(-1)?.[3]).toBe(time);
    step();
    expect(paint.mock.calls.at(-1)?.[3]).toBeCloseTo((time ?? 0) + 0.04);
    expect(frames.size).toBe(1);
  });

  it('lets the scrolling signal park while retaining a focused motion control', () => {
    mount();
    step();
    bounds.hero.top = -500;
    scroll();
    act(() => button('background').focus());
    idle();
    expect(active()).toBeUndefined();
    expect(frames.size).toBe(0);
    expect(surface('background').dataset.controlVisible).toBe('true');
    expect(document.activeElement).toBe(button('background'));
    act(() => button('background').blur());
    step();
    expect(surface('background').dataset.controlVisible).toBe('false');
  });

  it('renders still hero/footer marks and no traveling background under reduced motion', () => {
    reduced = true;
    mount();
    step();
    expect(active()).toBe('hero');
    expect(paint.mock.calls.at(-1)?.[4]?.still).toBe(true);
    expect(frames.size).toBe(0);
    expect(button('hero').disabled).toBe(true);
    bounds.hero.top = -500;
    scroll();
    expect(active()).toBeUndefined();
    expect(frames.size).toBe(0);
    bounds.footer.top = 550;
    scroll();
    expect(active()).toBe('footer');
    expect(paint.mock.calls.at(-1)?.[4]?.still).toBe(true);
    changePreference(false);
    expect(frames.size).toBe(1);
    expect(button('footer').disabled).toBe(false);
  });

  it('stops in hidden tabs and keeps a manual pause when the tab returns', () => {
    mount();
    step();
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(frames.size).toBe(0);
    now += 5000;
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    step();
    expect(frames.size).toBe(1);
    act(() => button('hero').click());
    step();
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    step();
    expect(frames.size).toBe(0);
  });

  it('preserves a session pause through public navigation and a provider remount', () => {
    sessionStorage.setItem('ofroot-signal-paused-v1', 'true');
    mount();
    step();
    expect(frames.size).toBe(0);
    expect(button('hero').getAttribute('aria-pressed')).toBe('true');
    mockPathname = '/news';
    mount();
    step();
    expect(frames.size).toBe(0);
    expect(button('footer').getAttribute('aria-pressed')).toBe('true');
    act(() => root.render(null));
    mount();
    step();
    expect(frames.size).toBe(0);
    expect(button('hero').getAttribute('aria-pressed')).toBe('true');
  });

  it('removes listeners, observers, pending idle callbacks, and frames on unmount', () => {
    mount();
    step();
    bounds.hero.top = -500;
    scroll();
    act(() => root.render(null));
    expect(frames.size).toBe(0);
    expect(preferenceListeners.size).toBe(0);
    expect(disconnectResize).toHaveBeenCalledTimes(1);
    act(() => { now += 1000; jest.advanceTimersByTime(1000); document.dispatchEvent(new Event('scroll')); document.dispatchEvent(new Event('visibilitychange')); });
    expect(frames.size).toBe(0);
  });

  it('removes branding motion on private navigation while preserving page content', () => {
    mount();
    step();
    mockPathname = '/dashboard/payroll';
    mount();
    expect(container.querySelector('[data-signal-placement]')).toBeNull();
    expect(container.querySelector('h1')?.textContent).toBe('Public page');
    expect(frames.size).toBe(0);
    expect(isSignalPublicPath('/auth/login')).toBe(false);
    expect(isSignalPublicPath('/invoice/private-receipt')).toBe(false);
    expect(isSignalPublicPath('/services/private-company-ai')).toBe(true);
    expect(isSignalPublicPath('/news')).toBe(true);
  });

  it('keeps the still artwork and content usable without a canvas context', () => {
    jest.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    mount();
    step();
    expect(frames.size).toBe(0);
    expect(paint).not.toHaveBeenCalled();
    expect(surface('hero').querySelector('img')?.getAttribute('src')).toBe('/brand/ofroot-pixel-signal-still.svg');
    expect(container.querySelector('h1')?.textContent).toBe('Public page');
  });
});
