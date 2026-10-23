import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { SaveState } from '../schemas/saveState';
import { SaveStateSchema } from '../schemas/saveState';
import { SCENE_GRAPH, SLOTS_CONFIG, START_SCENE } from '../data/sceneGraph';
import {
  enterScene,
  advanceNode,
  chooseOption as engineChooseOption,
} from '../engine/sceneOps';
import { getOrCreatePlayerId, saveKeyFor } from './playerId';
import { toSaveState, fromSaveState } from './saveStateMapper';
import type { Store } from './types';

/** Экшены стора. Все save-поля меняются через движок, UI-поля — напрямую. */
export type StoreActions = {
  /** Сбрасывает состояние на стартовое и входит в START_SCENE. */
  startNewGame: () => void;
  /** Сбрасывает состояние на стартовое, не входя в сцену (для тестов и настроек). */
  resetStore: () => void;
  /** Если есть сохранённый прогресс — показывает сцену; иначе — startNewGame. */
  loadGame: () => void;
  /** Вход в сцену по id. Сбрасывает слоты при смене главы. */
  enterSceneById: (sceneId: string) => void;
  /** «Игрок тапнул»: двигает текущий узел. Обрабатывает scene_complete. */
  advance: () => void;
  /** Игрок выбрал опцию на choice-узле. */
  chooseOption: (optionId: string) => void;
  /** Обновляет updatedAt (используется персистом). */
  updateTimestamp: () => void;
};

/** Полный стор = данные (Store) + экшены. */
export type FullStore = Store & StoreActions;

function makeInitialData(playerId: string): Store {
  return {
    // progress
    chapter: 1,
    currentScene: '',
    currentNode: '',
    sceneSlotsLeft: SLOTS_CONFIG[1] ?? 0,
    visitedScenes: [],
    hubState: null,
    pendingNextScene: null,
    // relationships
    suspicion: 0,
    trust: {},
    // notebook
    notes: [],
    links: [],
    hintsUsed: { greyCells: 0, memoryTheater: 0, snowWindow: 0 },
    // meta
    version: 1,
    playerId,
    deaths: 0,
    deathsInChapter: 0,
    unlockedEndings: [],
    tutorialStepsSeen: [],
    updatedAt: Date.now(),
    // ui
    screen: 'main_menu',
    overlay: 'none',
    toast: null,
    activeSpeaker: null,
    deathContext: null,
    lastAccusationResult: null,
    finaleChoice: null,
    ironPoirot: false,
  };
}

const playerScopedStorage: StateStorage = {
  getItem: () => {
    try {
      return localStorage.getItem(saveKeyFor(getOrCreatePlayerId()));
    } catch {
      return null;
    }
  },
  setItem: (_name, value) => {
    try {
      localStorage.setItem(saveKeyFor(getOrCreatePlayerId()), value);
    } catch {
      // storage unavailable — silent
    }
  },
  removeItem: () => {
    try {
      localStorage.removeItem(saveKeyFor(getOrCreatePlayerId()));
    } catch {
      // silent
    }
  },
};

const initialPlayerId = getOrCreatePlayerId();
const sceneGraph: Record<string, typeof SCENE_GRAPH[keyof typeof SCENE_GRAPH]> = SCENE_GRAPH;

/** Zustand store с persist middleware для сохранения прогресса. */
export const useGameStore = create<FullStore>()(
  persist(
    (set, get) => ({
      ...makeInitialData(initialPlayerId),

      startNewGame: () => {
        const playerId = getOrCreatePlayerId();
        set({ ...makeInitialData(playerId), screen: 'scene' });
        get().enterSceneById(START_SCENE);
      },

      resetStore: () => {
        const playerId = getOrCreatePlayerId();
        set(makeInitialData(playerId));
      },

      loadGame: () => {
        const state = get();
        if (!state.currentScene) {
          get().startNewGame();
          return;
        }
        set({ screen: 'scene' });
      },

      enterSceneById: (sceneId) => {
        const state = get();
        const graph: Record<string, typeof SCENE_GRAPH[keyof typeof SCENE_GRAPH]> = SCENE_GRAPH;
        const scene = graph[sceneId];
        if (!scene) {
          console.error(`enterSceneById: scene ${sceneId} not found`);
          return;
        }

        let prepared: Store = state;

        if (scene.chapter !== state.chapter) {
          const slots = SLOTS_CONFIG[scene.chapter] ?? 0;
          prepared = { ...prepared, chapter: scene.chapter, sceneSlotsLeft: slots };
        }
        if (prepared.pendingNextScene !== null) {
          prepared = { ...prepared, pendingNextScene: null };
        }

        const nextState = enterScene(scene, prepared);
        set({ ...nextState, updatedAt: Date.now(), screen: 'scene' });
      },

      advance: () => {
        const state = get();
        const scene = sceneGraph[state.currentScene];
        if (!scene) {
          console.error(`advance: scene ${state.currentScene} not found`);
          return;
        }
        const result = advanceNode(scene, state);

        if (result.kind === 'advanced') {
          set({ ...result.state, updatedAt: Date.now() });
          return;
        }
        if (result.kind === 'awaiting_choice' || result.kind === 'hub_ready') {
          set({ updatedAt: Date.now() });
          return;
        }
        if (result.kind === 'invalid') {
          console.error(`advance: ${result.reason}`);
          return;
        }

        // result.kind === 'scene_complete'
        const base: Partial<FullStore> = { ...result.state, updatedAt: Date.now() };

        switch (result.outcome) {
          case 'continue':
            set(base);
            if (result.nextSceneId) get().enterSceneById(result.nextSceneId);
            break;
          case 'death':
            set({
              ...base,
              overlay: 'death',
              deathContext: result.state.currentScene,
              deaths: state.deaths + 1,
              deathsInChapter: state.deathsInChapter + 1,
            });
            break;
          case 'chapter_end':
            set({
              ...base,
              overlay: 'chapter_summary',
              pendingNextScene: result.nextSceneId ?? null,
            });
            break;
          case 'accusation_ready':
            set({ ...base, screen: 'accusation' });
            break;
          case 'final':
            set({ ...base, screen: 'finale' });
            break;
        }
      },

      chooseOption: (optionId) => {
        const state = get();
        const scene = sceneGraph[state.currentScene];
        if (!scene) {
          console.error(`chooseOption: scene ${state.currentScene} not found`);
          return;
        }
        const result = engineChooseOption(scene, state, optionId);

        if (result.kind === 'advanced') {
          set({ ...result.state, updatedAt: Date.now() });
          return;
        }
        if (result.kind === 'scene_complete') {
          get().enterSceneById(result.nextSceneId);
          return;
        }
        console.error(`chooseOption: ${result.reason}`);
      },

      updateTimestamp: () => set({ updatedAt: Date.now() }),
    }),
    {
      name: 'mfe_save',
      storage: createJSONStorage<SaveState>(() => playerScopedStorage),
      partialize: (store) => toSaveState(store),
      merge: (persisted, current) => {
        const parsed = SaveStateSchema.safeParse(persisted);
        if (!parsed.success) {
          console.error('persist.merge: save state failed validation', parsed.error);
          return current;
        }
        return { ...current, ...fromSaveState(parsed.data) };
      },
    },
  ),
);
