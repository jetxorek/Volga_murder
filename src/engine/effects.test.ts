import { describe, it, expect } from 'vitest';
import type { Note } from '../schemas/note';
import { evaluateCondition, applyEffects } from './effects';
import type { GameState } from './effects';

const makeNote = (id: string): Note => ({
  id,
  text: 't',
  statement: 's',
  category: 'motive',
  target: 'char_02',
  attributedTo: 'detective',
  evidenceType: 'observation',
  truthKey: 'k',
  sourceScene: 'test',
  truth: 'true',
  strength: 'weak',
  fromRiskyScene: false,
  createdAt: 0,
});

const baseState: GameState = {
  suspicion: 50,
  trust: { char_02: 2, char_03: 1 },
  notes: [],
};

describe('evaluateCondition', () => {
  it('пустое условие → true', () => {
    expect(evaluateCondition(baseState, {})).toBe(true);
  });

  it('suspicionBelow: 60, state 50 → true', () => {
    expect(evaluateCondition(baseState, { suspicionBelow: 60 })).toBe(true);
  });

  it('suspicionBelow: 50, state 50 → false (строгое <)', () => {
    expect(evaluateCondition(baseState, { suspicionBelow: 50 })).toBe(false);
  });

  it('suspicionBelow: 40, state 50 → false', () => {
    expect(evaluateCondition(baseState, { suspicionBelow: 40 })).toBe(false);
  });

  it('suspicionAbove: 40, state 50 → true', () => {
    expect(evaluateCondition(baseState, { suspicionAbove: 40 })).toBe(true);
  });

  it('suspicionAbove: 50, state 50 → false (строгое >)', () => {
    expect(evaluateCondition(baseState, { suspicionAbove: 50 })).toBe(false);
  });

  it('trustBelow char_02 value 3, current 2 → true', () => {
    expect(evaluateCondition(baseState, { trustBelow: { charId: 'char_02', value: 3 } })).toBe(true);
  });

  it('trustBelow char_02 value 2, current 2 → false', () => {
    expect(evaluateCondition(baseState, { trustBelow: { charId: 'char_02', value: 2 } })).toBe(false);
  });

  it('trustBelow отсутствующего charId → current 0, value 1 → true', () => {
    expect(evaluateCondition(baseState, { trustBelow: { charId: 'char_99', value: 1 } })).toBe(true);
  });

  it('hasNoteIds: n1, есть → true', () => {
    const state: GameState = { ...baseState, notes: [makeNote('n1')] };
    expect(evaluateCondition(state, { hasNoteIds: ['n1'] })).toBe(true);
  });

  it('hasNoteIds: n1, нет → false', () => {
    expect(evaluateCondition(baseState, { hasNoteIds: ['n1'] })).toBe(false);
  });

  it('hasNoteIds: [n1, n2], есть только n1 → false', () => {
    const state: GameState = { ...baseState, notes: [makeNote('n1')] };
    expect(evaluateCondition(state, { hasNoteIds: ['n1', 'n2'] })).toBe(false);
  });

  it('notHasNoteIds: n1, нет → true', () => {
    expect(evaluateCondition(baseState, { notHasNoteIds: ['n1'] })).toBe(true);
  });

  it('notHasNoteIds: n1, есть → false', () => {
    const state: GameState = { ...baseState, notes: [makeNote('n1')] };
    expect(evaluateCondition(state, { notHasNoteIds: ['n1'] })).toBe(false);
  });

  it('комбинация: suspicionBelow 60 + hasNoteIds n1 → true', () => {
    const state: GameState = { ...baseState, notes: [makeNote('n1')] };
    expect(evaluateCondition(state, { suspicionBelow: 60, hasNoteIds: ['n1'] })).toBe(true);
  });

  it('комбинация: suspicionBelow 60 + hasNoteIds n1, без n1 → false', () => {
    expect(evaluateCondition(baseState, { suspicionBelow: 60, hasNoteIds: ['n1'] })).toBe(false);
  });
});

describe('applyEffects', () => {
  it('пустые effects → state без изменений по значениям', () => {
    const next = applyEffects(baseState, {});
    expect(next.suspicion).toBe(50);
    expect(next.trust).toEqual(baseState.trust);
    expect(next.notes).toBe(baseState.notes);
  });

  it('suspicionDelta +10 → 60', () => {
    const next = applyEffects(baseState, { suspicionDelta: 10 });
    expect(next.suspicion).toBe(60);
  });

  it('suspicionDelta +10 при 90 → 100 (clamp)', () => {
    const state: GameState = { ...baseState, suspicion: 90 };
    expect(applyEffects(state, { suspicionDelta: 10 }).suspicion).toBe(100);
  });

  it('suspicionDelta -20 при 10 → 0 (clamp)', () => {
    const state: GameState = { ...baseState, suspicion: 10 };
    expect(applyEffects(state, { suspicionDelta: -20 }).suspicion).toBe(0);
  });

  it('trustDelta {char_02: +1} при 2 → 3', () => {
    const next = applyEffects(baseState, { trustDelta: { char_02: 1 } });
    expect(next.trust.char_02).toBe(3);
  });

  it('trustDelta {char_02: +1} при 3 → 3 (clamp)', () => {
    const state: GameState = { ...baseState, trust: { char_02: 3 } };
    expect(applyEffects(state, { trustDelta: { char_02: 1 } }).trust.char_02).toBe(3);
  });

  it('trustDelta {char_02: -2} при 1 → 0 (clamp)', () => {
    const state: GameState = { ...baseState, trust: { char_02: 1 } };
    expect(applyEffects(state, { trustDelta: { char_02: -2 } }).trust.char_02).toBe(0);
  });

  it('trustDelta нового charId → добавляется', () => {
    const next = applyEffects(baseState, { trustDelta: { char_99: 2 } });
    expect(next.trust.char_99).toBe(2);
  });

  it('комбинация suspicionDelta + trustDelta', () => {
    const next = applyEffects(baseState, { suspicionDelta: -5, trustDelta: { char_03: 2 } });
    expect(next.suspicion).toBe(45);
    expect(next.trust.char_03).toBe(3);
  });

  it('иммутабельность: входной state не меняется', () => {
    const snapshot = JSON.parse(JSON.stringify(baseState));
    applyEffects(baseState, { suspicionDelta: 10, trustDelta: { char_02: 1 } });
    expect(baseState).toEqual(snapshot);
  });

  it('иммутабельность: новый объект возвращается', () => {
    const next = applyEffects(baseState, { suspicionDelta: 10 });
    expect(next).not.toBe(baseState);
  });
});
