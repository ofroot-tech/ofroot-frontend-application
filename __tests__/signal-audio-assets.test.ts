import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import manifest from '@/content/signal-pilot.json';
import { checkedPilot, playableAudio } from '@/app/lib/signal-pilot';
import { AI_PROCESS_GUIDE } from '@/app/lib/ai-process-guide';
import { insights } from '@/app/lib/insights-content';

test('every enrolled article ships the exact accepted recording for its current transcript', () => {
  for (const article of checkedPilot(manifest.articles)) {
    const audio = playableAudio(article);
    expect(audio).not.toBeNull();
    if (!audio) throw new Error(`Prepare and verify the audio for ${article.slug} before publishing.`);
    const bytes = readFileSync(path.join(process.cwd(), 'public', audio.path));
    expect(bytes.length).toBeGreaterThan(1_000);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(audio.sha256);
  }
});

test('the publishing list covers existing guides and keeps their short versions current', () => {
  const articles = checkedPilot(manifest.articles);
  const guides = [
    { sourcePath:AI_PROCESS_GUIDE.href, title:AI_PROCESS_GUIDE.title, summary:AI_PROCESS_GUIDE.description, publishedAt:AI_PROCESS_GUIDE.publishedAt },
    ...insights.map(item => ({ sourcePath:`/insights/${item.slug}`, title:item.title, summary:item.directAnswer, publishedAt:item.published ?? '2026-07-22' })),
  ];
  if (articles.length < 30) {
    const staticBlogRoutes = readdirSync(path.join(process.cwd(), 'app/blog'), { withFileTypes:true })
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('[') && existsSync(path.join(process.cwd(), 'app/blog', entry.name, 'page.tsx')))
      .map(entry => `/blog/${entry.name}`);
    expect(staticBlogRoutes.filter(route => !articles.some(article => article.sourcePath === route))).toEqual([]);
    expect(guides.filter(guide => !articles.some(article => article.sourcePath === guide.sourcePath))).toEqual([]);
  }
  for (const article of articles) {
    const guide = guides.find(item => item.sourcePath === article.sourcePath);
    if (guide) expect({ title:article.title, summary:article.summary, publishedAt:article.publishedAt }).toEqual({ title:guide.title, summary:guide.summary, publishedAt:guide.publishedAt });
  }
});
