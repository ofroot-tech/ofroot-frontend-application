import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AiProcessPage, { metadata } from '@/app/ai-process/page';
import { AiProcessDashboard } from '@/app/dashboard/ai-process/_components/AiProcessDashboard';
import { AI_PROCESS_PHASES, AI_PROCESS_STAGES } from '@/app/lib/ai-process';
import { aiProcessNavItem, baseNav, clientEnabledNav } from '@/app/dashboard/_components/Shell';
import sitemap from '@/app/sitemap';

describe('AI Process experience', () => {
  it('renders the public headline and attributed audit CTA', () => {
    const html = renderToStaticMarkup(<AiProcessPage />);
    expect(html).toContain('Find the expensive work hiding inside your business.');
    expect(html).toContain('/book?focus=ai-process-audit&amp;source=ai-process-hero');
    expect(html).toContain('Book an AI Process Audit');
  });

  it('renders every public phase from the shared definition', () => {
    const html = renderToStaticMarkup(<AiProcessPage />);
    expect(AI_PROCESS_PHASES).toHaveLength(5);
    for (const phase of AI_PROCESS_PHASES) {
      expect(html).toContain(`data-ai-public-phase="${phase.id}"`);
      expect(html).toContain(phase.title);
    }
  });

  it('publishes canonical, Open Graph, and Twitter metadata', () => {
    expect(metadata.alternates).toMatchObject({ canonical: '/ai-process' });
    expect(metadata.openGraph).toMatchObject({ url: 'https://www.ofroot.technology/ai-process' });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('renders all dashboard stages with explicit empty value states', () => {
    const html = renderToStaticMarkup(<AiProcessDashboard />);
    expect(AI_PROCESS_STAGES).toHaveLength(10);
    for (const stage of AI_PROCESS_STAGES) {
      expect(html).toContain(`data-ai-process-stage="${stage.id}"`);
    }
    expect(html).toContain('Estimated annual opportunity');
    expect(html).toContain('Not calculated');
    expect(html).toContain('No approved baseline yet.');
  });

  it('makes AI Process available in the client dashboard navigation', () => {
    expect(aiProcessNavItem).toMatchObject({ href: '/dashboard/ai-process', label: 'AI Process' });
    expect(clientEnabledNav).toContain(aiProcessNavItem);
    expect(baseNav).toContain(aiProcessNavItem);
  });

  it('includes the public route in crawl discovery', () => {
    expect(sitemap().map((entry) => entry.url)).toContain('https://www.ofroot.technology/ai-process');
  });

  it('does not publish internal pricing or unsupported client claims', () => {
    const html = renderToStaticMarkup(<AiProcessPage />);
    for (const unsupported of ['$2,500', '$5,000', '10% to 25%', 'customers served', 'guaranteed ROI']) {
      expect(html).not.toContain(unsupported);
    }
  });
});
