import { describe, it, expect } from 'vitest';
import type { SaveState } from '../schemas/saveState';
import type { Scene } from '../schemas/scene';
import { SCENE_GRAPH } from '../data/sceneGraph';
import { enterScene, advanceNode, chooseOption } from './sceneOps';

const makeState = (overrides: Partial<SaveState> = {}): SaveState => ({
  version: 1,
  playerId: 'test',
  chapter: 1,
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
  updatedAt: 0,
  ...overrides,
});

describe('enterScene', () => {
  it('устанавливает currentNode=entry, currentScene=id, уменьшает slotsLeft', () => {
    const state = makeState();
    const next = enterScene(SCENE_GRAPH.ch1_01, state);
    expect(next.currentScene).toBe('ch1_01');
    expect(next.currentNode).toBe('n1');
    expect(next.sceneSlotsLeft).toBe(4); // 5 - 1
  });

  it('hub-сцена (slotCost=0) не уменьшает slotsLeft, инициализирует hubState', () => {
    const state = makeState();
    const next = enterScene(SCENE_GRAPH.ch2_02, state);
    expect(next.sceneSlotsLeft).toBe(5);
    expect(next.hubState).toEqual({ sceneId: 'ch2_02', picked: [], remaining: 2 });
  });

  it('router-сцена (slotCost=0) не уменьшает slotsLeft, hubState=null', () => {
    const state = makeState();
    const next = enterScene(SCENE_GRAPH.ch1_03, state);
    expect(next.sceneSlotsLeft).toBe(5);
    expect(next.hubState).toBeNull();
  });

  it('применяет onEnter (фикстура)', () => {
    const scene: Scene = {
      id: 'test_onenter',
      chapter: 1,
      title: 't',
      type: 'optional',
      background: 'bg',
      characters: [],
      entry: 'n1',
      slotCost: 0,
      onEnter: { suspicionDelta: 10 },
      nodes: { n1: { type: 'end', id: 'n1', outcome: 'final' } },
    };
    const next = enterScene(scene, makeState({ suspicion: 50 }));
    expect(next.suspicion).toBe(60);
  });

  it('добавляет scene.id в visitedScenes без дублей', () => {
    const state = makeState({ visitedScenes: ['ch1_01'] });
    const next = enterScene(SCENE_GRAPH.ch1_01, state);
    expect(next.visitedScenes).toEqual(['ch1_01']);
  });

  it('иммутабельность: входной state не меняется', () => {
    const state = makeState();
    const snapshot = JSON.parse(JSON.stringify(state));
    enterScene(SCENE_GRAPH.ch1_01, state);
    expect(state).toEqual(snapshot);
  });
});

describe('advanceNode', () => {
  it('narration с next → advanced', () => {
    const state = makeState({ currentScene: 'ch1_01', currentNode: 'n1' });
    const result = advanceNode(SCENE_GRAPH.ch1_01, state);
    expect(result.kind).toBe('advanced');
    if (result.kind === 'advanced') {
      expect(result.state.currentNode).toBe('n2');
    }
  });

  it('dialogue с next → advanced', () => {
    const state = makeState({ currentScene: 'ch1_01', currentNode: 'n2' });
    const result = advanceNode(SCENE_GRAPH.ch1_01, state);
    expect(result.kind).toBe('advanced');
    if (result.kind === 'advanced') expect(result.state.currentNode).toBe('n3');
  });

  it('end → scene_complete с outcome и nextSceneId', () => {
    const state = makeState({ currentScene: 'ch1_01', currentNode: 'n6' });
    const result = advanceNode(SCENE_GRAPH.ch1_01, state);
    expect(result.kind).toBe('scene_complete');
    if (result.kind === 'scene_complete') {
      expect(result.outcome).toBe('continue');
      expect(result.nextSceneId).toBe('ch1_02');
    }
  });

  it('choice → awaiting_choice', () => {
    const state = makeState({ currentScene: 'ch1_03', currentNode: 'n1' });
    const result = advanceNode(SCENE_GRAPH.ch1_03, state);
    expect(result.kind).toBe('awaiting_choice');
  });

  it('hub-сцена, узел n_hub без next → hub_ready', () => {
    const state = makeState({ currentScene: 'ch2_02', currentNode: 'n_hub' });
    const result = advanceNode(SCENE_GRAPH.ch2_02, state);
    expect(result.kind).toBe('hub_ready');
  });

  it('check: suspicion 50 < 70 → onPass (n4)', () => {
    const state = makeState({ currentScene: 'ch3_02', currentNode: 'n_check', suspicion: 50 });
    const result = advanceNode(SCENE_GRAPH.ch3_02, state);
    expect(result.kind).toBe('advanced');
    if (result.kind === 'advanced') expect(result.state.currentNode).toBe('n4');
  });

  it('check: suspicion 80 ≥ 70 → onFail (n_death)', () => {
    const state = makeState({ currentScene: 'ch3_02', currentNode: 'n_check', suspicion: 80 });
    const result = advanceNode(SCENE_GRAPH.ch3_02, state);
    expect(result.kind).toBe('advanced');
    if (result.kind === 'advanced') expect(result.state.currentNode).toBe('n_death');
  });

  it('end с outcome=death → scene_complete(death)', () => {
    const state = makeState({ currentScene: 'ch3_02', currentNode: 'n_death' });
    const result = advanceNode(SCENE_GRAPH.ch3_02, state);
    expect(result.kind).toBe('scene_complete');
    if (result.kind === 'scene_complete') expect(result.outcome).toBe('death');
  });

  it('несуществующий узел → invalid', () => {
    const state = makeState({ currentScene: 'ch1_01', currentNode: 'nope' });
    const result = advanceNode(SCENE_GRAPH.ch1_01, state);
    expect(result.kind).toBe('invalid');
  });
});

describe('chooseOption', () => {
  it('router ch1_03, o1 → scene_complete(ch1_03a)', () => {
    const state = makeState({ currentScene: 'ch1_03', currentNode: 'n1' });
    const result = chooseOption(SCENE_GRAPH.ch1_03, state, 'o1');
    expect(result.kind).toBe('scene_complete');
    if (result.kind === 'scene_complete') expect(result.nextSceneId).toBe('ch1_03a');
  });

  it('router ch1_03, o2 → scene_complete(ch1_03b)', () => {
    const state = makeState({ currentScene: 'ch1_03', currentNode: 'n1' });
    const result = chooseOption(SCENE_GRAPH.ch1_03, state, 'o2');
    expect(result.kind).toBe('scene_complete');
    if (result.kind === 'scene_complete') expect(result.nextSceneId).toBe('ch1_03b');
  });

  it('ch3_02, o2 «Прекратить» → advanced на n4', () => {
    const state = makeState({ currentScene: 'ch3_02', currentNode: 'n3' });
    const result = chooseOption(SCENE_GRAPH.ch3_02, state, 'o2');
    expect(result.kind).toBe('advanced');
    if (result.kind === 'advanced') expect(result.state.currentNode).toBe('n4');
  });

  it('ch3_02, o1 «Продолжить» → advanced на n_check', () => {
    const state = makeState({ currentScene: 'ch3_02', currentNode: 'n3' });
    const result = chooseOption(SCENE_GRAPH.ch3_02, state, 'o1');
    expect(result.kind).toBe('advanced');
    if (result.kind === 'advanced') expect(result.state.currentNode).toBe('n_check');
  });

  it('текущий узел не choice → invalid', () => {
    const state = makeState({ currentScene: 'ch1_01', currentNode: 'n1' });
    const result = chooseOption(SCENE_GRAPH.ch1_01, state, 'o1');
    expect(result.kind).toBe('invalid');
  });

  it('несуществующий optionId → invalid', () => {
    const state = makeState({ currentScene: 'ch1_03', currentNode: 'n1' });
    const result = chooseOption(SCENE_GRAPH.ch1_03, state, 'nope');
    expect(result.kind).toBe('invalid');
  });

  it('применяет effects (фикстура)', () => {
    const scene: Scene = {
      id: 'test_effects',
      chapter: 1,
      title: 't',
      type: 'optional',
      background: 'bg',
      characters: [],
      entry: 'n1',
      slotCost: 0,
      nodes: {
        n1: {
          type: 'choice',
          id: 'n1',
          prompt: 'x',
          options: [
            { id: 'o1', label: 'a', nextNodeId: 'n2', effects: { suspicionDelta: 10 } },
            { id: 'o2', label: 'b', nextSceneId: 'other' },
          ],
        },
        n2: { type: 'end', id: 'n2', outcome: 'final' },
      },
    };
    const result = chooseOption(scene, makeState({ suspicion: 50 }), 'o1');
    expect(result.kind).toBe('advanced');
    if (result.kind === 'advanced') expect(result.state.suspicion).toBe(60);
  });

  it('requires не выполнено → invalid', () => {
    const scene: Scene = {
      id: 'test_req',
      chapter: 1,
      title: 't',
      type: 'optional',
      background: 'bg',
      characters: [],
      entry: 'n1',
      slotCost: 0,
      nodes: {
        n1: {
          type: 'choice',
          id: 'n1',
          prompt: 'x',
          options: [
            { id: 'o1', label: 'a', nextSceneId: 'other', requires: { suspicionBelow: 40 } },
            { id: 'o2', label: 'b', nextSceneId: 'other' },
          ],
        },
      },
    };
    const result = chooseOption(scene, makeState({ suspicion: 50 }), 'o1');
    expect(result.kind).toBe('invalid');
  });

  it('иммутабельность: входной state не меняется', () => {
    const state = makeState({ currentScene: 'ch1_03', currentNode: 'n1' });
    const snapshot = JSON.parse(JSON.stringify(state));
    chooseOption(SCENE_GRAPH.ch1_03, state, 'o1');
    expect(state).toEqual(snapshot);
  });
});
