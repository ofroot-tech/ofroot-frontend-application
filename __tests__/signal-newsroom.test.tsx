/** @jest-environment jsdom */
import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Newsroom from '@/app/news/Newsroom';
import type { NewsSnapshot } from '@/app/lib/news/types';

jest.mock('@/app/news/news.module.css', () => ({}));
jest.mock('@/app/news/signal-link.module.css', () => ({}));
jest.mock('@/components/growth/HeroShimmer', () => ({ __esModule: true, default: ({ children }: { children: ReactNode }) => <section>{children}</section> }));
jest.mock('@/components/growth/MotionText', () => ({ __esModule: true, default: ({ children }: { children: ReactNode }) => <span>{children}</span> }));
jest.mock('@/app/news/SignalHeader', () => ({ __esModule: true, default: () => <nav>Signal</nav> }));
jest.mock('@/app/news/subscriptions/SubscribeCTA', () => ({ __esModule: true, default: () => <a href="/news/subscribe">Subscribe</a> }));

const snapshot: NewsSnapshot = {
  articles: [
    { id: 'a'.repeat(20), title: 'Source A reports CVE-2026-12345', url: 'https://a.example/item', sourceId: 'a', category: 'cybersecurity', kind: 'reporting', publishedAt: '2026-10-29T12:00:00Z' },
    { id: 'b'.repeat(20), title: 'Source B advisory for CVE-2026-12345', url: 'https://b.example/item', sourceId: 'b', category: 'cybersecurity', kind: 'advisory', publishedAt: '2026-10-28T12:00:00Z' },
  ],
  sources: ['a', 'b'].map(id => ({ id, name: `Publisher ${id.toUpperCase()}`, homepage: `https://${id}.example`, categories: ['cybersecurity'], enabled: true, rights: { status: 'approved', basis: 'Test metadata', termsUrl: `https://${id}.example/terms` } })),
  checkedAt: '2026-10-29T13:00:00Z', lastSuccessfulAt: '2026-10-29T13:00:00Z', status: 'live', storage: 'memory', sourceHealth: [],
};

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  act(() => root.render(<Newsroom initialSnapshot={snapshot} />));
});
afterEach(() => { act(() => root.unmount()); host.remove(); localStorage.clear(); });

/** A story's newer reference must not hide a source match in an older member.
 * Exercise the reader controls together, rather than restating the helper. */
test('related coverage retains the member matching the selected publisher', () => {
  const source = host.querySelector<HTMLSelectElement>('select[aria-label="Filter by source"]')!;
  act(() => { source.value = 'b'; source.dispatchEvent(new Event('change', { bubbles: true })); });
  const related = [...host.querySelectorAll('button')].find(button => button.textContent?.startsWith('Related coverage'))!;
  act(() => related.click());
  const stream = host.querySelector('section[aria-labelledby="stream-title"]')!;
  expect(stream.querySelectorAll('article')).toHaveLength(1);
  expect(stream.textContent).toContain('Source B advisory');
  expect(stream.textContent).not.toContain('Source A reports');
  expect(stream.querySelector('a[href^="/news/story/"]')).not.toBeNull();
});

test('unchecked references use the Signal sources action instead of promising a ready brief', () => {
  expect(host.querySelector('a[aria-label="Read Signal brief for Source A reports CVE-2026-12345"]')).toBeNull();
  expect(host.querySelector('a[aria-label="View Signal sources for Source A reports CVE-2026-12345"]')).not.toBeNull();
});
