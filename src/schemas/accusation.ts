import { z } from 'zod';
import { NoteCategorySchema } from './truthTable';

// AccusationInput — вход обвинения.
// accused: 1–12 подозреваемых (минимум один, максимум все 12).
// noteIds: 3–12 заметок-доказательств (минимум 3 для осмысленного обвинения).
export const AccusationInputSchema = z
  .object({
    accused: z.array(z.string().min(1)).min(1).max(12),
    noteIds: z.array(z.string().min(1)).min(3).max(12),
  })
  .strict();
export type AccusationInput = z.infer<typeof AccusationInputSchema>;

export const AccusationOutcomeSchema = z.enum(['fail', 'partial_low', 'partial_high', 'full']);
export type AccusationOutcome = z.infer<typeof AccusationOutcomeSchema>;

// AccusationResult — результат вычисления обвинения.
// score — может быть отрицательным (штрафы за противоречия).
// coverage — 0..5 (сколько категорий покрыто доказательствами).
export const AccusationResultSchema = z
  .object({
    score: z.number(),
    coverage: z.number().int().min(0).max(5),
    validCount: z.number().int().min(0),
    strongCount: z.number().int().min(0),
    contradictionPenalty: z.number().int().min(0),
    outcome: AccusationOutcomeSchema,
    missingCategories: z.array(NoteCategorySchema),
    submittedNoteIds: z.array(z.string()),
    accusedCount: z.number().int().min(0),
  })
  .strict();
export type AccusationResult = z.infer<typeof AccusationResultSchema>;
