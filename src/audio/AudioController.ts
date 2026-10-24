import type { Track } from './tracks';

/** Минимальный интерфейс AudioContext для DI (в тестах подменяется моком). */
export type AudioContextLike = {
  readonly state: string;
  readonly currentTime: number;
  readonly destination: AudioNodeLike;
  resume: () => Promise<void>;
  createGain: () => GainNodeLike;
  createOscillator: () => OscillatorNodeLike;
};

/** Минимальный интерфейс аудиоузла — независим от DOM и happy-dom. */
export type AudioNodeLike = {
  connect(target: AudioNodeLike): void;
  disconnect(): void;
};

/** Минимальный интерфейс GainNode. */
export type GainNodeLike = AudioNodeLike & {
  gain: AudioParamLike;
};

/** Минимальный интерфейс AudioParam. */
export type AudioParamLike = {
  value: number;
  setValueAtTime: (value: number, time: number) => void;
  exponentialRampToValueAtTime: (value: number, time: number) => void;
};

/** Минимальный интерфейс OscillatorNode. */
export type OscillatorNodeLike = AudioNodeLike & {
  frequency: AudioParamLike;
  type: string;
  start: (when?: number) => void;
  stop: (when?: number) => void;
};

/** Фабрика AudioContext — DI: в браузере real, в тестах mock. */
export type AudioContextFactory = () => AudioContextLike;

type ProceduralHandle = {
  master: GainNodeLike;
  sources: OscillatorNodeLike[];
  timer: ReturnType<typeof setInterval> | null;
  stopped: boolean;
};

const MELODY_HZ = [220, 261.63, 196, 174.61];
const LOOP_SECONDS = 8;

/**
 * Чистый TS-контроллер звука без React-зависимостей.
 * Поддерживает процедурный луп (Web Audio API), volume и mute.
 */
export class AudioController {
  private readonly contextFactory: AudioContextFactory;
  private context: AudioContextLike | null = null;
  private procedural: ProceduralHandle | null = null;
  private volume = 0.5;
  private muted = false;

  constructor(contextFactory: AudioContextFactory) {
    this.contextFactory = contextFactory;
  }

  /** Останавливает текущее воспроизведение и запускает трек. */
  play(track: Track): void {
    this.stop();
    if (track.procedural) {
      this.startProcedural();
    }
    // Файловые треки появятся вместе с ассетами; сейчас audio-путей нет.
  }

  /** Полностью останавливает воспроизведение и освобождает ресурсы. */
  stop(): void {
    const handle = this.procedural;
    if (handle) {
      handle.stopped = true;
      if (handle.timer !== null) clearInterval(handle.timer);
      for (const osc of handle.sources) {
        try {
          osc.stop(this.now());
        } catch {
          // уже остановлен — ignore
        }
        osc.disconnect();
      }
      handle.master.disconnect();
      this.procedural = null;
    }
  }

  /** Устанавливает громкость (клампится в 0..1). */
  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    this.applyGain();
  }

  /** Переключает mute. */
  toggleMute(): void {
    this.setMuted(!this.muted);
  }

  /** Устанавливает mute напрямую (в дополнение к toggleMute). */
  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyGain();
  }

  private applyGain(): void {
    if (this.procedural) {
      this.procedural.master.gain.value = this.muted ? 0 : this.volume;
    }
  }

  private ensureContext(): AudioContextLike {
    if (!this.context) {
      this.context = this.contextFactory();
    }
    if (this.context.state === 'suspended') {
      void this.context.resume();
    }
    return this.context;
  }

  private now(): number {
    return this.context ? this.context.currentTime : 0;
  }

  private scheduleNotes(ctx: AudioContextLike, baseTime: number): void {
    const master = this.procedural?.master;
    if (!master) return;
    for (let i = 0; i < MELODY_HZ.length; i += 1) {
      const start = baseTime + i * 2;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(MELODY_HZ[i], start);
      osc.connect(master);
      osc.start(start);
      osc.stop(start + 1.5);
      this.procedural?.sources.push(osc);
    }
  }

  private startProcedural(): void {
    const ctx = this.ensureContext();
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : this.volume;
    master.connect(ctx.destination);
    this.procedural = { master, sources: [], timer: null, stopped: false };

    this.scheduleNotes(ctx, ctx.currentTime);

    const timer = setInterval(() => {
      if (!this.procedural || this.procedural.stopped) {
        clearInterval(timer);
        return;
      }
      this.scheduleNotes(ctx, this.now() + 0.1);
    }, LOOP_SECONDS * 1000);
    this.procedural.timer = timer;
  }
}
