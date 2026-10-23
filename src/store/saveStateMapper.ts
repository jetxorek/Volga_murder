import type { SaveState } from '../schemas/saveState';
import type { Store } from './types';

/**
 * Извлекает save-поля из стора. Возвращает ровно SaveState (18 полей).
 * UI-поля (screen, overlay, toast, activeSpeaker, deathContext,
 * lastAccusationResult, finaleChoice, ironPoirot, pendingNextScene)
 * НЕ попадают сюда.
 */
export function toSaveState(store: Store): SaveState {
  return {
    version: store.version,
    playerId: store.playerId,
    chapter: store.chapter,
    currentScene: store.currentScene,
    currentNode: store.currentNode,
    sceneSlotsLeft: store.sceneSlotsLeft,
    suspicion: store.suspicion,
    trust: store.trust,
    notes: store.notes,
    links: store.links,
    hintsUsed: store.hintsUsed,
    deaths: store.deaths,
    deathsInChapter: store.deathsInChapter,
    visitedScenes: store.visitedScenes,
    unlockedEndings: store.unlockedEndings,
    tutorialStepsSeen: store.tutorialStepsSeen,
    hubState: store.hubState,
    updatedAt: store.updatedAt,
  };
}

/**
 * Возвращает только save-поля для мерджа в стор при загрузке.
 * UI-поля НЕ возвращаются — они остаются со значениями по умолчанию.
 */
export function fromSaveState(save: SaveState): Partial<Store> {
  return {
    version: save.version,
    playerId: save.playerId,
    chapter: save.chapter,
    currentScene: save.currentScene,
    currentNode: save.currentNode,
    sceneSlotsLeft: save.sceneSlotsLeft,
    suspicion: save.suspicion,
    trust: save.trust,
    notes: save.notes,
    links: save.links,
    hintsUsed: save.hintsUsed,
    deaths: save.deaths,
    deathsInChapter: save.deathsInChapter,
    visitedScenes: save.visitedScenes,
    unlockedEndings: save.unlockedEndings,
    tutorialStepsSeen: save.tutorialStepsSeen,
    hubState: save.hubState,
    updatedAt: save.updatedAt,
  };
}
