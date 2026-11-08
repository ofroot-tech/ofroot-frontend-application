/** @jest-environment jsdom */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import AudioPlayer from '@/components/editorial/AudioPlayer';

test('a failed recording can retry without replacing the player or losing focus', async () => {
  const environment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previous = environment.IS_REACT_ACT_ENVIRONMENT;
  environment.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const load = jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  try {
    await act(async () => { root.render(<AudioPlayer src="/missing.mp3" title="Invented failure test" />); });
    const audio = container.querySelector('audio')!;
    await act(async () => { audio.dispatchEvent(new Event('error')); });
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('recording could not load');
    const retry = container.querySelector('button')!;
    await act(async () => { retry.click(); });
    expect(load).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(audio);
    expect(container.querySelector('audio')).toBe(audio);
    expect(container.querySelector('[role="alert"]')).toBeNull();
  } finally {
    await act(async () => { root.unmount(); });
    container.remove();
    load.mockRestore();
    environment.IS_REACT_ACT_ENVIRONMENT = previous;
  }
});
