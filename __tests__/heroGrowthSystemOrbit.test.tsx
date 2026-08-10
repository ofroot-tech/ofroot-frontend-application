/** @jest-environment jsdom */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import HeroGrowthSystemOrbit from '@/components/growth/HeroGrowthSystemOrbit';

describe('HeroGrowthSystemOrbit', () => {
  let container: HTMLDivElement;
  let root: Root;
  let observerCallback: IntersectionObserverCallback;
  let disconnect: jest.Mock;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    disconnect = jest.fn();

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: jest.fn((callback: IntersectionObserverCallback) => {
        observerCallback = callback;
        return { observe: jest.fn(), disconnect, unobserve: jest.fn(), takeRecords: jest.fn(), root: null, rootMargin: '0px', thresholds: [0.2] };
      }),
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  it('keeps the complete system explanation in the static first frame', () => {
    act(() => root.render(<HeroGrowthSystemOrbit />));
    const orbit = container.querySelector('[role="img"]');

    expect(orbit?.getAttribute('aria-label')).toBe('One connected growth system: Discover, Convert, Operate');
    expect(orbit?.getAttribute('data-animate')).toBe('false');
    expect(orbit?.textContent).toContain('Discover');
    expect(orbit?.textContent).toContain('Convert');
    expect(orbit?.textContent).toContain('Operate');
  });

  it('runs only while the orbit is visible and the document is active', () => {
    act(() => root.render(<HeroGrowthSystemOrbit />));
    const orbit = container.querySelector('[data-animate]');

    expect(orbit?.getAttribute('data-animate')).toBe('false');

    act(() => observerCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(orbit?.getAttribute('data-animate')).toBe('true');

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(orbit?.getAttribute('data-animate')).toBe('false');

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(orbit?.getAttribute('data-animate')).toBe('true');

    act(() => observerCallback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(orbit?.getAttribute('data-animate')).toBe('false');
  });

  it('disconnects its visibility observer when removed', () => {
    act(() => root.render(<HeroGrowthSystemOrbit />));
    act(() => root.unmount());

    expect(disconnect).toHaveBeenCalledTimes(1);
    root = createRoot(container);
  });
});
