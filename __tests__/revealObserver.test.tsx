/** @jest-environment jsdom */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import RevealObserver from '@/app/components/RevealObserver';

jest.mock('next/navigation', () => ({ usePathname: () => '/' }));

describe('RevealObserver', () => {
  let container: HTMLDivElement;
  let root: Root;
  let observerCallback: IntersectionObserverCallback;
  let observe: jest.Mock;
  let unobserve: jest.Mock;
  let disconnect: jest.Mock;

  const setReducedMotion = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: jest.fn(() => ({
        matches,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  };

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
    setReducedMotion(false);

    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: jest.fn((callback: IntersectionObserverCallback) => {
        observerCallback = callback;
        return { observe, unobserve, disconnect, takeRecords: jest.fn(), root: null, rootMargin: '0px 0px -12% 0px', thresholds: [0.14] };
      }),
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    document.querySelectorAll('.motion-reveal, .reveal-in').forEach((element) => element.remove());
    delete document.documentElement.dataset.motionReady;
    delete (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  it('reveals an offscreen motion element once it enters the viewport', () => {
    const target = document.createElement('section');
    target.className = 'motion-reveal';
    target.getBoundingClientRect = () => ({ top: 1600, bottom: 1800 } as DOMRect);
    document.body.appendChild(target);

    act(() => root.render(<RevealObserver />));

    expect(document.documentElement.dataset.motionReady).toBe('true');
    expect(observe).toHaveBeenCalledWith(target);
    expect(target.classList.contains('in-view')).toBe(false);

    const entry = {
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRatio: 1,
      intersectionRect: target.getBoundingClientRect(),
      isIntersecting: true,
      rootBounds: null,
      target,
      time: 0,
    } as IntersectionObserverEntry;
    act(() => observerCallback([entry], {} as IntersectionObserver));

    expect(target.classList.contains('in-view')).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(target);
  });

  it('shows all content immediately when reduced motion is requested', () => {
    setReducedMotion(true);
    const target = document.createElement('section');
    target.className = 'motion-reveal';
    document.body.appendChild(target);

    act(() => root.render(<RevealObserver />));

    expect(target.classList.contains('in-view')).toBe(true);
    expect(observe).not.toHaveBeenCalled();
  });

  it('keeps content available when IntersectionObserver is unavailable', () => {
    Object.defineProperty(window, 'IntersectionObserver', { configurable: true, writable: true, value: undefined });
    const target = document.createElement('section');
    target.className = 'motion-reveal';
    document.body.appendChild(target);

    act(() => root.render(<RevealObserver />));

    expect(target.classList.contains('in-view')).toBe(true);
    expect(document.documentElement.dataset.motionReady).toBe('true');
  });
});
