import { z } from 'zod';

export const CharacterRoleSchema = z.enum(['detective', 'suspect', 'victim']);
export type CharacterRole = z.infer<typeof CharacterRoleSchema>;

// Все поля behaviorModel — обязательные, т.к. персонаж без модели поведения
// не может быть отрисован движком. sourceEvidence — ссылка на первоисточник.
export const BehaviorModelSchema = z.object({
  baseline: z.string().min(1),
  underPressure: z.string().min(1),
  underSympathy: z.string().min(1),
  underLogic: z.string().min(1),
  sourceEvidence: z.string().min(1),
});

// quirks и sourceExamples — массивы, каждый элемент непустой.
// Пустой массив допустим (у персонажа может не быть ярко выраженных речевых приёмов),
// но каждый элемент обязан быть осмысленным.
export const SpeechSchema = z.object({
  rhythm: z.string().min(1),
  register: z.string().min(1),
  quirks: z.array(z.string().min(1)),
  sourceExamples: z.array(z.string().min(1)),
});

export const RelationshipSchema = z.object({
  targetId: z.string().min(1),
  description: z.string().min(1),
  sourceEvidence: z.string().min(1),
});

export const CharacterSchema = z.object({
  // id — стабильный идентификатор ('char_01'). min(1) — без пустых ID.
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  role: CharacterRoleSchema,
  // isAccusable — можно ли обвинить персонажа в финале. Обязательное булево.
  isAccusable: z.boolean(),
  // barOrder — порядок в меню бара. -1 = скрыть. Обязательное целое.
  barOrder: z.number().int(),
  // portraitId — ID ассета из ASSETS.portraits, не путь к файлу.
  portraitId: z.string().min(1),

  // appearance и его источник — оба обязательны (описание без источника недопустимо).
  appearance: z.string().min(1),
  appearanceSource: z.string().min(1),

  behaviorModel: BehaviorModelSchema,
  speech: SpeechSchema,

  // Секрет, мотив, алиби, knows, liesAbout — все обязательные строки.
  // '—' допустимо как строка-заглушка (например, у жертвы нет мотива), но пустая строка — нет.
  secret: z.string().min(1),
  motive: z.string().min(1),
  alibi: z.string().min(1),
  knows: z.string().min(1),
  liesAbout: z.string().min(1),

  // relationships — массив, может быть пустым (персонаж-одиночка).
  relationships: z.array(RelationshipSchema),
});
export type Character = z.infer<typeof CharacterSchema>;
