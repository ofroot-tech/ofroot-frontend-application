import { createHash } from 'node:crypto';

export const SIGNAL_PILOT_LIMIT = 30;
export type PilotArticle = {
  slug:string; title:string; sourcePath:string; summary:string; publishedAt:string;
  audio?:{ path:string; transcriptHash:string; sha256:string; durationSeconds:number };
};

export function pilotTranscript(article:PilotArticle) {
  return `${article.title}.\n\n${article.summary}\n\nThis is a short Signal from OfRoot Technology. Read the full article for its sources, context and limitations.`;
}
export function transcriptHash(article:PilotArticle) {
  return createHash('sha256').update(pilotTranscript(article)).digest('hex');
}
export function checkedPilot(items:readonly PilotArticle[]):readonly PilotArticle[] {
  if (items.length > SIGNAL_PILOT_LIMIT) throw new Error('The Signal pilot is limited to 30 total articles, including existing articles.');
  const ids=new Set<string>();
  const paths=new Set<string>();
  for (const item of items) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || ids.has(item.slug) || paths.has(item.sourcePath)) throw new Error('Each pilot article must have one unique identity and source.');
    if (!/^\/(blog|insights)\/[a-z0-9-]+$/.test(item.sourcePath)) throw new Error('Pilot sources must be published OfRoot articles.');
    if (!item.title.trim() || !item.summary.trim() || item.summary.length > 1600 || !Number.isFinite(Date.parse(item.publishedAt))) throw new Error('An article needs its title, concise summary and actual publication date.');
    ids.add(item.slug); paths.add(item.sourcePath);
  }
  return items;
}
/** Retrying the same article does not consume another slot. Corrections retain
 * its slot; old narration is invalid until it matches the corrected transcript. */
export function registerPilotArticle(items:readonly PilotArticle[], article:PilotArticle) {
  checkedPilot(items);
  const existing=items.find(item=>item.slug===article.slug || item.sourcePath===article.sourcePath);
  if (existing && (existing.slug!==article.slug || existing.sourcePath!==article.sourcePath)) throw new Error('The existing article identity cannot be replaced.');
  const next=existing ? items.map(item=>item===existing ? article : item) : [...items,article];
  return checkedPilot(next);
}
export function playableAudio(article:PilotArticle) {
  const audio=article.audio;
  return audio && /^\/audio\/signal-pilot\/[a-z0-9-]+\.mp3$/.test(audio.path) && /^[a-f0-9]{64}$/.test(audio.sha256) && audio.durationSeconds>0 && Number.isFinite(audio.durationSeconds) && audio.transcriptHash===transcriptHash(article) ? audio : null;
}
