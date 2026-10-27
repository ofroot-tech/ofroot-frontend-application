/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Navbar from '@/app/components/Navbar';

jest.mock('next/navigation', () => ({ usePathname: () => '/' }));
jest.mock('@/app/lib/ab', () => ({ track: jest.fn() }));

describe('navigation keyboard dismissal', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<Navbar />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
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
});
