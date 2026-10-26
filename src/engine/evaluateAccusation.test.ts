import { describe, it, expect } from 'vitest';
import { evaluateAccusation } from './evaluateAccusation';
import { createNote } from './noteOps';
import { NOTE_MATRIX } from '../data/noteMatrix';
import type { Note } from '../schemas/note';

const noteMatrix = NOTE_MATRIX;

describe('evaluateAccusation', () => {
  it('пустой набор заметок → score 0, coverage 0, outcome fail', () => {
    const result = evaluateAccusation({ accused: ['char_02'], noteIds: [] }, []);
    expect(result.score).toBe(0);
    expect(result.coverage).toBe(0);
    expect(result.outcome).toBe('fail');
  });

  it('только true-заметки 5 категорий для char_02 → partial_high', () => {
    const notes: Note[] = [
      createNote(noteMatrix['n_ch1_01_02'], 'test', false, 1), // motive, true
      createNote(noteMatrix['n_ch2_03_01'], 'test', false, 2), // opportunity, true
      createNote(noteMatrix['n_ch2_03_02'], 'test', false, 3), // alibi, true
      createNote(noteMatrix['n_ch2_01_02'], 'test', false, 4), // psychology, true
      createNote(noteMatrix['n_ch3_01c_03'], 'test', false, 5), // contradiction, true
    ];
    const noteIds = notes.map((n) => n.id);
    const result = evaluateAccusation({ accused: ['char_02'], noteIds }, notes);
    expect(result.coverage).toBe(5);
    expect(result.outcome).toBe('partial_high');
  });

  it('true + false одной target+category → штраф 2', () => {
    const notes: Note[] = [
      createNote(noteMatrix['n_ch2_03_02'], 'test', false, 1), // alibi, true
      createNote(noteMatrix['n_ch2_04_01'], 'test', false, 2), // alibi, false
    ];
    const noteIds = notes.map((n) => n.id);
    const result = evaluateAccusation({ accused: ['char_02'], noteIds }, notes);
    expect(result.contradictionPenalty).toBe(2);
  });

  it('заметки target hint/victim исключаются из score и coverage', () => {
    // Создадим заметку с target='hint'
    const hintSpan = { ...noteMatrix['n_ch1_01_01'], target: 'hint', id: 'hint_1' };
    const notes: Note[] = [createNote(hintSpan, 'test', false, 1)];
    const noteIds = notes.map((n) => n.id);
    const result = evaluateAccusation({ accused: ['char_02'], noteIds }, notes);
    expect(result.score).toBe(0);
    expect(result.coverage).toBe(0);
  });

  it('full требует все CULPRITS в accused', () => {
    const notes: Note[] = [
      createNote(noteMatrix['n_ch1_01_02'], 'test', false, 1),
      createNote(noteMatrix['n_ch2_03_01'], 'test', false, 2),
      createNote(noteMatrix['n_ch2_03_02'], 'test', false, 3),
      createNote(noteMatrix['n_ch2_01_02'], 'test', false, 4),
      createNote(noteMatrix['n_ch3_01c_03'], 'test', false, 5),
      createNote(noteMatrix['n_ch5_01_02'], 'test', false, 6),
      createNote(noteMatrix['n_ch2_01_01'], 'test', false, 7),
      createNote(noteMatrix['n_ch3_01b_02'], 'test', false, 8),
      createNote(noteMatrix['n_ch2_01_03'], 'test', false, 9),
      createNote(noteMatrix['n_ch3_04b_01'], 'test', false, 10),
    ];
    const noteIds = notes.map((n) => n.id);

    // Только char_02 → не full
    const result1 = evaluateAccusation({ accused: ['char_02'], noteIds }, notes);
    expect(result1.outcome).not.toBe('full');

    // char_02 + char_03 → full
    const result2 = evaluateAccusation({ accused: ['char_02', 'char_03'], noteIds }, notes);
    expect(result2.outcome).toBe('full');
    expect(result2.score).toBeGreaterThanOrEqual(8);
    expect(result2.coverage).toBe(5);
  });
});

describe('evaluateAccusation: интеграционный тест Пути A', () => {
  it('10 заметок Пути A → outcome full, score ≥ 8, coverage 5', () => {
    const pathANoteIds = [
      'n_ch1_01_02',
      'n_ch2_03_01',
      'n_ch2_03_02',
      'n_ch2_01_02',
      'n_ch3_01c_03',
      'n_ch5_01_02',
      'n_ch2_01_01',
      'n_ch3_01b_02',
      'n_ch2_01_03',
      'n_ch3_04b_01',
    ];

    const matrix: Record<string, (typeof noteMatrix)[keyof typeof noteMatrix]> = noteMatrix;
    const notes = pathANoteIds.map((id, idx) => createNote(matrix[id], 'test_scene', false, idx));

    const result = evaluateAccusation(
      { accused: ['char_02', 'char_03'], noteIds: pathANoteIds },
      notes,
    );

    expect(result.outcome).toBe('full');
    expect(result.score).toBeGreaterThanOrEqual(8);
    expect(result.coverage).toBe(5);
  });
});
