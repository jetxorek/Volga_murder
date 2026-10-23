import { z } from 'zod';

// Effects — что меняется при выборе/переходе.
// Все поля опциональны: эффект может менять только одно.
// .strict() — лишние поля в эффектах — баг, а не «на будущее».
export const EffectsSchema = z
  .object({
    suspicionDelta: z.number().int().optional(),
    trustDelta: z.record(z.string(), z.number().int()).optional(),
    addNoteIds: z.array(z.string().min(1)).optional(),
    removeNoteIds: z.array(z.string().min(1)).optional(),
    setFlag: z.string().min(1).optional(),
  })
  .strict();
export type Effects = z.infer<typeof EffectsSchema>;

// Condition — условие для check-узлов и опций выбора.
// Все поля опциональны; проверка проходит, если выполнены все заданные.
// .strict() — неизвестные поля условия — баг.
export const ConditionSchema = z
  .object({
    suspicionBelow: z.number().int().min(0).max(100).optional(),
    suspicionAbove: z.number().int().min(0).max(100).optional(),
    trustBelow: z
      .object({ charId: z.string().min(1), value: z.number().int().min(0).max(3) })
      .strict()
      .optional(),
    hasNoteIds: z.array(z.string().min(1)).optional(),
    notHasNoteIds: z.array(z.string().min(1)).optional(),
  })
  .strict();
export type Condition = z.infer<typeof ConditionSchema>;

// ChoiceOption — вариант выбора.
// .refine гарантирует, что опция ведёт ровно в одно место:
// либо nextNodeId (внутри сцены), либо nextSceneId (в другую сцену).
export const ChoiceOptionSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    nextNodeId: z.string().min(1).optional(),
    nextSceneId: z.string().min(1).optional(),
    effects: EffectsSchema.optional(),
    requires: ConditionSchema.optional(),
  })
  .strict()
  .refine((v) => Boolean(v.nextNodeId) !== Boolean(v.nextSceneId), {
    message: 'Ровно одно из nextNodeId / nextSceneId должно быть задано',
  });
export type ChoiceOption = z.infer<typeof ChoiceOptionSchema>;
