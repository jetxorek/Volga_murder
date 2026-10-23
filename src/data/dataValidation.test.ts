import { describe, it, expect } from 'vitest';
import { CHARACTERS } from './characters';
import { CULPRITS, TRUTH_TABLE } from './truthTable';
import type { NoteCategory } from '../schemas/truthTable';

describe('data: characters', () => {
  it('CULPRITS ⊆ CHARACTERS', () => {
    for (const id of CULPRITS) {
      expect(CHARACTERS).toHaveProperty(id);
    }
  });

  it('все relationships.targetId существуют в CHARACTERS', () => {
    for (const ch of Object.values(CHARACTERS)) {
      for (const rel of ch.relationships) {
        expect(CHARACTERS).toHaveProperty(rel.targetId);
      }
    }
  });

  it('isAccusable=true только у подозреваемых', () => {
    for (const ch of Object.values(CHARACTERS)) {
      if (ch.isAccusable) expect(ch.role).toBe('suspect');
    }
  });
});

describe('data: truthTable', () => {
  it('у каждого CULPRIT есть все 5 категорий', () => {
    const cats: readonly NoteCategory[] = [
      'motive',
      'opportunity',
      'alibi',
      'psychology',
      'contradiction',
    ];
    for (const id of CULPRITS) {
      expect(TRUTH_TABLE).toHaveProperty(id);
      const entry = TRUTH_TABLE[id];
      expect(entry).toBeDefined();
      for (const cat of cats) {
        expect(entry).toHaveProperty(cat);
      }
    }
  });

  it('≥20% ключей — false', () => {
    let total = 0;
    let falses = 0;
    for (const target of Object.values(TRUTH_TABLE)) {
      for (const cat of Object.values(target)) {
        if (cat === undefined) continue;
        for (const v of Object.values(cat)) {
          total++;
          if (v === 'false') falses++;
        }
      }
    }
    expect(falses / total).toBeGreaterThanOrEqual(0.2);
  });

  it('CULPRITS — массив, не константа', () => {
    expect(Array.isArray(CULPRITS)).toBe(true);
    expect(CULPRITS.length).toBeGreaterThan(0);
  });
});
