/** Трек: идентификатор для AudioProvider и путь к файлу (если есть). */
export type Track = {
  /** Процедурный луп через Web Audio API вместо файла. */
  procedural?: boolean;
  path?: string;
};

export const TRACKS: Record<string, Track> = {
  menu: { procedural: true },
  mystery: { procedural: true },
};

/** Соответствие sceneId → trackId. Неизвестные сцены → undefined. */
export const SCENE_TO_TRACK: Record<string, string> = {
  ch1_01: 'mystery',
};
