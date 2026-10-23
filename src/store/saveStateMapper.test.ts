import { describe, it, expect } from 'vitest';
import { SaveStateSchema } from '../schemas/saveState';
import type { Note } from '../schemas/note';
import { toSaveState, fromSaveState } from './saveStateMapper';
import type { Store } from './types';

const makeNote = (): Note => ({
  id: 'n_x',
  text: 't',
  statement: 's',
  category: 'motive',
  target: 'char_02',
  attributedTo: 'detective',
  evidenceType: 'observation',
  truthKey: 'k',
  sourceScene: 'ch1_01',
  truth: 'true',
  strength: 'weak',
  fromRiskyScene: false,
  createdAt: 1,
});

const makeFullStore = (overrides: Partial<Store> = {}): Store => ({
  // progress
  chapter: 2,
  currentScene: 'ch2_01',
  currentNode: 'n3',
  sceneSlotsLeft: 3,
  visitedScenes: ['ch1_01', 'ch2_01'],
  hubState: null,
  pendingNextScene: 'ch2_02',
  // relationships
  suspicion: 42,
  trust: { char_02: 2, char_03: 1 },
  // notebook
  notes: [makeNote()],
  links: [],
  hintsUsed: { greyCells: 1, memoryTheater: 0, snowWindow: 0 },
  // meta
  version: 1,
  playerId: 'pid',
  deaths: 1,
  deathsInChapter: 1,
  unlockedEndings: ['ending_law'],
  tutorialStepsSeen: ['welcome'],
  updatedAt: 1234567890,
  // ui
  screen: 'scene',
  overlay: 'notebook',
  toast: 'Заметка добавлена',
  activeSpeaker: 'char_02',
  deathContext: 'countess',
  lastAccusationResult: null,
  finaleChoice: null,
  ironPoirot: true,
  ...overrides,
});

describe('toSaveState', () => {
  it('возвращает все 18 save-полей', () => {
    const save = toSaveState(makeFullStore());
    expect(save).toHaveProperty('version', 1);
    expect(save).toHaveProperty('playerId', 'pid');
    expect(save).toHaveProperty('chapter', 2);
    expect(save).toHaveProperty('currentScene', 'ch2_01');
    expect(save).toHaveProperty('currentNode', 'n3');
    expect(save).toHaveProperty('sceneSlotsLeft', 3);
    expect(save).toHaveProperty('suspicion', 42);
    expect(save).toHaveProperty('trust');
    expect(save).toHaveProperty('notes');
    expect(save).toHaveProperty('links');
    expect(save).toHaveProperty('hintsUsed');
    expect(save).toHaveProperty('deaths', 1);
    expect(save).toHaveProperty('deathsInChapter', 1);
    expect(save).toHaveProperty('visitedScenes');
    expect(save).toHaveProperty('unlockedEndings');
    expect(save).toHaveProperty('tutorialStepsSeen');
    expect(save).toHaveProperty('hubState');
    expect(save).toHaveProperty('updatedAt', 1234567890);
  });

  it('НЕ содержит UI-полей', () => {
    const save: Record<string, unknown> = toSaveState(makeFullStore());
    expect(save).not.toHaveProperty('screen');
    expect(save).not.toHaveProperty('overlay');
    expect(save).not.toHaveProperty('toast');
    expect(save).not.toHaveProperty('activeSpeaker');
    expect(save).not.toHaveProperty('deathContext');
    expect(save).not.toHaveProperty('lastAccusationResult');
    expect(save).not.toHaveProperty('finaleChoice');
    expect(save).not.toHaveProperty('ironPoirot');
    expect(save).not.toHaveProperty('pendingNextScene');
  });

  it('проходит SaveStateSchema.parse (Zod .strict())', () => {
    const save = toSaveState(makeFullStore());
    expect(() => SaveStateSchema.parse(save)).not.toThrow();
  });
});

describe('fromSaveState', () => {
  it('возвращает только save-поля, НЕ UI', () => {
    const save = toSaveState(makeFullStore());
    const partial = fromSaveState(save);
    expect(partial).toHaveProperty('chapter');
    expect(partial).toHaveProperty('notes');
    expect(partial).toHaveProperty('hubState');
    expect(partial).not.toHaveProperty('screen');
    expect(partial).not.toHaveProperty('overlay');
    expect(partial).not.toHaveProperty('toast');
    expect(partial).not.toHaveProperty('ironPoirot');
    expect(partial).not.toHaveProperty('pendingNextScene');
  });

  it('round-trip: toSaveState(fromSaveState(save)) === save', () => {
    const save = toSaveState(makeFullStore());
    const partial = fromSaveState(save);
    const storeFromPartial = { ...makeFullStore(), ...partial };
    const save2 = toSaveState(storeFromPartial);
    expect(save2).toEqual(save);
  });

  it('round-trip сохраняет notes со всеми полями', () => {
    const save = toSaveState(makeFullStore());
    const partial = fromSaveState(save);
    expect(partial.notes).toEqual(save.notes);
    expect(partial.notes?.[0].createdAt).toBe(1);
    expect(partial.notes?.[0].truth).toBe('true');
  });

  it('round-trip сохраняет hubState', () => {
    const store = makeFullStore({
      hubState: { sceneId: 'ch2_02', picked: ['ch2_02a'], remaining: 1 },
    });
    const save = toSaveState(store);
    const partial = fromSaveState(save);
    expect(partial.hubState).toEqual({ sceneId: 'ch2_02', picked: ['ch2_02a'], remaining: 1 });
  });
});

describe('playerId', () => {
  it('saveKeyFor возвращает корректный префикс', async () => {
    const { saveKeyFor } = await import('./playerId');
    expect(saveKeyFor('abc')).toBe('mfe_save_v1_abc');
  });
});
