import type { Note, NoteLink } from '../schemas/note';
import type { AccusationResult } from '../schemas/accusation';

export type Screen =
  | 'main_menu'
  | 'tutorial'
  | 'how_to_play'
  | 'scene'
  | 'notebook'
  | 'accusation'
  | 'accusation_result'
  | 'finale'
  | 'settings';

export type Overlay =
  'none' | 'notebook' | 'character_card' | 'hints' | 'chapter_summary' | 'death';

export type HubState = {
  sceneId: string;
  picked: string[];
  remaining: number;
};

export type HintsUsed = {
  greyCells: number;
  memoryTheater: number;
  snowWindow: number;
};

export type FinaleChoice = 'law' | 'justice' | 'silence' | null;

/** Слайс progress: где игрок в графе. */
export type ProgressSlice = {
  chapter: number;
  currentScene: string;
  currentNode: string;
  sceneSlotsLeft: number;
  visitedScenes: string[];
  hubState: HubState | null;
  /** UI-поле: следующая сцена после сводки главы (не в SaveState). */
  pendingNextScene: string | null;
};

/** Слайс relationships: отношения с персонажами. */
export type RelationshipsSlice = {
  suspicion: number;
  trust: Record<string, number>;
};

/** Слайс notebook: блокнот и подсказки. */
export type NotebookSlice = {
  notes: Note[];
  links: NoteLink[];
  hintsUsed: HintsUsed;
};

/** Слайс meta: save-поля, не привязанные к подсистемам. */
export type MetaSlice = {
  version: 1;
  playerId: string;
  deaths: number;
  deathsInChapter: number;
  unlockedEndings: string[];
  tutorialStepsSeen: string[];
  updatedAt: number;
};

/** Слайс ui: только в памяти, не сохраняется. */
export type UiSlice = {
  screen: Screen;
  overlay: Overlay;
  toast: string | null;
  activeSpeaker: string | null;
  deathContext: string | null;
  lastAccusationResult: AccusationResult | null;
  finaleChoice: FinaleChoice;
  ironPoirot: boolean;
  audioMuted: boolean;
  audioVolume: number; // 0..1
};

/** Полный стор = 5 слайсов. Экшены — в P4b. */
export type Store = ProgressSlice & RelationshipsSlice & NotebookSlice & MetaSlice & UiSlice;
