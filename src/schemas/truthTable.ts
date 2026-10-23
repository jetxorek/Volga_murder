import { z } from 'zod';

export const TruthValueSchema = z.enum(['true', 'plausible', 'false']);
export type TruthValue = z.infer<typeof TruthValueSchema>;

export const NoteCategorySchema = z.enum([
  'motive',
  'opportunity',
  'alibi',
  'psychology',
  'contradiction',
]);
export type NoteCategory = z.infer<typeof NoteCategorySchema>;

// TruthTable: target -> category -> truthKey -> TruthValue
// target — ID сущности ('char_01', 'group', 'victim').
// truthKey — ключ факта внутри категории (например, 'has_debt').
// Пустые строки запрещены: ID и ключи всегда осмысленны.
// Категории опциональны: у цели может не быть фактов по всем категориям.
const CategoryRecordSchema = z
  .object({
    motive: z.record(z.string().min(1), TruthValueSchema),
    opportunity: z.record(z.string().min(1), TruthValueSchema),
    alibi: z.record(z.string().min(1), TruthValueSchema),
    psychology: z.record(z.string().min(1), TruthValueSchema),
    contradiction: z.record(z.string().min(1), TruthValueSchema),
  })
  .partial();

export const TruthTableSchema = z.record(z.string().min(1), CategoryRecordSchema);
export type TruthTable = z.infer<typeof TruthTableSchema>;
