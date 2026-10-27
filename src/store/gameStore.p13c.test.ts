import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* noop */
  }
  useGameStore.getState().resetStore();
});

describe('addPersonalNote (P13c)', () => {
  it('добавляет личную заметку: target hint, isPersonal', () => {
    useGameStore.getState().addPersonalNote('Подозрительный стук в каюте');
    const notes = useGameStore.getState().notes;
    expect(notes.length).toBe(1);
    expect(notes[0].text).toBe('Подозрительный стук в каюте');
    expect(notes[0].target).toBe('hint');
    expect(notes[0].isPersonal).toBe(true);
    expect(useGameStore.getState().toast).toBe('Личная заметка добавлена');
  });

  it('менее 5 символов → no-op', () => {
    useGameStore.getState().addPersonalNote('abc');
    expect(useGameStore.getState().notes.length).toBe(0);
  });

  it('дубликат текста → no-op', () => {
    useGameStore.getState().addPersonalNote('Мысль о расследовании');
    useGameStore.getState().addPersonalNote('Мысль о расследовании');
    expect(useGameStore.getState().notes.length).toBe(1);
  });
});
