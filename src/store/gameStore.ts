import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { SaveState } from '../schemas/saveState';
import { SaveStateSchema } from '../schemas/saveState';
import type { AccusationResult } from '../schemas/accusation';
import type { ConnectionType } from '../schemas/connection';
import { SCENE_GRAPH, SLOTS_CONFIG, START_SCENE, CHAPTER_START_SCENES } from '../data/sceneGraph';
import { NOTE_MATRIX } from '../data/noteMatrix';
import { enterScene, advanceNode, chooseOption as engineChooseOption } from '../engine/sceneOps';
import { pickHubOption, isHubComplete, getHubCompletionTarget } from '../engine/hubOps';
import { createNote, addNoteToList } from '../engine/noteOps';
import { evaluateAccusation } from '../engine/evaluateAccusation';
import { getOrCreatePlayerId, saveKeyFor } from './playerId';
import { toSaveState, fromSaveState } from './saveStateMapper';
import type { Store, Screen, Overlay, FinaleChoice } from './types';

/** Экшены стора. Все save-поля меняются через движок, UI-поля — напрямую. */
export type StoreActions = {
  /** Сбрасывает состояние на стартовое и входит в START_SCENE. */
  startNewGame: () => void;
  /** Сбрасывает состояние на стартовое, не входя в сцену (для тестов и настроек). */
  resetStore: () => void;
  /** Если есть сохранённый прогресс — показывает сцену; иначе — startNewGame. */
  loadGame: () => void;
  /** Вход в сцену по id. Сбрасывает слоты при смене главы. */
  enterSceneById: (sceneId: string, options?: { resetSlots?: boolean }) => void;
  /** «Игрок тапнул»: двигает текущий узел. Обрабатывает scene_complete. */
  advance: () => void;
  /** Игрок выбрал опцию на choice-узле. */
  chooseOption: (optionId: string) => void;
  /** Обновляет updatedAt (используется персистом). */
  updateTimestamp: () => void;
  /** Отметить шаг онбординга как пройденный (без дублей). */
  markTutorialSeen: (step: string) => void;
  /** Игрок выбрал под-сцену в hub: pick + вход в под-сцену. */
  pickHubOptionAction: (subSceneId: string) => void;
  /** Завершение hub: переход на afterHubSceneId, очистка hubState. */
  completeHub: () => void;
  /** Игрок нажал «Продолжить» после смерти. Откат по паттерну 3.3-упрощённый. */
  dismissDeath: () => void;
  /** Занести заметку в блокнот по ID из NOTE_MATRIX. */
  addNoteFromSpan: (noteSpanId: string) => void;
  /** Переключить метку «важное». */
  toggleNoteImportant: (noteId: string) => void;
  /** Переключить метку «отброшено». */
  toggleNoteDiscarded: (noteId: string) => void;
  /** Добавить личную заметку вручную. */
  addPersonalNote: (text: string) => void;
  /** Добавить связь между персонажами. Дубликаты no-op. */
  addConnection: (from: string, to: string, type: ConnectionType) => void;
  /** Удалить связь по id. */
  removeConnection: (id: string) => void;
  /** Отправить обвинение. Сохраняет результат в lastAccusationResult. */
  submitAccusation: (accused: string[], noteIds: string[]) => void;
  /** Использовать подсказку (увеличить счётчик). */
  triggerHint: (type: 'greyCells' | 'memoryTheater' | 'snowWindow') => void;
  /** Установить экран. */
  setScreen: (screen: Screen) => void;
  /** Установить overlay. */
  setOverlay: (overlay: Overlay) => void;
  /** Установить toast (null — скрыть). */
  setToast: (message: string | null) => void;
  /** Переключить режим «Железный Пуаро». */
  toggleIronPoirot: () => void;
  /** Установить финальный выбор (Закон/Справедливость/Молчание). */
  setFinaleChoice: (choice: FinaleChoice) => void;
  /** Переключить mute звука. */
  toggleAudioMute: () => void;
  /** Установить громкость (0..1, клампится). */
  setAudioVolume: (v: number) => void;
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
    // connections
    connections: [],
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
    audioMuted: false,
    audioVolume: 0.5,
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
const sceneGraph: Record<string, (typeof SCENE_GRAPH)[keyof typeof SCENE_GRAPH]> = SCENE_GRAPH;

/** Zustand store с persist middleware для сохранения прогресса. */
export const useGameStore = create<FullStore>()(
  persist(
    (set, get) => ({
      ...makeInitialData(initialPlayerId),

      startNewGame: () => {
        const playerId = getOrCreatePlayerId();
        const ironPoirot = get().ironPoirot;
        const tutorialStepsSeen = get().tutorialStepsSeen;
        const seenTutorial = tutorialStepsSeen.includes('welcome');
        set({
          ...makeInitialData(playerId),
          ironPoirot,
          tutorialStepsSeen,
        });
        get().enterSceneById(START_SCENE);
        set({ screen: seenTutorial ? 'scene' : 'tutorial' });
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

      enterSceneById: (sceneId, options) => {
        const state = get();
        const scene = sceneGraph[sceneId];
        if (!scene) {
          console.error(`enterSceneById: scene ${sceneId} not found`);
          return;
        }

        let prepared: Store = state;

        if (scene.chapter !== state.chapter) {
          const slots = SLOTS_CONFIG[scene.chapter] ?? 0;
          prepared = {
            ...prepared,
            chapter: scene.chapter,
            sceneSlotsLeft: slots,
            deathsInChapter: 0,
          };
        } else if (options?.resetSlots) {
          const slots = SLOTS_CONFIG[scene.chapter] ?? 0;
          prepared = { ...prepared, sceneSlotsLeft: slots };
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

      markTutorialSeen: (step) => {
        const state = get();
        if (state.tutorialStepsSeen.includes(step)) return;
        set({ tutorialStepsSeen: [...state.tutorialStepsSeen, step] });
      },

      pickHubOptionAction: (subSceneId) => {
        const state = get();
        const hub = sceneGraph[state.currentScene];
        if (!hub) {
          console.error(`pickHubOptionAction: scene ${state.currentScene} not found`);
          return;
        }
        const result = pickHubOption(hub, subSceneId, state);
        if (result.kind === 'invalid') {
          console.error(`pickHubOptionAction: ${result.reason}`);
          return;
        }
        set({ ...result.state, updatedAt: Date.now() });
        get().enterSceneById(subSceneId);
      },

      completeHub: () => {
        const state = get();
        const hub = sceneGraph[state.currentScene];
        if (!hub || !('hubConfig' in hub) || !hub.hubConfig) {
          console.error(`completeHub: ${state.currentScene} is not a hub`);
          return;
        }
        if (!isHubComplete(state)) {
          console.error(`completeHub: hub not complete`);
          return;
        }
        const target = getHubCompletionTarget(hub, state);
        if (target.kind === 'invalid') {
          console.error(`completeHub: ${target.reason}`);
          return;
        }
        set({ hubState: null });
        get().enterSceneById(target.nextSceneId);
      },

      dismissDeath: () => {
        const state = get();
        if (state.overlay !== 'death') return;

        if (state.ironPoirot) {
          get().startNewGame();
          return;
        }

        const chapterStart = CHAPTER_START_SCENES[state.chapter];
        if (!chapterStart) {
          console.error(`dismissDeath: no chapter start for chapter ${state.chapter}`);
          return;
        }
        set({ overlay: 'none', deathContext: null });
        get().enterSceneById(chapterStart, { resetSlots: true });
      },

      addNoteFromSpan: (noteSpanId) => {
        const state = get();
        const noteMatrix: Record<string, (typeof NOTE_MATRIX)[keyof typeof NOTE_MATRIX]> =
          NOTE_MATRIX;
        const span = noteMatrix[noteSpanId];
        if (!span) {
          console.error(`addNoteFromSpan: span ${noteSpanId} not found`);
          return;
        }
        if (state.notes.some((n) => n.id === noteSpanId)) return;

        const scene = sceneGraph[state.currentScene];
        const fromRiskyScene = scene?.type === 'risky';
        const note = createNote(span, state.currentScene, fromRiskyScene, Date.now());
        set({ notes: addNoteToList(state.notes, note), updatedAt: Date.now() });
        set({ toast: `Заметка добавлена: ${span.statement}` });
      },

      toggleNoteImportant: (noteId) => {
        set({
          notes: get().notes.map((n) => (n.id === noteId ? { ...n, important: !n.important } : n)),
          updatedAt: Date.now(),
        });
      },

      toggleNoteDiscarded: (noteId) => {
        set({
          notes: get().notes.map((n) => (n.id === noteId ? { ...n, discarded: !n.discarded } : n)),
          updatedAt: Date.now(),
        });
      },

      addPersonalNote: (text) => {
        const state = get();
        const trimmed = text.trim();
        if (trimmed.length < 5) return;
        if (state.notes.some((n) => n.isPersonal === true && n.text === trimmed)) return;
        const personalId = `personal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        set({
          notes: [
            ...state.notes,
            {
              id: personalId,
              text: trimmed,
              statement: trimmed,
              category: 'psychology' as const,
              target: 'hint',
              attributedTo: 'detective',
              evidenceType: 'observation' as const,
              truthKey: 'personal',
              sourceScene: state.currentScene,
              truth: 'plausible' as const,
              strength: 'weak' as const,
              fromRiskyScene: false,
              createdAt: Date.now(),
              isPersonal: true,
            },
          ],
          updatedAt: Date.now(),
          toast: 'Личная заметка добавлена',
        });
      },

      addConnection: (from, to, type) => {
        if (from === to) return;
        const state = get();
        const exists = state.connections.some(
          (c) =>
            c.type === type &&
            ((c.from === from && c.to === to) || (c.from === to && c.to === from)),
        );
        if (exists) return;
        const conn = {
          id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          from,
          to,
          type,
        };
        set({ connections: [...state.connections, conn], updatedAt: Date.now() });
      },

      removeConnection: (id) => {
        set({
          connections: get().connections.filter((c) => c.id !== id),
          updatedAt: Date.now(),
        });
      },

      submitAccusation: (accused, noteIds) => {
        const state = get();
        const result: AccusationResult = evaluateAccusation({ accused, noteIds }, state.notes);
        set({
          lastAccusationResult: result,
          screen: 'accusation_result',
          updatedAt: Date.now(),
        });
      },

      triggerHint: (type) => {
        const state = get();
        if (state.ironPoirot) {
          console.error('triggerHint: hints disabled in ironPoirot mode');
          return;
        }
        set({
          hintsUsed: { ...state.hintsUsed, [type]: state.hintsUsed[type] + 1 },
          toast: `Подсказка использована: ${type}`,
        });
      },

      setScreen: (screen) => set({ screen }),
      setOverlay: (overlay) => set({ overlay }),
      setToast: (message) => set({ toast: message }),
      toggleIronPoirot: () => set({ ironPoirot: !get().ironPoirot }),
      setFinaleChoice: (choice) => set({ finaleChoice: choice }),

      toggleAudioMute: () => set({ audioMuted: !get().audioMuted }),

      setAudioVolume: (v) => {
        const clamped = Math.max(0, Math.min(1, v));
        set({ audioVolume: clamped });
      },
    }),
    {
      name: 'mfe_save',
      storage: createJSONStorage<SaveState>(() => playerScopedStorage),
      partialize: (store) => toSaveState(store),
      merge: (persisted, current) => {
        if (!persisted) return current;
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
