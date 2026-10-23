import { describe, it, expect } from 'vitest';
import {
  TruthTableSchema,
  CharacterSchema,
  NoteSpanSchema,
  NoteSchema,
  NoteLinkSchema,
  type TruthTable,
  type Character,
  type NoteSpan,
  type Note,
  type NoteLink,
} from './index';

// --- Фикстуры ---
// Типы заданы явно через z.infer.

const validTruthTable: TruthTable = {
  char_01: {
    motive: { has_debt: 'true' },
    alibi: { was_on_deck: 'plausible' },
  },
  victim: {
    psychology: { feared_someone: 'false' },
  },
};

const validCharacter: Character = {
  id: 'char_01',
  name: 'Пирогов',
  shortName: 'Пир.',
  role: 'suspect',
  isAccusable: true,
  barOrder: 1,
  portraitId: 'portrait_pirogov',
  appearance: 'Высокий мужчина в пенсне',
  appearanceSource: 'ch1_01',
  behaviorModel: {
    baseline: 'Сдержан',
    underPressure: 'Раздражителен',
    underSympathy: 'Откровенен',
    underLogic: 'Уклончив',
    sourceEvidence: 'ch1_01',
  },
  speech: {
    rhythm: 'Ровный',
    register: 'Литературный',
    quirks: ['вставляет латинские цитаты'],
    sourceExamples: ['ch1_01'],
  },
  secret: 'Должен казино',
  motive: 'Деньги',
  alibi: 'Был в каюте',
  knows: 'Видел жертву с кем-то',
  liesAbout: 'Скрывает долг',
  relationships: [],
};

const validNoteSpan: NoteSpan = {
  id: 'n_ch1_01_01',
  text: 'Пирогов нервно поправляет пенсне',
  statement: 'Пирогов нервничает',
  category: 'psychology',
  target: 'char_01',
  attributedTo: 'detective',
  evidenceType: 'observation',
  truthKey: 'is_nervous',
};

const validNote: Note = {
  ...validNoteSpan,
  sourceScene: 'ch1_01',
  truth: 'plausible',
  strength: 'strong',
  fromRiskyScene: false,
  createdAt: 1700000000,
};

const validNoteLink: NoteLink = {
  id: 'link_01',
  noteIds: ['n_01', 'n_02'],
  label: 'Оба лгут о вечере',
  createdAt: 1700000000,
};

// --- Тесты TruthTable ---

describe('TruthTableSchema', () => {
  it('принимает корректный объект', () => {
    const result = TruthTableSchema.safeParse(validTruthTable);
    expect(result.success).toBe(true);
  });

  it('отклоняет невалидный TruthValue', () => {
    const invalid = {
      char_01: { motive: { key: 'maybe' } },
    };
    const result = TruthTableSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('отклоняет пустой target', () => {
    const invalid = { '': { motive: { key: 'true' } } };
    const result = TruthTableSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// --- Тесты Character ---

describe('CharacterSchema', () => {
  it('принимает корректный Character', () => {
    const result = CharacterSchema.safeParse(validCharacter);
    expect(result.success).toBe(true);
  });

  it('отклоняет объект без behaviorModel', () => {
    const { behaviorModel: _removed, ...rest } = validCharacter;
    const result = CharacterSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('отклоняет пустой id', () => {
    const invalid = { ...validCharacter, id: '' };
    const result = CharacterSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// --- Тесты NoteSpan ---

describe('NoteSpanSchema', () => {
  it('принимает корректный NoteSpan', () => {
    const result = NoteSpanSchema.safeParse(validNoteSpan);
    expect(result.success).toBe(true);
  });

  it('отклоняет невалидную category', () => {
    const invalid = { ...validNoteSpan, category: 'weather' };
    const result = NoteSpanSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// --- Тесты Note ---

describe('NoteSchema', () => {
  it('принимает корректный Note', () => {
    const result = NoteSchema.safeParse(validNote);
    expect(result.success).toBe(true);
  });

  it('отклоняет Note без sourceScene', () => {
    const { sourceScene: _removed, ...rest } = validNote;
    const result = NoteSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('отклоняет отрицательный createdAt', () => {
    const invalid = { ...validNote, createdAt: -1 };
    const result = NoteSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// --- Тесты NoteLink ---

describe('NoteLinkSchema', () => {
  it('принимает корректный NoteLink', () => {
    const result = NoteLinkSchema.safeParse(validNoteLink);
    expect(result.success).toBe(true);
  });

  it('отклоняет noteIds длиной 1', () => {
    const invalid = { ...validNoteLink, noteIds: ['n_01'] };
    const result = NoteLinkSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('отклоняет noteIds длиной 4', () => {
    const invalid = { ...validNoteLink, noteIds: ['n_01', 'n_02', 'n_03', 'n_04'] };
    const result = NoteLinkSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('принимает noteIds длиной 3', () => {
    const valid = { ...validNoteLink, noteIds: ['n_01', 'n_02', 'n_03'] };
    const result = NoteLinkSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
