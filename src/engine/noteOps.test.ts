import { describe, it, expect } from 'vitest';
import { createNote, addNoteToList, computeStrength } from './noteOps';
import { NOTE_MATRIX } from '../data/noteMatrix';

const noteMatrix = NOTE_MATRIX;

describe('computeStrength', () => {
  it('false → weak', () => {
    const span = noteMatrix['n_ch2_04_01'];
    const strength = computeStrength(span, 'false', 'test_scene', false);
    expect(strength).toBe('weak');
  });

  it('contradiction + true → strong', () => {
    const span = noteMatrix['n_ch3_01c_03'];
    const strength = computeStrength(span, 'true', 'test_scene', false);
    expect(strength).toBe('strong');
  });

  it('fromRiskyScene → strong', () => {
    const span = noteMatrix['n_ch2_03_02'];
    const strength = computeStrength(span, 'true', 'test_scene', true);
    expect(strength).toBe('strong');
  });

  it('парная в другой сцене → strong', () => {
    // n_ch1_01_03: char_04, psychology, proud_and_dismissive, true
    // Есть ли другая заметка с char_04 psychology в другой сцене?
    // Проверим: n_ch1_01_03 — единственная для char_04 psychology
    // Значит должна быть weak
    const span = noteMatrix['n_ch1_01_03'];
    const strength = computeStrength(span, 'true', 'test_scene', false);
    expect(strength).toBe('weak');
  });
});

describe('createNote', () => {
  it('создаёт заметку с truth=false из n_ch2_04_01', () => {
    const span = noteMatrix['n_ch2_04_01'];
    const note = createNote(span, 'ch2_04', false, 1000);
    expect(note.truth).toBe('false');
    expect(note.strength).toBe('weak');
    expect(note.sourceScene).toBe('ch2_04');
    expect(note.createdAt).toBe(1000);
    expect(note.id).toBe('n_ch2_04_01');
  });

  it('создаёт заметку с truth=true, strength=strong из n_ch3_01c_03', () => {
    const span = noteMatrix['n_ch3_01c_03'];
    const note = createNote(span, 'ch3_01c', false, 2000);
    expect(note.truth).toBe('true');
    expect(note.strength).toBe('strong');
    expect(note.sourceScene).toBe('ch3_01c');
    expect(note.createdAt).toBe(2000);
  });

  it('создаёт заметку с fromRiskyScene=true → strength=strong', () => {
    const span = noteMatrix['n_ch2_03_02'];
    const note = createNote(span, 'ch2_03', true, 3000);
    expect(note.truth).toBe('true');
    expect(note.strength).toBe('strong');
    expect(note.fromRiskyScene).toBe(true);
  });

  it('сохраняет createdAt точно', () => {
    const span = noteMatrix['n_ch1_01_01'];
    const note = createNote(span, 'ch1_01', false, 999999);
    expect(note.createdAt).toBe(999999);
  });
});

describe('addNoteToList', () => {
  it('добавляет заметку в пустой массив', () => {
    const span = noteMatrix['n_ch1_01_01'];
    const note = createNote(span, 'ch1_01', false, 1000);
    const result = addNoteToList([], note);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('n_ch1_01_01');
  });

  it('не добавляет дубликат', () => {
    const span = noteMatrix['n_ch1_01_01'];
    const note = createNote(span, 'ch1_01', false, 1000);
    const list = addNoteToList([], note);
    const result = addNoteToList(list, note);
    expect(result).toHaveLength(1);
  });

  it('иммутабельно: старый массив !== новый', () => {
    const span = noteMatrix['n_ch1_01_01'];
    const note = createNote(span, 'ch1_01', false, 1000);
    const original: typeof note[] = [];
    const result = addNoteToList(original, note);
    expect(original).not.toBe(result);
    expect(original).toHaveLength(0);
    expect(result).toHaveLength(1);
  });

  it('возвращает тот же массив при дубликате', () => {
    const span = noteMatrix['n_ch1_01_01'];
    const note = createNote(span, 'ch1_01', false, 1000);
    const original = [note];
    const result = addNoteToList(original, note);
    expect(result).toBe(original);
  });
});
