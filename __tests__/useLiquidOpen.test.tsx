/** @jest-environment jsdom */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { useLiquidOpen } from '@/app/lib/ui/useLiquidOpen';

function TestComp({ active }: { active: boolean }) {
  const ref = useLiquidOpen(active);
  return React.createElement('div', { 'data-testid': 'panel', ref: ref as any, style: { width: 200, height: 200 } });
}

describe('useLiquidOpen', () => {
  let container: HTMLDivElement;
  let root: any;
  let rafSpy: jest.SpyInstance<any, any>;
  let cafSpy: jest.SpyInstance<any, any>;
  beforeEach(() => {
    jest.useFakeTimers();
    rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    cafSpy = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id: number) => clearTimeout(id as any));
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    jest.useRealTimers();
    rafSpy?.mockRestore?.();
    cafSpy?.mockRestore?.();
    root?.unmount?.();
    document.body.innerHTML = '';
  });

  it('reveals when active and cleans up', () => {
    act(() => {
      root.render(React.createElement(TestComp, { active: false }));
    });
    const el = container.querySelector('[data-testid="panel"]') as HTMLElement;
    el.getBoundingClientRect = () => ({ width: 200, height: 200 } as any);

    act(() => {
      root.render(React.createElement(TestComp, { active: true }));
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    const currentClip = el.style.clipPath || (el.style as any).webkitClipPath;
    expect(currentClip).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(el.style.clipPath === '' || el.style.clipPath === 'none').toBeTruthy();
  });
});
