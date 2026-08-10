import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('@/app/lib/api', () => ({
  api: {
    publicListBlogPosts: jest.fn().mockResolvedValue({ data: { items: [] } }),
  },
}));

import BlogPage, { metadata as blogMetadata } from '@/app/blog/page';
import AiProcessGuidePage, { metadata as articleMetadata } from '@/app/blog/find-expensive-manual-work-before-automating/page';
import AiProcessPage from '@/app/ai-process/page';
import { AI_PROCESS_GUIDE } from '@/app/lib/ai-process-guide';
import { insights } from '@/app/lib/insights-content';
import sitemap from '@/app/sitemap';

describe('AI Process supporting article', () => {
  it('renders the article with contextual service and booking links', () => {
    const html = renderToStaticMarkup(<AiProcessGuidePage />);
    expect(html).toContain(AI_PROCESS_GUIDE.title);
    expect(html).toContain('AI Process Audit');
    expect(html).toContain('href="/ai-process"');
    expect(html).toContain('href="/services/automation-systems"');
    expect(html).toContain('/book?focus=ai-process-audit&amp;source=ai-process-article');
  });

  it('features the source-controlled article when API posts are empty', async () => {
    const html = renderToStaticMarkup(await BlogPage());
    expect(html).toContain(AI_PROCESS_GUIDE.title);
    expect(html).toContain(`href="${AI_PROCESS_GUIDE.href}"`);
    expect(html).toContain('Choose the next question.');
    expect(html).not.toContain('More field notes are being prepared.');
    for (const insight of insights) {
      expect(html).toContain(insight.title);
      expect(html).toContain(`href="/insights/${insight.slug}"`);
    }
  });

  it('links from the AI Process page back to the article', () => {
    const html = renderToStaticMarkup(<AiProcessPage />);
    expect(html).toContain(`href="${AI_PROCESS_GUIDE.href}"`);
    expect(html).toContain('Read how to find the right work first');
  });

  it('publishes canonical metadata and crawl discovery', () => {
    expect(articleMetadata.alternates).toMatchObject({ canonical: AI_PROCESS_GUIDE.href });
    expect(articleMetadata.openGraph).toMatchObject({ url: `https://www.ofroot.technology${AI_PROCESS_GUIDE.href}`, type: 'article' });
    expect(blogMetadata.alternates).toMatchObject({ canonical: '/blog' });
    expect(sitemap().map((entry) => entry.url)).toContain(`https://www.ofroot.technology${AI_PROCESS_GUIDE.href}`);
  });

  it('does not publish internal pricing or guaranteed outcomes', () => {
    const html = renderToStaticMarkup(<AiProcessGuidePage />);
    for (const unsupported of ['$2,500', '$5,000', '10% to 25%', 'guaranteed ROI', 'customers served']) {
      expect(html).not.toContain(unsupported);
    }
  });
});
