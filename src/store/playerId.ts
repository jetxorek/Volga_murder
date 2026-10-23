const PLAYER_ID_KEY = 'mfe_player_id';

/**
 * Возвращает стабильный playerId из localStorage или создаёт новый.
 * Ключ: mfe_player_id. ID генерируется через crypto.randomUUID().
 * Если localStorage недоступен (SSR, приватный режим без хранилища),
 * возвращает временный ID — игра работает, но прогресс не сохранится
 * между сессиями.
 */
export function getOrCreatePlayerId(): string {
  try {
    const existing = localStorage.getItem(PLAYER_ID_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

/** Ключ для сохранения прогресса по playerId. */
export function saveKeyFor(playerId: string): string {
  return `mfe_save_v1_${playerId}`;
}
