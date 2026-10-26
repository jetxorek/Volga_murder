import { describe, it, expect } from 'vitest';
import { CHARACTERS } from './characters';
import { CULPRITS, TRUTH_TABLE } from './truthTable';
import { NOTE_MATRIX } from './noteMatrix';
import type { NoteCategory } from '../schemas/truthTable';
import type { NoteSpan } from '../schemas/note';
import type { TruthTable } from '../schemas/truthTable';

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

describe('data: noteMatrix', () => {
  const T: TruthTable = TRUTH_TABLE;
  const spans: NoteSpan[] = Object.values(NOTE_MATRIX);

  it('в матрице ровно 68 заметок', () => {
    expect(spans.length).toBe(68);
  });

  it('ID заметки совпадает с ключом в реестре', () => {
    for (const [key, span] of Object.entries(NOTE_MATRIX)) {
      expect(span.id).toBe(key);
    }
  });

  it('все truthKey существуют в TRUTH_TABLE[target][category]', () => {
    for (const span of spans) {
      const entry = T[span.target];
      expect(entry, `target ${span.target} отсутствует в TRUTH_TABLE`).toBeDefined();
      const cat = entry?.[span.category];
      expect(cat, `категория ${span.category} у ${span.target} отсутствует`).toBeDefined();
      expect(
        cat?.[span.truthKey],
        `truthKey ${span.truthKey} у ${span.target}.${span.category} отсутствует`,
      ).toBeDefined();
    }
  });

  it('все target — существующие charId, либо group/victim/hint', () => {
    const allowed = new Set<string>([...Object.keys(CHARACTERS), 'group', 'victim', 'hint']);
    for (const span of spans) {
      expect(allowed.has(span.target), `неизвестный target: ${span.target}`).toBe(true);
    }
  });

  it('все attributedTo — существующие charId, либо detective/world', () => {
    const allowed = new Set<string>([...Object.keys(CHARACTERS), 'detective', 'world']);
    for (const span of spans) {
      expect(allowed.has(span.attributedTo), `неизвестный attributedTo: ${span.attributedTo}`).toBe(
        true,
      );
    }
  });

  it('≥20% заметок — false', () => {
    let total = 0;
    let falses = 0;
    for (const span of spans) {
      const truth = T[span.target]?.[span.category]?.[span.truthKey];
      total++;
      if (truth === 'false') falses++;
    }
    expect(falses / total).toBeGreaterThanOrEqual(0.2);
  });

  it('каждая категория покрыта хотя бы одной заметкой', () => {
    const cats: readonly NoteCategory[] = [
      'motive',
      'opportunity',
      'alibi',
      'psychology',
      'contradiction',
    ];
    for (const cat of cats) {
      expect(
        spans.some((s) => s.category === cat),
        `категория ${cat} не покрыта`,
      ).toBe(true);
    }
  });

  it('у каждого CULPRIT есть хотя бы одна заметка в каждой категории', () => {
    const cats: readonly NoteCategory[] = [
      'motive',
      'opportunity',
      'alibi',
      'psychology',
      'contradiction',
    ];
    for (const id of CULPRITS) {
      for (const cat of cats) {
        const found = spans.some((s) => s.target === id && s.category === cat);
        expect(found, `у ${id} нет заметки в категории ${cat}`).toBe(true);
      }
    }
  });

  it('противоречивые пары: ≥7 (true/false с одним target+category)', () => {
    const buckets = new Map<string, { trues: number; falses: number }>();
    for (const span of spans) {
      const truth = T[span.target]?.[span.category]?.[span.truthKey];
      const key = `${span.target}::${span.category}`;
      const bucket = buckets.get(key) ?? { trues: 0, falses: 0 };
      if (truth === 'true') bucket.trues++;
      if (truth === 'false') bucket.falses++;
      buckets.set(key, bucket);
    }
    let pairs = 0;
    for (const b of buckets.values()) {
      if (b.trues > 0 && b.falses > 0) pairs++;
    }
    expect(pairs).toBeGreaterThanOrEqual(7);
  });
});
