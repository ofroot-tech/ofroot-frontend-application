/** @jest-environment jsdom */

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import SmoothAnchorScroll from '@/components/SmoothAnchorScroll';

describe('anchor scroll cleanup', () => {
  let root: Root;
  let target: HTMLElement;
  let link: HTMLAnchorElement;
  let snap: HTMLElement;
  let reduce: boolean;
  let motionListeners: Set<() => void>;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    jest.useFakeTimers();
    reduce = false;
    motionListeners = new Set();
    window.matchMedia = jest.fn(() => ({
      get matches() { return reduce; },
      addEventListener: (_event: string, listener: () => void) => motionListeners.add(listener),
      removeEventListener: (_event: string, listener: () => void) => motionListeners.delete(listener),
    } as unknown as MediaQueryList));
    document.body.innerHTML = '<div id="root"></div><div class="snap-page"><a href="#capabilities">Capabilities</a><section id="capabilities" style="scroll-margin-top:96px"></section></div>';
    target = document.querySelector('section')!;
    link = document.querySelector('a')!;
    snap = document.querySelector('.snap-page')!;
    target.scrollIntoView = jest.fn();
    target.getBoundingClientRect = jest.fn(() => ({ top: 96 } as DOMRect));
    root = createRoot(document.getElementById('root')!);
    act(() => root.render(<SmoothAnchorScroll />));
  });

  afterEach(() => {
    act(() => root.unmount());
    jest.useRealTimers();
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  const click = (options: MouseEventInit = {}) => link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...options }));

  it('ends a scroll with a margin after a bounded timeout and leaves no frame loop', () => {
    const raf = jest.spyOn(window, 'requestAnimationFrame');
    click();
    expect(snap.classList.contains('snap-disabled')).toBe(true);
    jest.advanceTimersByTime(1100);
    expect(snap.classList.contains('snap-disabled')).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
    expect(motionListeners.size).toBe(0);
    expect(raf).not.toHaveBeenCalled();
  });

  it('cancels the previous operation when another anchor is clicked', () => {
    click();
    jest.advanceTimersByTime(500);
    click();
    expect(jest.getTimerCount()).toBe(1);
    jest.advanceTimersByTime(500);
    expect(snap.classList.contains('snap-disabled')).toBe(true);
    jest.advanceTimersByTime(500);
    expect(snap.classList.contains('snap-disabled')).toBe(false);
  });

  it.each(['scrollend', 'wheel', 'touchstart'])('cleans up on %s', event => {
    click();
    (event === 'scrollend' ? snap : window).dispatchEvent(new Event(event));
    expect(snap.classList.contains('snap-disabled')).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
    expect(motionListeners.size).toBe(0);
  });

  it('cleans up when the component unmounts', () => {
    click();
    act(() => root.render(null));
    expect(jest.getTimerCount()).toBe(0);
    expect(snap.classList.contains('snap-disabled')).toBe(false);
    expect(motionListeners.size).toBe(0);
  });

  it('uses instant scrolling for reduced motion, including a change during scrolling', () => {
    click();
    reduce = true;
    motionListeners.forEach(listener => listener());
    expect(target.scrollIntoView).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'instant' }));
    expect(jest.getTimerCount()).toBe(0);
    click();
    expect(target.scrollIntoView).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'instant' }));
    expect(jest.getTimerCount()).toBe(0);
  });

  it('leaves modified clicks and new-tab links to the browser', () => {
    click({ ctrlKey: true });
    link.target = '_blank';
    click();
    expect(target.scrollIntoView).not.toHaveBeenCalled();
  });
});
