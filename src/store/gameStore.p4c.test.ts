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

describe('pickHubOptionAction', () => {
  it('первый pick → picked, remaining 2→1, вход в под-сцену', () => {
    useGameStore.getState().enterSceneById('ch2_02');
    useGameStore.getState().pickHubOptionAction('ch2_02a');
    const s = useGameStore.getState();
    expect(s.hubState?.picked).toEqual(['ch2_02a']);
    expect(s.hubState?.remaining).toBe(1);
    expect(s.currentScene).toBe('ch2_02a');
    expect(s.sceneSlotsLeft).toBe(4); // 5 - 1
  });

  it('несуществующая под-сцена → console.error, состояние не меняется', () => {
    useGameStore.getState().enterSceneById('ch2_02');
    useGameStore.getState().pickHubOptionAction('nope');
    expect(useGameStore.getState().currentScene).toBe('ch2_02');
  });

  it('не hub → console.error', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    useGameStore.getState().pickHubOptionAction('ch2_02a');
    expect(useGameStore.getState().currentScene).toBe('ch1_01');
  });
});

describe('completeHub', () => {
  it('после 2 pick → переход на ch2_03, hubState = null', () => {
    useGameStore.getState().enterSceneById('ch2_02');
    useGameStore.getState().pickHubOptionAction('ch2_02a');
    // возврат в hub: advance по end-узлу под-сцены ведёт в ch2_02
    useGameStore.getState().advance(); // n1
    useGameStore.getState().advance(); // n2
    useGameStore.getState().advance(); // n3 end → ch2_02
    expect(useGameStore.getState().currentScene).toBe('ch2_02');
    useGameStore.getState().pickHubOptionAction('ch2_02b');
    // возврат
    useGameStore.getState().advance();
    useGameStore.getState().advance();
    useGameStore.getState().advance();
    expect(useGameStore.getState().currentScene).toBe('ch2_02');
    useGameStore.getState().completeHub();
    const s = useGameStore.getState();
    expect(s.currentScene).toBe('ch2_03');
    expect(s.hubState).toBeNull();
  });

  it('hub не завершён → console.error', () => {
    useGameStore.getState().enterSceneById('ch2_02');
    useGameStore.getState().completeHub();
    expect(useGameStore.getState().currentScene).toBe('ch2_02');
  });
});

describe('dismissDeath', () => {
  it('обычный режим: откат к началу главы, overlay → none', () => {
    useGameStore.getState().enterSceneById('ch3_02');
    useGameStore.setState({ overlay: 'death', deathsInChapter: 1, chapter: 3 });
    useGameStore.getState().dismissDeath();
    const s = useGameStore.getState();
    expect(s.overlay).toBe('none');
    expect(s.currentScene).toBe('ch3_01');
    // ch3_01 — hub-сцена (slotCost: 0), поэтому после resetSlots (5) слоты не тратятся
    expect(s.sceneSlotsLeft).toBe(5);
  });

  it('ironPoirot: откат к началу игры', () => {
    useGameStore.getState().enterSceneById('ch3_02');
    useGameStore.setState({ overlay: 'death', ironPoirot: true });
    useGameStore.getState().dismissDeath();
    const s = useGameStore.getState();
    expect(s.currentScene).toBe('ch1_01');
    expect(s.ironPoirot).toBe(true);
  });

  it('overlay !== death → no-op', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    useGameStore.setState({ overlay: 'none' });
    useGameStore.getState().dismissDeath();
    expect(useGameStore.getState().currentScene).toBe('ch1_01');
  });
});

describe('addNoteFromSpan', () => {
  it('добавляет заметку из NOTE_MATRIX', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    useGameStore.getState().addNoteFromSpan('n_ch1_01_02');
    const s = useGameStore.getState();
    expect(s.notes.length).toBe(1);
    expect(s.notes[0].id).toBe('n_ch1_01_02');
    expect(s.notes[0].sourceScene).toBe('ch1_01');
    expect(s.notes[0].truth).toBe('true');
  });

  it('несуществующий span → console.error, notes пусто', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    useGameStore.getState().addNoteFromSpan('nope');
    expect(useGameStore.getState().notes.length).toBe(0);
  });

  it('дубликат → no-op', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    useGameStore.getState().addNoteFromSpan('n_ch1_01_02');
    useGameStore.getState().addNoteFromSpan('n_ch1_01_02');
    expect(useGameStore.getState().notes.length).toBe(1);
  });

  it('в risky-сцене fromRiskyScene = true', () => {
    useGameStore.getState().enterSceneById('ch3_02');
    useGameStore.getState().addNoteFromSpan('n_ch3_02_01');
    expect(useGameStore.getState().notes[0].fromRiskyScene).toBe(true);
  });
});

describe('submitAccusation', () => {
  it('fail при малом наборе', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    useGameStore.getState().addNoteFromSpan('n_ch1_01_02');
    useGameStore.getState().submitAccusation(['char_02'], ['n_ch1_01_02']);
    const s = useGameStore.getState();
    expect(s.screen).toBe('accusation_result');
    expect(s.lastAccusationResult?.outcome).toBe('fail');
  });

  it('full при Пути A: 10 заметок из разных сцен + 2 CULPRITS', () => {
    // ВАЖНО: каждая заметка должна быть добавлена из своей сцены,
    // иначе sourceScene будет одинаковый и strength станет weak.
    const pathA: Array<[string, string]> = [
      ['ch1_01', 'n_ch1_01_02'],
      ['ch2_03', 'n_ch2_03_01'],
      ['ch2_03', 'n_ch2_03_02'],
      ['ch2_01', 'n_ch2_01_02'],
      ['ch3_01c', 'n_ch3_01c_03'],
      ['ch5_01', 'n_ch5_01_02'],
      ['ch2_01', 'n_ch2_01_01'],
      ['ch3_01b', 'n_ch3_01b_02'],
      ['ch2_01', 'n_ch2_01_03'],
      ['ch3_04b', 'n_ch3_04b_01'],
    ];
    for (const [sceneId, noteId] of pathA) {
      useGameStore.getState().enterSceneById(sceneId);
      useGameStore.getState().addNoteFromSpan(noteId);
    }
    expect(useGameStore.getState().notes.length).toBe(10);

    useGameStore.getState().submitAccusation(
      ['char_02', 'char_03'],
      pathA.map(([, id]) => id),
    );
    const s = useGameStore.getState();
    expect(s.lastAccusationResult?.outcome).toBe('full');
    expect(s.lastAccusationResult?.coverage).toBe(5);
    expect(s.lastAccusationResult?.score).toBeGreaterThanOrEqual(8);
  });
});

describe('useHint', () => {
  it('увеличивает счётчик, ставит toast', () => {
    useGameStore.getState().useHint('greyCells');
    const s = useGameStore.getState();
    expect(s.hintsUsed.greyCells).toBe(1);
    expect(s.toast).toContain('greyCells');
  });

  it('ironPoirot → console.error, счётчик не меняется', () => {
    useGameStore.setState({ ironPoirot: true });
    useGameStore.getState().useHint('greyCells');
    expect(useGameStore.getState().hintsUsed.greyCells).toBe(0);
  });
});

describe('UI-экшены', () => {
  it('setScreen', () => {
    useGameStore.getState().setScreen('notebook');
    expect(useGameStore.getState().screen).toBe('notebook');
  });
  it('setOverlay', () => {
    useGameStore.getState().setOverlay('character_card');
    expect(useGameStore.getState().overlay).toBe('character_card');
  });
  it('setToast', () => {
    useGameStore.getState().setToast('hello');
    expect(useGameStore.getState().toast).toBe('hello');
    useGameStore.getState().setToast(null);
    expect(useGameStore.getState().toast).toBeNull();
  });
  it('toggleIronPoirot', () => {
    expect(useGameStore.getState().ironPoirot).toBe(false);
    useGameStore.getState().toggleIronPoirot();
    expect(useGameStore.getState().ironPoirot).toBe(true);
  });
  it('setFinaleChoice', () => {
    useGameStore.getState().setFinaleChoice('law');
    expect(useGameStore.getState().finaleChoice).toBe('law');
  });
});
