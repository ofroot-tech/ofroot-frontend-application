/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Navbar from '@/app/components/Navbar';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({ usePathname: jest.fn(() => '/services') }));
jest.mock('@/app/components/PublicChrome.module.css', () => ({}));
jest.mock('@/components/brand/SiteBrand.module.css', () => ({}));
jest.mock('@/app/lib/ab', () => ({ track: jest.fn() }));

describe('navigation keyboard dismissal', () => {
  let container: HTMLDivElement;
  let root: Root;
  let mobile: boolean;
  let mediaListeners: Set<() => void>;

  beforeEach(() => {
    jest.mocked(usePathname).mockReturnValue('/services');
    mobile = true;
    mediaListeners = new Set();
    window.matchMedia = jest.fn(() => ({
      get matches() { return mobile; },
      addEventListener: (_event: string, listener: () => void) => mediaListeners.add(listener),
      removeEventListener: (_event: string, listener: () => void) => mediaListeners.delete(listener),
    } as unknown as MediaQueryList));
    jest.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<Navbar />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    jest.restoreAllMocks();
    document.body.style.overflow = '';
    delete (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  function desktopGroup(label = 'Services') {
    const summary = container.querySelector<HTMLElement>(`summary[aria-label="${label} navigation"]`)!;
    return { summary, details: summary.closest('details')!, link: summary.closest('details')!.querySelector('a')! };
  }

  function press(element: HTMLElement, key: string) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    act(() => element.dispatchEvent(event));
    return event;
  }

  it.each(['Services', 'Solutions', 'Free Tools'])('closes %s on Escape from a child link and restores summary focus', label => {
    const { summary, details, link } = desktopGroup(label);
    details.open = true;
    link.focus();
    expect(document.activeElement).toBe(link);

    const event = press(link, 'Escape');

    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(summary);
    expect(event.defaultPrevented).toBe(true);
  });

  it('closes on Escape from the summary without affecting another disclosure', () => {
    const { summary, details } = desktopGroup();
    const other = desktopGroup('Solutions').details;
    details.open = true;
    other.open = true;
    summary.focus();

    press(summary, 'Escape');

    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(summary);
    expect(other.open).toBe(true);
  });

  it('leaves other keys and closed disclosures to native browser behavior', () => {
    const { summary, details, link } = desktopGroup();
    details.open = true;
    link.focus();
    const tab = press(link, 'Tab');
    expect(details.open).toBe(true);
    expect(tab.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(link);

    details.open = false;
    summary.focus();
    const escape = press(summary, 'Escape');
    expect(details.open).toBe(false);
    expect(escape.defaultPrevented).toBe(false);
  });

  it('preserves homepage service disclosure dismissal after the navigation changes', () => {
    jest.mocked(usePathname).mockReturnValue('/');
    act(() => root.render(<Navbar />));
    const { summary, details, link } = desktopGroup();
    details.open = true;
    link.focus();
    press(link, 'Escape');
    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(summary);
  });

  it('preserves mobile Escape dismissal and return focus', () => {
    const trigger = container.querySelector<HTMLButtonElement>('button[aria-label="Open navigation"]')!;
    trigger.focus();
    act(() => trigger.click());
    const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    const link = dialog.querySelector('a')!;
    link.focus();

    press(link, 'Escape');

    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe('');
  });

  it('dismisses desktop disclosures when focus moves outside or another area is clicked', () => {
    const { summary, details, link } = desktopGroup();
    details.open = true;
    link.focus();
    act(() => container.querySelector<HTMLAnchorElement>('a')!.focus());
    expect(details.open).toBe(false);
    details.open = true;
    act(() => document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })));
    expect(details.open).toBe(false);
    expect(summary).not.toBeNull();
  });

  it('restores existing overflow after closing the mobile menu', () => {
    document.body.style.overflow = 'clip';
    const trigger = container.querySelector<HTMLButtonElement>('button[aria-label="Open navigation"]')!;
    trigger.focus();
    act(() => trigger.click());
    expect(document.body.style.overflow).toBe('hidden');
    press(container.querySelector<HTMLElement>('[role="dialog"]')!, 'Escape');
    expect(document.body.style.overflow).toBe('clip');
    expect(document.activeElement).toBe(trigger);
  });

  it('closes the mobile menu and releases its scroll lock on desktop resize', () => {
    act(() => container.querySelector<HTMLButtonElement>('button[aria-label="Open navigation"]')!.click());
    act(() => { mobile = false; mediaListeners.forEach(listener => listener()); });
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(mediaListeners.size).toBe(0);
  });

  it('releases the scroll lock when navigation moves to a page with its own shell', () => {
    act(() => container.querySelector<HTMLButtonElement>('button[aria-label="Open navigation"]')!.click());
    jest.mocked(usePathname).mockReturnValue('/dashboard');
    act(() => root.render(<Navbar />));
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('wraps keyboard focus within the mobile menu', () => {
    act(() => container.querySelector<HTMLButtonElement>('button[aria-label="Open navigation"]')!.click());
    const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!;
    const nodes = [...dialog.querySelectorAll<HTMLElement>('a,button')];
    nodes[nodes.length - 1].focus();
    press(nodes[nodes.length - 1], 'Tab');
    expect(document.activeElement).toBe(nodes[0]);
    const back = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    act(() => nodes[0].dispatchEvent(back));
    expect(document.activeElement).toBe(nodes[nodes.length - 1]);
  });
});
