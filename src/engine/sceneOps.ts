import type { Scene, EndOutcome } from '../schemas/scene';
import type { SaveState } from '../schemas/saveState';
import type { GameState } from './effects';
import { evaluateCondition, applyEffects } from './effects';

/**
 * Результат advanceNode: что делать вызывающему коду.
 * advanced — перешли на следующий узел (продолжай цикл);
 * awaiting_choice — узел choice, ждём chooseOption;
 * hub_ready — hub-сцена, ждём P3d-логику выбора под-сцен;
 * scene_complete — end-узел, сцена завершена;
 * invalid — ошибка данных/состояния.
 */
export type AdvanceResult =
  | { kind: 'advanced'; state: SaveState }
  | { kind: 'awaiting_choice'; state: SaveState }
  | { kind: 'hub_ready'; state: SaveState }
  | { kind: 'scene_complete'; state: SaveState; outcome: EndOutcome; nextSceneId?: string }
  | { kind: 'invalid'; reason: string };

/**
 * Результат chooseOption: advanced — перешли на nextNodeId;
 * scene_complete — выбор ведёт в другую сцену; invalid — ошибка.
 */
export type ChooseResult =
  | { kind: 'advanced'; state: SaveState }
  | { kind: 'scene_complete'; state: SaveState; nextSceneId: string }
  | { kind: 'invalid'; reason: string };

/**
 * Вход в сцену: устанавливает currentScene, currentNode=entry,
 * вычитает slotCost из sceneSlotsLeft (с клампом на 0),
 * применяет scene.onEnter, инициализирует hubState для hub-сцен,
 * добавляет scene.id в visitedScenes (без дублей).
 */
export function enterScene(scene: Scene, state: SaveState): SaveState {
  const gs: GameState = { suspicion: state.suspicion, trust: state.trust, notes: state.notes };
  const nextGs = scene.onEnter ? applyEffects(gs, scene.onEnter) : gs;

  const newSlots = Math.max(0, state.sceneSlotsLeft - scene.slotCost);
  const existingHubState = state.hubState?.sceneId === scene.id ? state.hubState : null;
  const hubState = scene.hubConfig
    ? (existingHubState ?? { sceneId: scene.id, picked: [], remaining: scene.hubConfig.pick })
    : null;
  const visitedScenes = state.visitedScenes.includes(scene.id)
    ? state.visitedScenes
    : [...state.visitedScenes, scene.id];

  return {
    ...state,
    currentScene: scene.id,
    currentNode: scene.entry,
    sceneSlotsLeft: newSlots,
    suspicion: nextGs.suspicion,
    trust: nextGs.trust,
    hubState,
    visitedScenes,
  };
}

/**
 * Двигает state по текущему узлу сцены.
 * narration/dialogue → next (или hub_ready, если нет next и scene — hub);
 * choice → awaiting_choice; check → onPass/onFail по evaluateCondition;
 * end → scene_complete с outcome и nextSceneId.
 */
export function advanceNode(scene: Scene, state: SaveState): AdvanceResult {
  const node = scene.nodes[state.currentNode];
  if (!node) {
    return { kind: 'invalid', reason: `node ${state.currentNode} not found in ${scene.id}` };
  }

  if (node.type === 'narration' || node.type === 'dialogue') {
    if (node.next) {
      return { kind: 'advanced', state: { ...state, currentNode: node.next } };
    }
    if (scene.hubConfig) {
      return { kind: 'hub_ready', state };
    }
    return { kind: 'invalid', reason: `node ${node.id} has no next and scene is not hub` };
  }

  if (node.type === 'choice') {
    return { kind: 'awaiting_choice', state };
  }

  if (node.type === 'check') {
    const passed = evaluateCondition(state, node.condition);
    const target = passed ? node.onPass : node.onFail;
    return { kind: 'advanced', state: { ...state, currentNode: target } };
  }

  if (node.type === 'end') {
    return {
      kind: 'scene_complete',
      state,
      outcome: node.outcome,
      nextSceneId: node.nextSceneId,
    };
  }

  return { kind: 'invalid', reason: 'unknown node type' };
}

/**
 * Обрабатывает выбор опции на текущем choice-узле.
 * Проверяет opt.requires (если задан), применяет opt.effects,
 * переходит по nextNodeId или возвращает nextSceneId.
 */
export function chooseOption(scene: Scene, state: SaveState, optionId: string): ChooseResult {
  const node = scene.nodes[state.currentNode];
  if (!node || node.type !== 'choice') {
    return { kind: 'invalid', reason: 'current node is not a choice' };
  }
  const opt = node.options.find((o) => o.id === optionId);
  if (!opt) {
    return { kind: 'invalid', reason: `option ${optionId} not found` };
  }
  if (opt.requires && !evaluateCondition(state, opt.requires)) {
    return { kind: 'invalid', reason: 'requires not met' };
  }

  let nextState = state;
  if (opt.effects) {
    const gs: GameState = { suspicion: state.suspicion, trust: state.trust, notes: state.notes };
    const nextGs = applyEffects(gs, opt.effects);
    nextState = { ...state, suspicion: nextGs.suspicion, trust: nextGs.trust };
  }

  if (opt.nextNodeId) {
    return { kind: 'advanced', state: { ...nextState, currentNode: opt.nextNodeId } };
  }
  if (opt.nextSceneId) {
    return { kind: 'scene_complete', state: nextState, nextSceneId: opt.nextSceneId };
  }
  return { kind: 'invalid', reason: 'option has neither nextNodeId nor nextSceneId' };
}
