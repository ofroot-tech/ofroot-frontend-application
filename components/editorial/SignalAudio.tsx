import type { PilotArticle } from '@/app/lib/signal-pilot';
import { pilotTranscript, playableAudio } from '@/app/lib/signal-pilot';
import styles from './Reading.module.css';

/** A real saved audio asset is required. Browser speech synthesis is not a
 * substitute for the downloadable, version-bound pilot recording. */
export default function SignalAudio({article}:{article:PilotArticle}) {
  const audio=playableAudio(article);
  return <section aria-labelledby="signal-audio-heading" className={styles.audio}>
    <h2 id="signal-audio-heading">Listen to this Signal</h2>
    {audio ? <><p className={styles.note}>AI-generated narration · {Math.ceil(audio.durationSeconds/60)} min</p><audio controls preload="none" aria-label={`Audio version of ${article.title}`} src={audio.path}><a href={audio.path}>Download the audio version</a></audio><a href={audio.path} download className={styles.link}>Download audio</a></> : <p className={styles.note}>The audio version is not available yet. You can read the complete short version below.</p>}
    <details><summary>Read the audio transcript</summary><p>{pilotTranscript(article)}</p></details>
  </section>;
}
