import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';
import { SaveStateSchema } from '../schemas/saveState';
import type { SaveState } from '../schemas/saveState';
import { fromSaveState } from './saveStateMapper';

/**
 * Raw-объект «старого» сохранения (JSON из localStorage до P16a): все поля
 * SaveState, кроме connections. Дженерик-констрейнт гарантирует полноту
 * полей; return-путь — Object.fromEntries (типизируется как Partial), без any/as.
 */
function legacySaveWithoutConnections<T extends Omit<SaveState, 'connections'>>(
  save: T,
): Partial<SaveState> {
  const entries = Object.entries(save).filter(([k]) => k !== 'connections');
  return Object.fromEntries(entries);
}

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* */
  }
  useGameStore.getState().resetStore();
});

describe('addConnection', () => {
  it('добавляет связь', () => {
    useGameStore.getState().addConnection('char_02', 'char_03', 'love');
    const conns = useGameStore.getState().connections;
    expect(conns.length).toBe(1);
    expect(conns[0].from).toBe('char_02');
    expect(conns[0].to).toBe('char_03');
    expect(conns[0].type).toBe('love');
  });

  it('from === to → no-op', () => {
    useGameStore.getState().addConnection('char_02', 'char_02', 'family');
    expect(useGameStore.getState().connections.length).toBe(0);
  });

  it('дубликат (та же пара + тип) → no-op', () => {
    useGameStore.getState().addConnection('char_02', 'char_03', 'love');
    useGameStore.getState().addConnection('char_02', 'char_03', 'love');
    expect(useGameStore.getState().connections.length).toBe(1);
  });

  it('обратная пара (from/to поменяны) → no-op', () => {
    useGameStore.getState().addConnection('char_02', 'char_03', 'love');
    useGameStore.getState().addConnection('char_03', 'char_02', 'love');
    expect(useGameStore.getState().connections.length).toBe(1);
  });

  it('другой тип для той же пары → добавляется', () => {
    useGameStore.getState().addConnection('char_02', 'char_03', 'love');
    useGameStore.getState().addConnection('char_02', 'char_03', 'debt');
    expect(useGameStore.getState().connections.length).toBe(2);
  });
});

describe('removeConnection', () => {
  it('удаляет по id', () => {
    useGameStore.getState().addConnection('char_02', 'char_03', 'love');
    const id = useGameStore.getState().connections[0].id;
    useGameStore.getState().removeConnection(id);
    expect(useGameStore.getState().connections.length).toBe(0);
  });
});

describe('fromSaveState — нормализация connections', () => {
  it('fromSaveState нормализует отсутствующие connections → []', () => {
    // Минимальный SaveState без connections (старое сохранение).
    // raw-объект из старого localStorage: приводим через .strict()-схему,
    // parse применяет .default([]) — any/as не нужны.
    const oldRaw = {
      version: 1,
      playerId: 'x',
      chapter: 1,
      currentScene: 'ch1_01',
      currentNode: 'n1',
      sceneSlotsLeft: 5,
      suspicion: 0,
      trust: {},
      notes: [],
      links: [],
      hintsUsed: { greyCells: 0, memoryTheater: 0, snowWindow: 0 },
      deaths: 0,
      deathsInChapter: 0,
      visitedScenes: [],
      unlockedEndings: [],
      tutorialStepsSeen: [],
      hubState: null,
      updatedAt: 0,
    };
    const parsed = SaveStateSchema.parse(oldRaw);
    expect(parsed.connections).toEqual([]);

    // Собственно фикс: в fromSaveState попадает объект, у которого поля
    // connections нет вовсе (старый JSON из localStorage, без parse) →
    // ?? [] даёт []. Конструируется типизированно — any/as не нужны.
    const legacy = legacySaveWithoutConnections(parsed);
    const partial = fromSaveState({ ...legacy, connections: [] });
    expect(partial.connections).toEqual([]);
  });
});
