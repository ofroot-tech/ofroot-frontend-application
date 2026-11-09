import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CANONICAL_SITE_URL } from '@/app/config/site';
import { featurePages, featurePath } from '@/app/lib/feature-content';
import { growthPages } from '@/app/lib/growth-content';
import { insights } from '@/app/lib/insights-content';
import { agentDiscoveryHeaders, CONTENT_SIGNAL, getPublicMarkdown, markdownResponse, prefersMarkdown } from '@/app/lib/agent-readiness';
import robots from '@/app/robots';
import { agentRobotsText, PRIVATE_ROBOT_PATHS } from '@/app/lib/agent-robots';

describe('public Markdown delivery', () => {
  test.each([
    [null, false], ['', false], ['*/*', false], ['text/*', false],
    ['text/html,application/xhtml+xml,*/*;q=0.8', false],
    ['text/markdown', true], ['TEXT/MARKDOWN; charset=utf-8', true],
    ['text/markdown;q=0', false], ['text/markdown;q=0, */*;q=1', false],
    ['text/markdown;q=0.5,text/html;q=0.9', false],
    ['text/markdown;q=0.9,text/html;q=0.5', true],
    ['text/markdown;q=0.5,*/*;q=0.9', false],
    ['text/markdown;q=0.9,text/html;q=0,*/*;q=1', true],
    ['text/markdown;q=invalid', false], ['text/markdown;q=1.1', false],
  ])('negotiates %s as Markdown=%s', (accept, expected) => {
    expect(prefersMarkdown(accept)).toBe(expected);
  });

  it('leaves ordinary HTML and mutation requests unchanged', () => {
    expect(markdownResponse('GET', '/', 'text/html')).toBeNull();
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
      expect(markdownResponse(method, '/', 'text/markdown')).toBeNull();
    }
  });

  it('returns the same public headers without a body for HEAD', () => {
    const get = markdownResponse('GET', '/', 'text/markdown');
    const head = markdownResponse('HEAD', '/', 'text/markdown');
    expect(get?.body).toContain('Less manual work. More time to grow.');
    expect(head?.body).toBeNull();
    expect(head?.headers).toEqual(get?.headers);
    expect(get?.headers.Vary).toBe('Accept');
    expect(get?.headers['Content-Type']).toBe('text/markdown; charset=utf-8');
  });

  it.each(['/dashboard', '/api/sales-inquiry', '/auth/login', '/debug', '/intro-letters', '/services/unknown', '/insights/unknown', '//example.com', 'https://example.com', '/services/../dashboard', '/?token=secret'])('never represents unapproved path %s', path => {
    expect(getPublicMarkdown(path)).toBeNull();
    expect(agentDiscoveryHeaders(path)).toBeNull();
    expect(markdownResponse('GET', path, 'text/markdown')).toBeNull();
  });

  it('uses each service and solution page’s source content', () => {
    for (const content of Object.values(growthPages)) {
      const markdown = getPublicMarkdown(content.path);
      expect(markdown).toContain(content.title);
      expect(markdown).toContain(content.summary);
      expect(markdown).toContain(`${CANONICAL_SITE_URL}${content.path}`);
      for (const section of content.sections) expect(markdown).toContain(section.body);
    }
    expect(getPublicMarkdown(growthPages.aiDiscoverability.path)).not.toBe(getPublicMarkdown(growthPages.automationSystems.path));
  });

  it('preserves specific capability answers, FAQs and illustrative examples', () => {
    for (const feature of featurePages) {
      const markdown = getPublicMarkdown(featurePath(feature));
      expect(markdown).toContain(feature.directAnswer);
      expect(markdown).toContain(feature.example.body);
      for (const faq of feature.faqs) expect(markdown).toContain(faq.answer);
    }
  });

  it('preserves article answers, evidence links and update dates', () => {
    for (const insight of insights) {
      const markdown = getPublicMarkdown(`/insights/${insight.slug}`);
      expect(markdown).toContain(insight.directAnswer);
      expect(markdown).toContain(insight.updated);
      for (const source of insight.sources) expect(markdown).toContain(source.href);
    }
  });

  it('keeps the homepage’s current position and inquiry expectations', () => {
    const markdown = getPublicMarkdown('/')!;
    const page = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
    const hero = readFileSync(join(process.cwd(), 'components/growth/HomeHero.tsx'), 'utf8');
    for (const copy of [
      'We connect your tools, automate repetitive tasks, and set up AI around the work your team actually does.',
      'Work directly with Dimitri, a full-stack developer and solutions architect with 11 years in technology. Start with a defined problem, review the work as it develops, and agree on handoff or ongoing support.',
      'Tell us about your business, where work gets stuck, and the outcome you want. We review your request and reply by email with a recommended next step. We arrange a conversation when there is a useful fit.',
    ]) {
      expect(page + hero).toContain(copy);
      expect(markdown).toContain(copy);
    }
    expect(markdown).not.toContain('Starting at $');
  });
});

describe('public crawl policy and discovery', () => {
  it('keeps existing crawl exclusions in every bot group and adds an explicit content policy', () => {
    const text = agentRobotsText();
    const groups = text.split('\n\n').filter(group => group.startsWith('User-Agent:'));
    expect(groups).toHaveLength(2);
    expect(text).toContain('User-Agent: OAI-SearchBot\nUser-Agent: ChatGPT-User');
    for (const group of groups) {
      expect(group).toContain(`Content-Signal: ${CONTENT_SIGNAL}`);
      for (const path of PRIVATE_ROBOT_PATHS) expect(group).toContain(`Disallow: ${path}`);
    }
    expect(text).toContain(`Sitemap: ${robots().sitemap}`);
    expect(text).toContain(`Host: ${CANONICAL_SITE_URL}`);
    expect(CONTENT_SIGNAL).toBe('search=yes, ai-input=yes, ai-train=no');
  });

  it('advertises real descriptions and a page-specific alternate without inventing protocols', () => {
    const path = growthPages.automationSystems.path;
    const headers = agentDiscoveryHeaders(path)!;
    expect(headers.Link).toContain('</llms.txt>; rel="describedby"; type="text/plain"');
    expect(headers.Link).toContain(`<${CANONICAL_SITE_URL}${path}>; rel="alternate"; type="text/markdown"`);
    expect(headers.Link).not.toMatch(/api-catalog|mcp|oauth/);
    expect(headers['Content-Signal']).toBe(CONTENT_SIGNAL);
  });
});
