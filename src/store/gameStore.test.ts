import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';

beforeEach(() => {
  try { localStorage.clear(); } catch { /* */ }
  useGameStore.getState().resetStore();
});

describe('initial state', () => {
  it('screen = main_menu, currentScene = "", chapter = 1', () => {
    const s = useGameStore.getState();
    expect(s.screen).toBe('main_menu');
    expect(s.currentScene).toBe('');
    expect(s.chapter).toBe(1);
    expect(s.sceneSlotsLeft).toBe(4);
    expect(s.notes).toEqual([]);
    expect(s.ironPoirot).toBe(false);
  });
});

describe('startNewGame', () => {
  it('сбрасывает и входит в START_SCENE, slots 4→3', () => {
    useGameStore.getState().startNewGame();
    const s = useGameStore.getState();
    expect(s.screen).toBe('scene');
    expect(s.currentScene).toBe('ch1_01');
    expect(s.currentNode).toBe('n1');
    expect(s.chapter).toBe(1);
    expect(s.sceneSlotsLeft).toBe(3);
    expect(s.visitedScenes).toContain('ch1_01');
  });

  it('сохраняет playerId', () => {
    useGameStore.getState().startNewGame();
    expect(useGameStore.getState().playerId).toBeTruthy();
  });
});

describe('loadGame', () => {
  it('без currentScene → startNewGame', () => {
    useGameStore.getState().loadGame();
    expect(useGameStore.getState().currentScene).toBe('ch1_01');
  });

  it('с currentScene → screen = scene, без вызова startNewGame', () => {
    useGameStore.getState().startNewGame();
    useGameStore.setState({ screen: 'main_menu' });
    useGameStore.getState().loadGame();
    expect(useGameStore.getState().screen).toBe('scene');
    expect(useGameStore.getState().currentScene).toBe('ch1_01');
  });
});

describe('enterSceneById', () => {
  it('вход в сцену обновляет scene/node/slots', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    const s = useGameStore.getState();
    expect(s.currentScene).toBe('ch1_01');
    expect(s.currentNode).toBe('n1');
    expect(s.sceneSlotsLeft).toBe(3);
  });

  it('смена главы сбрасывает slots', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    useGameStore.getState().enterSceneById('ch2_01');
    const s = useGameStore.getState();
    expect(s.chapter).toBe(2);
    expect(s.sceneSlotsLeft).toBe(4); // 5 - 1
  });

  it('несуществующая сцена → console.error, состояние не меняется', () => {
    const before = useGameStore.getState().currentScene;
    useGameStore.getState().enterSceneById('nope_scene');
    expect(useGameStore.getState().currentScene).toBe(before);
  });
});

describe('advance', () => {
  it('narration n1 → n2', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    expect(useGameStore.getState().currentNode).toBe('n1');
    useGameStore.getState().advance();
    expect(useGameStore.getState().currentNode).toBe('n2');
  });

  it('end node → переход в следующую сцену', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    // n1→n2→n3→n4→n5→n6(end)→enter ch1_02
    for (let i = 0; i < 6; i++) useGameStore.getState().advance();
    expect(useGameStore.getState().currentScene).toBe('ch1_02');
    expect(useGameStore.getState().currentNode).toBe('n1');
  });

  it('choice → currentNode не меняется (ждём chooseOption)', () => {
    useGameStore.getState().enterSceneById('ch1_03');
    const before = useGameStore.getState().currentNode;
    useGameStore.getState().advance();
    expect(useGameStore.getState().currentNode).toBe(before);
  });

  it('hub-сцена: advance на n_hub → currentNode не меняется', () => {
    useGameStore.getState().enterSceneById('ch2_02');
    const before = useGameStore.getState().currentNode;
    useGameStore.getState().advance();
    expect(useGameStore.getState().currentNode).toBe(before);
  });
});

describe('chooseOption', () => {
  it('router ch1_03: o1 → переходит в ch1_03a', () => {
    useGameStore.getState().enterSceneById('ch1_03');
    useGameStore.getState().chooseOption('o1');
    expect(useGameStore.getState().currentScene).toBe('ch1_03a');
    expect(useGameStore.getState().currentNode).toBe('n1');
  });

  it('внутриигровой choice: ch3_02 o2 «Прекратить» → n4', () => {
    useGameStore.getState().enterSceneById('ch3_02');
    // n1→n2→n3 (choice)
    useGameStore.getState().advance();
    useGameStore.getState().advance();
    expect(useGameStore.getState().currentNode).toBe('n3');
    useGameStore.getState().chooseOption('o2');
    expect(useGameStore.getState().currentNode).toBe('n4');
  });
});

describe('updateTimestamp', () => {
  it('updatedAt увеличивается', async () => {
    const before = useGameStore.getState().updatedAt;
    await new Promise((r) => setTimeout(r, 5));
    useGameStore.getState().updateTimestamp();
    expect(useGameStore.getState().updatedAt).toBeGreaterThan(before);
  });
});

describe('integration: полный проход Акта I', () => {
  it('start → ch1_01 → ch1_02 → ch1_03 → ch1_03a → ch1_04 → ch2_01', () => {
    useGameStore.getState().startNewGame();
    expect(useGameStore.getState().currentScene).toBe('ch1_01');
    expect(useGameStore.getState().sceneSlotsLeft).toBe(3);

    // ch1_01: 6 advances до end
    for (let i = 0; i < 6; i++) useGameStore.getState().advance();
    expect(useGameStore.getState().currentScene).toBe('ch1_02');
    expect(useGameStore.getState().sceneSlotsLeft).toBe(2);

    // ch1_02: 6 advances
    for (let i = 0; i < 6; i++) useGameStore.getState().advance();
    expect(useGameStore.getState().currentScene).toBe('ch1_03');
    expect(useGameStore.getState().sceneSlotsLeft).toBe(2); // router cost 0

    // ch1_03: 1 advance → awaiting_choice (не сдвигает)
    useGameStore.getState().advance();
    expect(useGameStore.getState().currentScene).toBe('ch1_03');

    // chooseOption → ch1_03a
    useGameStore.getState().chooseOption('o1');
    expect(useGameStore.getState().currentScene).toBe('ch1_03a');
    expect(useGameStore.getState().sceneSlotsLeft).toBe(1);

    // ch1_03a: 3 advances (n1→n2→n3 end)
    for (let i = 0; i < 3; i++) useGameStore.getState().advance();
    expect(useGameStore.getState().currentScene).toBe('ch1_04');
    expect(useGameStore.getState().sceneSlotsLeft).toBe(0);

    // ch1_04: 5 advances → ch2_01 (chapter change)
    for (let i = 0; i < 5; i++) useGameStore.getState().advance();
    expect(useGameStore.getState().currentScene).toBe('ch2_01');
    expect(useGameStore.getState().chapter).toBe(2);
    expect(useGameStore.getState().sceneSlotsLeft).toBe(4); // 5 - 1
  });
});
