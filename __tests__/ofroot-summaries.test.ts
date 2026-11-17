import manifest from '@/content/signal-pilot.json';
import { checkedPilot, playableAudio } from '@/app/lib/signal-pilot';
import { ofrootArticleTakeaways } from '@/app/lib/signal-article-summary';
import { SECURITY_GUIDE } from '@/app/lib/application-security-content';
import { insights } from '@/app/lib/insights-content';

it('gives every published OfRoot Signal a source-derived summary and useful takeaways', () => {
  for (const article of checkedPilot(manifest.articles)) {
    expect(article.summary.split(/\s+/).length).toBeGreaterThan(20);
    expect(ofrootArticleTakeaways(article).length).toBeGreaterThanOrEqual(3);
    const insight = insights.find(item => `/insights/${item.slug}` === article.sourcePath);
    if (insight) {
      expect(article.summary).toBe(insight.directAnswer);
      for (const point of ofrootArticleTakeaways(article)) {
        expect(insight.outline.flatMap(section => section.points)).toContain(point);
      }
    }
  }
});

it('publishes the security summary without advertising an unprepared recording', () => {
  const article = checkedPilot(manifest.articles).find(item => item.sourcePath === SECURITY_GUIDE.href)!;
  expect(article.summary).toBe(SECURITY_GUIDE.summary);
  expect(playableAudio(article)).toBeNull();
  expect(ofrootArticleTakeaways(article).join(' ')).toContain('written authorization');
});

it('does not fabricate takeaways for an unknown source', () => {
  expect(ofrootArticleTakeaways({ ...manifest.articles[0], sourcePath: '/blog/unknown' })).toEqual([]);
});
