import { describe, it, expect } from 'vitest';
import type { SaveState } from '../schemas/saveState';
import { SCENE_GRAPH } from '../data/sceneGraph';
import { enterScene, advanceNode } from './sceneOps';
import { pickHubOption, isHubComplete, getHubCompletionTarget } from './hubOps';

const makeState = (overrides: Partial<SaveState> = {}): SaveState => ({
  version: 1,
  playerId: 'test',
  chapter: 2,
  currentScene: '',
  currentNode: '',
  sceneSlotsLeft: 5,
  suspicion: 50,
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
  connections: [],
  updatedAt: 0,
  ...overrides,
});

const initHub = (): SaveState => {
  const s = enterScene(SCENE_GRAPH.ch2_02, makeState());
  return s;
};

describe('pickHubOption', () => {
  it('первый выбор → picked += ch2_02a, remaining 2→1', () => {
    const state = initHub();
    const result = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02a', state);
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.state.hubState?.picked).toEqual(['ch2_02a']);
      expect(result.state.hubState?.remaining).toBe(1);
    }
  });

  it('второй выбор → picked из 2, remaining 0', () => {
    const s1 = initHub();
    const r1 = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02a', s1);
    if (r1.kind !== 'ok') throw new Error('setup');
    const r2 = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02b', r1.state);
    expect(r2.kind).toBe('ok');
    if (r2.kind === 'ok') {
      expect(r2.state.hubState?.picked).toEqual(['ch2_02a', 'ch2_02b']);
      expect(r2.state.hubState?.remaining).toBe(0);
    }
  });

  it('повторный выбор той же под-сцены → invalid', () => {
    const s1 = initHub();
    const r1 = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02a', s1);
    if (r1.kind !== 'ok') throw new Error('setup');
    const r2 = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02a', r1.state);
    expect(r2.kind).toBe('invalid');
  });

  it('выбор при remaining=0 → invalid', () => {
    const s = initHub();
    const r1 = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02a', s);
    if (r1.kind !== 'ok') throw new Error('setup');
    const r2 = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02b', r1.state);
    if (r2.kind !== 'ok') throw new Error('setup');
    const r3 = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02c', r2.state);
    expect(r3.kind).toBe('invalid');
  });

  it('несуществующая под-сцена → invalid', () => {
    const state = initHub();
    const result = pickHubOption(SCENE_GRAPH.ch2_02, 'nope', state);
    expect(result.kind).toBe('invalid');
  });

  it('hubState не инициализирован → invalid', () => {
    const result = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02a', makeState());
    expect(result.kind).toBe('invalid');
  });

  it('scene не hub → invalid', () => {
    const result = pickHubOption(SCENE_GRAPH.ch1_01, 'ch2_02a', makeState());
    expect(result.kind).toBe('invalid');
  });

  it('иммутабельность: входной state не меняется', () => {
    const state = initHub();
    const snapshot = JSON.parse(JSON.stringify(state));
    pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02a', state);
    expect(state).toEqual(snapshot);
  });
});

describe('isHubComplete', () => {
  it('hubState=null → false', () => {
    expect(isHubComplete(makeState())).toBe(false);
  });

  it('remaining=2 → false', () => {
    expect(isHubComplete(initHub())).toBe(false);
  });

  it('remaining=0 → true', () => {
    const s1 = initHub();
    const r1 = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02a', s1);
    if (r1.kind !== 'ok') throw new Error('setup');
    const r2 = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02b', r1.state);
    if (r2.kind !== 'ok') throw new Error('setup');
    expect(isHubComplete(r2.state)).toBe(true);
  });
});

describe('getHubCompletionTarget', () => {
  it('hub завершён → nextSceneId=ch2_03', () => {
    const s1 = initHub();
    const r1 = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02a', s1);
    if (r1.kind !== 'ok') throw new Error('setup');
    const r2 = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02b', r1.state);
    if (r2.kind !== 'ok') throw new Error('setup');
    const result = getHubCompletionTarget(SCENE_GRAPH.ch2_02, r2.state);
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') expect(result.nextSceneId).toBe('ch2_03');
  });

  it('hub не завершён → invalid', () => {
    const state = initHub();
    const result = getHubCompletionTarget(SCENE_GRAPH.ch2_02, state);
    expect(result.kind).toBe('invalid');
  });

  it('scene не hub → invalid', () => {
    const result = getHubCompletionTarget(SCENE_GRAPH.ch1_01, makeState());
    expect(result.kind).toBe('invalid');
  });
});

describe('hub: интеграционный цикл ch2_02', () => {
  it('полный проход: enter → pick → enter sub → return → pick → complete', () => {
    // 1. Вход в hub
    let state = initHub();
    expect(state.sceneSlotsLeft).toBe(5);
    expect(state.hubState).toEqual({ sceneId: 'ch2_02', picked: [], remaining: 2 });

    // 2. advanceNode на n_hub → hub_ready
    const adv = advanceNode(SCENE_GRAPH.ch2_02, state);
    expect(adv.kind).toBe('hub_ready');

    // 3. Первый pick
    const r1 = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02a', state);
    if (r1.kind !== 'ok') throw new Error('pick1');
    state = r1.state;

    // 4. Вход в под-сцену
    state = enterScene(SCENE_GRAPH.ch2_02a, state);
    expect(state.currentScene).toBe('ch2_02a');
    expect(state.sceneSlotsLeft).toBe(4); // -1 за под-сцену

    // 5. Прохождение под-сцены (n1 → n2 → n3 → n4 end)
    const a1 = advanceNode(SCENE_GRAPH.ch2_02a, state);
    if (a1.kind !== 'advanced') throw new Error('adv1');
    state = a1.state;
    const a2 = advanceNode(SCENE_GRAPH.ch2_02a, state);
    if (a2.kind !== 'advanced') throw new Error('adv2');
    state = a2.state;
    const a3 = advanceNode(SCENE_GRAPH.ch2_02a, state);
    if (a3.kind !== 'advanced') throw new Error('adv3');
    state = a3.state;
    const a4 = advanceNode(SCENE_GRAPH.ch2_02a, state);
    expect(a4.kind).toBe('scene_complete');
    if (a4.kind !== 'scene_complete') throw new Error('adv4');
    expect(a4.nextSceneId).toBe('ch2_02');

    // 6. Возврат в hub — hubState НЕ сбрасывается (фикс enterScene)
    state = enterScene(SCENE_GRAPH.ch2_02, a4.state);
    expect(state.hubState?.picked).toEqual(['ch2_02a']);
    expect(state.hubState?.remaining).toBe(1);

    // 7. Второй pick
    const r2 = pickHubOption(SCENE_GRAPH.ch2_02, 'ch2_02b', state);
    if (r2.kind !== 'ok') throw new Error('pick2');
    state = r2.state;

    // 8. Вход во вторую под-сцену
    state = enterScene(SCENE_GRAPH.ch2_02b, state);
    expect(state.sceneSlotsLeft).toBe(3); // -1 ещё

    // 9. Возврат в hub
    state = enterScene(SCENE_GRAPH.ch2_02, state);
    expect(isHubComplete(state)).toBe(true);

    // 10. Завершение hub
    const target = getHubCompletionTarget(SCENE_GRAPH.ch2_02, state);
    expect(target.kind).toBe('ok');
    if (target.kind === 'ok') expect(target.nextSceneId).toBe('ch2_03');
  });
});
