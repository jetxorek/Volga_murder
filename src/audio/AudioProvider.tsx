import { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import {
  AudioController,
  type AudioContextFactory,
  type AudioContextLike,
  type AudioNodeLike,
  type AudioParamLike,
  type GainNodeLike,
  type OscillatorNodeLike,
} from './AudioController';
import { TRACKS, SCENE_TO_TRACK } from './tracks';

/** no-op узел Web Audio для сред без AudioContext (happy-dom, SSR). */
function createNoopParam(): AudioParamLike {
  return {
    value: 0,
    setValueAtTime: () => undefined,
    exponentialRampToValueAtTime: () => undefined,
  };
}

function createNoopNode(): AudioNodeLike {
  return {
    connect: () => undefined,
    disconnect: () => undefined,
  };
}

function createNoopGain(): GainNodeLike {
  return {
    ...createNoopNode(),
    gain: createNoopParam(),
  };
}

function createNoopOscillator(): OscillatorNodeLike {
  return {
    ...createNoopNode(),
    frequency: createNoopParam(),
    type: 'sine',
    start: () => undefined,
    stop: () => undefined,
  };
}

/** no-op контекст для сред без Web Audio API (SSR, happy-dom). */
function createNoopAudioContext(): AudioContextLike {
  return {
    state: 'running',
    currentTime: 0,
    destination: createNoopNode(),
    resume: () => Promise.resolve(),
    createGain: createNoopGain,
    createOscillator: createNoopOscillator,
  };
}

/** Фабрика реального AudioContext с graceful fallback в средах без Web Audio. */
export const audioContextFactory: AudioContextFactory = () => {
  if (typeof AudioContext === 'undefined') {
    return createNoopAudioContext();
  }
  const ctx = new AudioContext();
  return {
    get state() {
      return ctx.state;
    },
    get currentTime() {
      return ctx.currentTime;
    },
    destination: ctx.destination,
    resume: () => ctx.resume(),
    createGain: () => ctx.createGain(),
    createOscillator: () => ctx.createOscillator(),
  };
};

/**
 * React-обёртка: управляет AudioController при смене сцены и при
 * изменении настроек звука в store (audioMuted, audioVolume).
 */
export function AudioProvider() {
  const controllerRef = useRef<AudioController | null>(null);
  const currentScene = useGameStore((s) => s.currentScene);
  const screen = useGameStore((s) => s.screen);
  const audioMuted = useGameStore((s) => s.audioMuted);
  const audioVolume = useGameStore((s) => s.audioVolume);

  useEffect(() => {
    controllerRef.current = new AudioController(audioContextFactory);
    return () => {
      controllerRef.current?.stop();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    const trackId = screen !== 'scene' ? 'menu' : (SCENE_TO_TRACK[currentScene] ?? 'mystery');
    const track = TRACKS[trackId];
    if (track) controller.play(track);
  }, [currentScene, screen]);

  useEffect(() => {
    controllerRef.current?.setMuted(audioMuted);
  }, [audioMuted]);

  useEffect(() => {
    controllerRef.current?.setVolume(audioVolume);
  }, [audioVolume]);

  return null;
}
