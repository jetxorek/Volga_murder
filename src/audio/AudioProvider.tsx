import { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { AudioController } from './AudioController';
import { TRACKS, SCENE_TO_TRACK } from './tracks';
import { AUDIO_ENABLED } from './config';

/**
 * React-обёртка: управляет AudioController при смене сцены и при
 * изменении настроек звука в store (audioMuted, audioVolume).
 * При `AUDIO_ENABLED === false` — рендерит null, ничего не создаёт.
 */
export function AudioProvider() {
  if (!AUDIO_ENABLED) return null;
  return <AudioProviderInner />;
}

function AudioProviderInner() {
  const controllerRef = useRef<AudioController | null>(null);
  const currentScene = useGameStore((s) => s.currentScene);
  const screen = useGameStore((s) => s.screen);
  const audioMuted = useGameStore((s) => s.audioMuted);
  const audioVolume = useGameStore((s) => s.audioVolume);

  useEffect(() => {
    controllerRef.current = new AudioController(() => new AudioContext());
    return () => {
      controllerRef.current?.stop();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (audioMuted) {
      controller.stop();
      return;
    }
    const trackId = screen !== 'scene' ? 'menu' : (SCENE_TO_TRACK[currentScene] ?? 'mystery');
    const track = TRACKS[trackId];
    if (track) controller.play(track);
  }, [currentScene, screen, audioMuted]);

  useEffect(() => {
    controllerRef.current?.setVolume(audioVolume);
  }, [audioVolume]);

  return null;
}
