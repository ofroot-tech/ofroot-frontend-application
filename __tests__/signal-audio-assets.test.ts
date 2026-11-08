import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import manifest from '@/content/signal-pilot.json';
import { checkedPilot, playableAudio } from '@/app/lib/signal-pilot';

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
