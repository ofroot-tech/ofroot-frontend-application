'use client';

import { useRef, useState } from 'react';

export default function AudioPlayer({ src, title }: { src:string; title:string }) {
  const player = useRef<HTMLAudioElement>(null);
  const [failed, setFailed] = useState(false);

  function retry() {
    setFailed(false);
    player.current?.load();
    player.current?.focus();
  }

  return <>
    <audio ref={player} controls preload="none" tabIndex={0} aria-label={`Audio version of ${title}`} src={src}
      onError={() => setFailed(true)} onLoadedMetadata={() => setFailed(false)}>
      <a href={src}>Download the audio version</a>
    </audio>
    {failed && <div role="alert"><p>The recording could not load. You can read the transcript below or try again.</p><button type="button" onClick={retry}>Try audio again</button></div>}
  </>;
}
