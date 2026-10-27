import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';

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
