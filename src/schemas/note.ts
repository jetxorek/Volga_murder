import { z } from 'zod';
import { NoteCategorySchema, TruthValueSchema } from './truthTable';

export const EvidenceTypeSchema = z.enum(['testimony', 'observation', 'document']);
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

export const NoteStrengthSchema = z.enum(['weak', 'strong']);
export type NoteStrength = z.infer<typeof NoteStrengthSchema>;

// NoteSpan — фрагмент текста, который игрок может занести в блокнот.
// Все строковые поля обязательны: заметка без текста/категории/цели бессмысленна.
// attributedTo — автор утверждения ('char_02' | 'detective' | 'world').
// truthKey — ключ в TruthTable, по которому вычисляется truth.
export const NoteSpanSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  statement: z.string().min(1),
  category: NoteCategorySchema,
  target: z.string().min(1),
  attributedTo: z.string().min(1),
  evidenceType: EvidenceTypeSchema,
  truthKey: z.string().min(1),
});
export type NoteSpan = z.infer<typeof NoteSpanSchema>;

// Note — NoteSpan, уже занесённый игроком. Расширяет NoteSpanSchema,
// добавляя игровые поля: источник (сцена), вычисленную истинность, силу,
// флаг рискованной сцены и timestamp создания.
export const NoteSchema = NoteSpanSchema.extend({
  sourceScene: z.string().min(1),
  truth: TruthValueSchema,
  strength: NoteStrengthSchema,
  fromRiskyScene: z.boolean(),
  createdAt: z.number().int().nonnegative(),
});
export type Note = z.infer<typeof NoteSchema>;

// NoteLink — связь между 2–3 заметками с подписью.
// min(2).max(3): меньше двух — нет связи, больше трёх — перегрузка UI.
export const NoteLinkSchema = z.object({
  id: z.string().min(1),
  noteIds: z.array(z.string().min(1)).min(2).max(3),
  label: z.string().min(1),
  createdAt: z.number().int().nonnegative(),
});
export type NoteLink = z.infer<typeof NoteLinkSchema>;
