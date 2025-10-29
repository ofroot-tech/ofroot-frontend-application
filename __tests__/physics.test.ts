/** @jest-environment jsdom */

import { LiquidOpen } from '@/app/lib/ui/physics';

function createEl(width = 200, height = 200) {
  const el = document.createElement('div');
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  // jsdom lacks layout, stub getBoundingClientRect
  el.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    bottom: height,
    right: width,
    width,
    height,
    toJSON: () => ({}),
  } as any);
  document.body.appendChild(el);
  return el as unknown as HTMLElement;
}

describe('LiquidOpen', () => {
  let rafSpy: jest.SpyInstance<any, any>;
  let cafSpy: jest.SpyInstance<any, any>;
  beforeEach(() => {
    jest.useFakeTimers();
    rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    cafSpy = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id: number) => clearTimeout(id as any));
  });
  afterEach(() => {
    jest.useRealTimers();
    rafSpy?.mockRestore?.();
    cafSpy?.mockRestore?.();
    document.body.innerHTML = '';
  });

  it('animates clip-path on start and settles to none', () => {
    const el = createEl();
    const anim = new LiquidOpen(el);
    anim.start();
    // advance a few frames
    jest.advanceTimersByTime(200);
    expect(el.style.clipPath).toMatch(/circle\(/);
    // advance more to settle
    jest.advanceTimersByTime(2000);
    // once settled, clip-path should be cleared to none
    expect(el.style.clipPath === '' || el.style.clipPath === 'none').toBeTruthy();
  });
});
