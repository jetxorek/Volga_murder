/**
 * Глобальный флаг аудио. При `false` — Web Audio полностью
 * отключён: `AudioProvider` не создаёт `AudioController`,
 * `AudioContext` не инициализируется, в настройках нет звука.
 * Переключение — одна строка + пересборка (ADR-019).
 */
export const AUDIO_ENABLED = false;
