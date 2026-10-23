import type { Note } from '../schemas/note';
import type { NoteCategory } from '../schemas/truthTable';
import type { AccusationInput, AccusationResult, AccusationOutcome } from '../schemas/accusation';
import { CULPRITS } from '../data/truthTable';

const ALL_CATEGORIES: readonly NoteCategory[] = [
  'motive',
  'opportunity',
  'alibi',
  'psychology',
  'contradiction',
];

/**
 * Оценивает обвинение по формуле раздела 5.6 плейбука.
 * score = Σ(true:+1, plausible:0, false:−1) + Σ(strong:+0.5) − 2×(пары true/false одного target+category).
 * Заметки target ∈ {hint, victim} исключаются из счёта и coverage.
 * full требует: score ≥ 8, coverage 5/5, все CULPRITS в accused.
 */
export function evaluateAccusation(
  input: AccusationInput,
  notes: Note[],
  culprits: readonly string[] = CULPRITS,
): AccusationResult {
  const requested = new Set(input.noteIds);
  const relevant = notes.filter(
    (n) => requested.has(n.id) && n.target !== 'hint' && n.target !== 'victim',
  );

  let score = 0;
  let validCount = 0;
  let strongCount = 0;
  for (const note of relevant) {
    if (note.truth === 'true') {
      score += 1;
      validCount += 1;
    } else if (note.truth === 'false') {
      score -= 1;
    }
    if (note.strength === 'strong') {
      score += 0.5;
      strongCount += 1;
    }
  }

  const contradictionPenalty = computeContradictionPenalty(relevant);
  score -= contradictionPenalty;

  const coveredCategories = new Set<NoteCategory>();
  for (const note of relevant) coveredCategories.add(note.category);
  const coverage = coveredCategories.size;
  const missingCategories = ALL_CATEGORIES.filter((c) => !coveredCategories.has(c));

  const allCulpritsAccused = culprits.every((c) => input.accused.includes(c));
  const outcome = pickOutcome(score, coverage, allCulpritsAccused);

  return {
    score,
    coverage,
    validCount,
    strongCount,
    contradictionPenalty,
    outcome,
    missingCategories,
    accusedCount: input.accused.length,
  };
}

/**
 * Штраф за противоречия: для каждой пары (target, category) с хотя бы
 * одной true и одной false заметкой — −2 за пару (min(trues, falses)).
 */
function computeContradictionPenalty(relevant: Note[]): number {
  const buckets = new Map<string, { trues: number; falses: number }>();
  for (const note of relevant) {
    const key = `${note.target}::${note.category}`;
    const b = buckets.get(key) ?? { trues: 0, falses: 0 };
    if (note.truth === 'true') b.trues += 1;
    else if (note.truth === 'false') b.falses += 1;
    buckets.set(key, b);
  }
  let penalty = 0;
  for (const b of buckets.values()) {
    penalty += Math.min(b.trues, b.falses) * 2;
  }
  return penalty;
}

function pickOutcome(
  score: number,
  coverage: number,
  allCulpritsAccused: boolean,
): AccusationOutcome {
  if (score >= 8 && coverage === 5 && allCulpritsAccused) return 'full';
  if (score >= 4) return 'partial_high';
  if (score >= 1 && coverage >= 3) return 'partial_low';
  return 'fail';
}
