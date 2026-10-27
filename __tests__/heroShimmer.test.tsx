/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import HeroShimmer from '@/components/growth/HeroShimmer';

jest.mock('@/components/growth/ApprovedHome.module.css', () => ({}));

describe('homepage background motion lifecycle', () => {
  let container: HTMLDivElement;
  let root: Root;
  let frames: Map<number, FrameRequestCallback>;
  let preference: Set<() => void>;
  let intersect: IntersectionObserverCallback;
  let reduced: boolean;
  let disconnectResize: jest.Mock;
  let disconnectIntersection: jest.Mock;
  let getContext: jest.SpyInstance;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    frames = new Map();
    preference = new Set();
    reduced = false;
    let id = 0;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.set(++id, callback); return id; });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(frame => { frames.delete(frame); });
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: jest.fn((query: string) => ({
      get matches() { return query.includes('prefers-reduced-motion') ? reduced : true; },
      addEventListener: (_event: string, callback: () => void) => preference.add(callback),
      removeEventListener: (_event: string, callback: () => void) => preference.delete(callback),
    })) });
    disconnectResize = jest.fn();
    disconnectIntersection = jest.fn();
    global.ResizeObserver = class { observe() {} unobserve() {} disconnect = disconnectResize; } as unknown as typeof ResizeObserver;
    global.IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) { intersect = callback; }
      observe() {} unobserve() {} disconnect = disconnectIntersection;
    } as unknown as typeof IntersectionObserver;
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ x: 100, y: 20, left: 100, top: 20, width: 320, height: 300, right: 420, bottom: 320, toJSON: () => ({}) });
    getContext = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ clearRect: jest.fn(), setTransform: jest.fn(), fillRect: jest.fn(), fillStyle: '' } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    jest.restoreAllMocks();
    Reflect.deleteProperty(document, 'hidden');
    delete (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  function mount() { act(() => root.render(<HeroShimmer><h1 id="home-hero-heading">Useful content</h1></HeroShimmer>)); }
  function button() { return container.querySelector('button')!; }
  function changePreference(value: boolean) { act(() => { reduced = value; preference.forEach(callback => callback()); }); }

  it('labels the footer landmark without pointing to the homepage heading', () => {
    act(() => root.render(<HeroShimmer as="footer" label="OfRoot footer"><a href="/book">Discuss your project</a></HeroShimmer>));
    const footer = container.querySelector('footer')!;
    expect(footer.getAttribute('aria-label')).toBe('OfRoot footer');
    expect(footer.hasAttribute('aria-labelledby')).toBe(false);
    expect(footer.querySelector('a')?.getAttribute('href')).toBe('/book');
  });

  it('keeps hero and footer pause controls independent', () => {
    act(() => root.render(<><HeroShimmer><h1 id="home-hero-heading">Useful content</h1></HeroShimmer><HeroShimmer as="footer" label="OfRoot footer">Footer content</HeroShimmer></>));
    const heroButton = container.querySelector('section button')!;
    const footerButton = container.querySelector('footer button')!;
    expect(frames.size).toBe(2);
    act(() => footerButton.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(frames.size).toBe(1);
    expect(footerButton.getAttribute('aria-pressed')).toBe('true');
    expect(heroButton.getAttribute('aria-pressed')).toBe('false');
    act(() => heroButton.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(frames.size).toBe(0);
    act(() => footerButton.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(frames.size).toBe(1);
  });

  it('cancels the scheduled loop when paused and resumes one loop', () => {
    mount();
    expect(frames.size).toBe(1);
    act(() => button().click());
    expect(button().getAttribute('aria-pressed')).toBe('true');
    expect(button().getAttribute('aria-label')).toBe('Resume background animation');
    expect(frames.size).toBe(0);
    act(() => button().click());
    expect(frames.size).toBe(1);
  });

  it('stops offscreen and resumes only when the hero returns', () => {
    mount();
    act(() => intersect([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(frames.size).toBe(0);
    act(() => intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(frames.size).toBe(1);
  });

  it('stops in a hidden tab and preserves the manual pause on return', () => {
    mount();
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(frames.size).toBe(0);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(frames.size).toBe(1);
    act(() => button().click());
    document.dispatchEvent(new Event('visibilitychange'));
    expect(frames.size).toBe(0);
  });

  it('draws a static field for reduced motion and responds to preference changes', () => {
    reduced = true;
    mount();
    expect(frames.size).toBe(0);
    expect(button().disabled).toBe(true);
    expect(button().textContent).toContain('Motion reduced');
    changePreference(false);
    expect(button().disabled).toBe(false);
    expect(frames.size).toBe(1);
    changePreference(true);
    expect(frames.size).toBe(0);
  });

  it('removes observers, preference listeners, and scheduled frames on unmount', () => {
    mount();
    act(() => root.render(null));
    expect(frames.size).toBe(0);
    expect(preference.size).toBe(0);
    expect(disconnectResize).toHaveBeenCalledTimes(1);
    expect(disconnectIntersection).toHaveBeenCalledTimes(1);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(frames.size).toBe(0);
  });

  it('keeps the content usable when a canvas context is unavailable', () => {
    getContext.mockReturnValue(null);
    mount();
    expect(container.querySelector('h1')?.textContent).toBe('Useful content');
    expect(container.querySelector('button')).toBeNull();
    expect(frames.size).toBe(0);
  });
});
