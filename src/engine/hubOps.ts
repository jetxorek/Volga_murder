import type { Scene } from '../schemas/scene';
import type { SaveState } from '../schemas/saveState';

/**
 * Результат выбора под-сцены в hub.
 * ok — выбор принят; state обновлён (picked += subId, remaining -= 1).
 * invalid — выбор отклонён (причина в reason).
 */
export type HubPickResult =
  | { kind: 'ok'; state: SaveState }
  | { kind: 'invalid'; reason: string };

/**
 * Игрок выбрал под-сцену в hub. Проверяет: hubState соответствует
 * hub.id, subSceneId ∈ hubConfig.options, не выбран ранее, remaining > 0.
 * Возвращает новый state с обновлённым hubState. Не входит в под-сцену —
 * это отдельный вызов enterScene(subScene, ...).
 */
export function pickHubOption(hub: Scene, subSceneId: string, state: SaveState): HubPickResult {
  if (!hub.hubConfig) {
    return { kind: 'invalid', reason: `scene ${hub.id} is not a hub` };
  }
  if (!state.hubState || state.hubState.sceneId !== hub.id) {
    return { kind: 'invalid', reason: `hubState not initialized for ${hub.id}` };
  }
  if (!hub.hubConfig.options.includes(subSceneId)) {
    return { kind: 'invalid', reason: `option ${subSceneId} not in hubConfig` };
  }
  if (state.hubState.picked.includes(subSceneId)) {
    return { kind: 'invalid', reason: `option ${subSceneId} already picked` };
  }
  if (state.hubState.remaining <= 0) {
    return { kind: 'invalid', reason: 'no remaining picks' };
  }
  return {
    kind: 'ok',
    state: {
      ...state,
      hubState: {
        ...state.hubState,
        picked: [...state.hubState.picked, subSceneId],
        remaining: state.hubState.remaining - 1,
      },
    },
  };
}

/**
 * Все ли пики в hub сделаны (remaining === 0).
 * hubState === null → false (это не hub).
 */
export function isHubComplete(state: SaveState): boolean {
  return state.hubState !== null && state.hubState.remaining === 0;
}

/**
 * Если hub завершён — вернуть afterHubSceneId, иначе invalid.
 * Вызывающий код должен сделать enterScene(SCENE_GRAPH[afterHubSceneId], state).
 */
export function getHubCompletionTarget(
  hub: Scene,
  state: SaveState,
): { kind: 'ok'; nextSceneId: string } | { kind: 'invalid'; reason: string } {
  if (!hub.hubConfig) {
    return { kind: 'invalid', reason: `scene ${hub.id} is not a hub` };
  }
  if (!state.hubState || state.hubState.sceneId !== hub.id) {
    return { kind: 'invalid', reason: `hubState not initialized for ${hub.id}` };
  }
  if (state.hubState.remaining > 0) {
    return { kind: 'invalid', reason: `hub not complete (remaining ${state.hubState.remaining})` };
  }
  return { kind: 'ok', nextSceneId: hub.hubConfig.afterHubSceneId };
}
