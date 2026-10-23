import { describe, it, expect } from 'vitest';
import {
  AccusationInputSchema,
  AccusationResultSchema,
  type AccusationInput,
  type AccusationResult,
} from './index';

// --- Тесты AccusationInput ---

describe('AccusationInputSchema', () => {
  it('принимает корректный AccusationInput', () => {
    const valid: AccusationInput = {
      accused: ['char_01'],
      noteIds: ['n1', 'n2', 'n3'],
    };
    const result = AccusationInputSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('отклоняет accused длиной 0', () => {
    const invalid = { accused: [], noteIds: ['n1', 'n2', 'n3'] };
    const result = AccusationInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('отклоняет accused длиной 13', () => {
    const accused = Array.from({ length: 13 }, (_, i) => `char_${i}`);
    const invalid = { accused, noteIds: ['n1', 'n2', 'n3'] };
    const result = AccusationInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('отклоняет noteIds длиной 2', () => {
    const invalid = { accused: ['char_01'], noteIds: ['n1', 'n2'] };
    const result = AccusationInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('отклоняет noteIds длиной 13', () => {
    const noteIds = Array.from({ length: 13 }, (_, i) => `n${i}`);
    const invalid = { accused: ['char_01'], noteIds };
    const result = AccusationInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('отклоняет неизвестное поле', () => {
    const invalid = { accused: ['char_01'], noteIds: ['n1', 'n2', 'n3'], extra: 'oops' };
    const result = AccusationInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// --- Тесты AccusationResult ---

describe('AccusationResultSchema', () => {
  it('принимает валидный результат с score=-3, outcome=fail', () => {
    const valid: AccusationResult = {
      score: -3,
      coverage: 1,
      validCount: 1,
      strongCount: 0,
      contradictionPenalty: 4,
      outcome: 'fail',
      missingCategories: ['motive', 'opportunity', 'alibi', 'psychology'],
      accusedCount: 1,
    };
    const result = AccusationResultSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('принимает результат с outcome=full', () => {
    const valid: AccusationResult = {
      score: 25,
      coverage: 5,
      validCount: 8,
      strongCount: 5,
      contradictionPenalty: 0,
      outcome: 'full',
      missingCategories: [],
      accusedCount: 3,
    };
    const result = AccusationResultSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('отклоняет coverage=6', () => {
    const invalid = {
      score: 10,
      coverage: 6,
      validCount: 5,
      strongCount: 3,
      contradictionPenalty: 0,
      outcome: 'partial_high',
      missingCategories: [],
      accusedCount: 2,
    };
    const result = AccusationResultSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('отклоняет невалидный outcome', () => {
    const invalid = {
      score: 10,
      coverage: 3,
      validCount: 5,
      strongCount: 3,
      contradictionPenalty: 0,
      outcome: 'success',
      missingCategories: [],
      accusedCount: 2,
    };
    const result = AccusationResultSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('отклоняет отрицательный contradictionPenalty', () => {
    const invalid = {
      score: 10,
      coverage: 3,
      validCount: 5,
      strongCount: 3,
      contradictionPenalty: -1,
      outcome: 'partial_high',
      missingCategories: [],
      accusedCount: 2,
    };
    const result = AccusationResultSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
