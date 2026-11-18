/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import HeroShimmer from '@/components/growth/HeroShimmer';

jest.mock('@/components/growth/ApprovedHome.module.css', () => ({}));

describe('shared public surface semantics', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    jest.restoreAllMocks();
    delete (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  });

  it('labels the hero with its actual heading and preserves content', () => {
    act(() => root.render(<HeroShimmer headingId="service-heading" className="service-surface"><h1 id="service-heading">Useful content</h1><a href="/book">Plan your system</a></HeroShimmer>));
    const section = container.querySelector('section')!;
    expect(section.getAttribute('aria-labelledby')).toBe('service-heading');
    expect(section.hasAttribute('aria-label')).toBe(false);
    expect(section.classList.contains('service-surface')).toBe(true);
    expect(section.querySelector('h1')?.textContent).toBe('Useful content');
    expect(section.querySelector('a')?.getAttribute('href')).toBe('/book');
  });

  it('labels the footer landmark without pointing to the homepage heading', () => {
    act(() => root.render(<HeroShimmer as="footer" label="OfRoot footer"><a href="/book">Discuss your project</a></HeroShimmer>));
    const footer = container.querySelector('footer')!;
    expect(footer.getAttribute('aria-label')).toBe('OfRoot footer');
    expect(footer.hasAttribute('aria-labelledby')).toBe(false);
    expect(footer.querySelector('a')?.getAttribute('href')).toBe('/book');
  });

  it('does not create its own animation clock or duplicate motion controls', () => {
    const frame = jest.spyOn(window, 'requestAnimationFrame');
    act(() => root.render(<><HeroShimmer><h1 id="home-hero-heading">Useful content</h1></HeroShimmer><HeroShimmer as="footer" label="OfRoot footer">Footer content</HeroShimmer></>));
    expect(container.querySelector('canvas')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
    expect(frame).not.toHaveBeenCalled();
  });
});
