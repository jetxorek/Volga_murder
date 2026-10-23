import type { Note } from '../schemas/note';
import type { Condition, Effects } from '../schemas/effects';

/**
 * Минимальное состояние для движка эффектов и проверок.
 * Подмножество SaveState — по правилу «домен принимает минимальные данные».
 */
export type GameState = {
  suspicion: number;
  trust: Record<string, number>;
  notes: Note[];
};

/**
 * Проверяет условие. Все заданные поля должны пройти; незаданные
 * игнорируются. Пустое условие → true.
 */
export function evaluateCondition(state: GameState, condition: Condition): boolean {
  if (condition.suspicionBelow !== undefined) {
    if (state.suspicion >= condition.suspicionBelow) return false;
  }
  if (condition.suspicionAbove !== undefined) {
    if (state.suspicion <= condition.suspicionAbove) return false;
  }
  if (condition.trustBelow !== undefined) {
    const current = state.trust[condition.trustBelow.charId] ?? 0;
    if (current >= condition.trustBelow.value) return false;
  }
  if (condition.hasNoteIds !== undefined) {
    const ids = new Set(state.notes.map((n) => n.id));
    for (const id of condition.hasNoteIds) {
      if (!ids.has(id)) return false;
    }
  }
  if (condition.notHasNoteIds !== undefined) {
    const ids = new Set(state.notes.map((n) => n.id));
    for (const id of condition.notHasNoteIds) {
      if (ids.has(id)) return false;
    }
  }
  return true;
}

/**
 * Применяет эффекты к state, возвращая новое состояние.
 * suspicionDelta и trustDelta клампятся в допустимые диапазоны.
 *
 * addNoteIds, removeNoteIds, setFlag НЕ обрабатываются в MVP:
 * эти поля не используются ни в одной из 38 сцен (проверено в P2c).
 * При появлении первой сцены с этими эффектами — реализовать.
 */
export function applyEffects(state: GameState, effects: Effects): GameState {
  let suspicion = state.suspicion;
  if (effects.suspicionDelta !== undefined) {
    suspicion = clamp(suspicion + effects.suspicionDelta, 0, 100);
  }

  let trust = state.trust;
  if (effects.trustDelta !== undefined) {
    trust = { ...state.trust };
    for (const [charId, delta] of Object.entries(effects.trustDelta)) {
      const current = trust[charId] ?? 0;
      trust[charId] = clamp(current + delta, 0, 3);
    }
  }

  return { suspicion, trust, notes: state.notes };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
