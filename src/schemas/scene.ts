import { z } from 'zod';
import { ChoiceOptionSchema, ConditionSchema, EffectsSchema } from './effects';

export const SceneTypeSchema = z.enum(['mandatory', 'optional', 'risky', 'death', 'finale']);
export type SceneType = z.infer<typeof SceneTypeSchema>;

export const EndOutcomeSchema = z.enum([
  'continue',
  'death',
  'chapter_end',
  'accusation_ready',
  'final',
]);
export type EndOutcome = z.infer<typeof EndOutcomeSchema>;

// --- Пять типов узлов. Каждый — чистый z.object().strict(),
// чтобы корректно войти в discriminatedUnion. ---

const NarrationNodeSchema = z
  .object({
    type: z.literal('narration'),
    id: z.string().min(1),
    text: z.string().min(1),
    next: z.string().min(1).optional(),
    noteSpans: z.array(z.string().min(1)).optional(),
  })
  .strict();

const DialogueNodeSchema = z
  .object({
    type: z.literal('dialogue'),
    id: z.string().min(1),
    speaker: z.string().min(1),
    text: z.string().min(1),
    next: z.string().min(1).optional(),
    noteSpans: z.array(z.string().min(1)).optional(),
  })
  .strict();

const ChoiceNodeSchema = z
  .object({
    type: z.literal('choice'),
    id: z.string().min(1),
    prompt: z.string().min(1),
    options: z.array(ChoiceOptionSchema).min(2).max(4),
  })
  .strict();

const CheckNodeSchema = z
  .object({
    type: z.literal('check'),
    id: z.string().min(1),
    condition: ConditionSchema,
    onPass: z.string().min(1),
    onFail: z.string().min(1),
  })
  .strict();

// EndNodeSchema — без refine на уровне объекта, чтобы не ломать discriminatedUnion.
// Проверка «nextSceneId обязателен при outcome=continue» вынесена на SceneNodeSchema.
const EndNodeSchema = z
  .object({
    type: z.literal('end'),
    id: z.string().min(1),
    outcome: EndOutcomeSchema,
    nextSceneId: z.string().min(1).optional(),
  })
  .strict();

// SceneNode — discriminated union по полю type.
// refine проверяет инвариант end-узла: при outcome='continue' нужен nextSceneId.
export const SceneNodeSchema = z
  .discriminatedUnion('type', [
    NarrationNodeSchema,
    DialogueNodeSchema,
    ChoiceNodeSchema,
    CheckNodeSchema,
    EndNodeSchema,
  ])
  .refine(
    (v) => v.type !== 'end' || v.outcome !== 'continue' || Boolean(v.nextSceneId),
    { message: 'nextSceneId обязателен при outcome=continue' },
  );
export type SceneNode = z.infer<typeof SceneNodeSchema>;

// HubConfig — конфигурация хаба (сцена с выбором нескольких опций).
// .refine: pick не может быть больше числа options.
export const HubConfigSchema = z
  .object({
    options: z.array(z.string().min(1)).min(2),
    pick: z.number().int().min(1),
    afterHubSceneId: z.string().min(1),
  })
  .strict()
  .refine((v) => v.pick <= v.options.length, {
    message: 'pick не может быть больше числа options',
  });
export type HubConfig = z.infer<typeof HubConfigSchema>;

// Scene — сцена (глава/эпизод).
// Два refine:
// 1. Hub-сцена должна иметь slotCost=0.
// 2. entry должен ссылаться на существующий узел в nodes.
export const SceneSchema = z
  .object({
    id: z.string().min(1),
    chapter: z.number().int().min(1),
    title: z.string().min(1),
    type: SceneTypeSchema,
    background: z.string().min(1),
    characters: z.array(z.string().min(1)),
    entry: z.string().min(1),
    slotCost: z.number().int().min(0),
    nodes: z.record(z.string().min(1), SceneNodeSchema),
    hubConfig: HubConfigSchema.optional(),
    onEnter: EffectsSchema.optional(),
    onExit: EffectsSchema.optional(),
  })
  .strict()
  .refine((v) => v.hubConfig === undefined || v.slotCost === 0, {
    message: 'Hub-сцена должна иметь slotCost=0',
  })
  .refine((v) => Object.prototype.hasOwnProperty.call(v.nodes, v.entry), {
    message: 'entry должен ссылаться на существующий узел',
  });
export type Scene = z.infer<typeof SceneSchema>;
