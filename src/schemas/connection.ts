import { z } from 'zod';

/** Тип связи между персонажами (выбирает игрок). */
export const ConnectionTypeSchema = z.enum([
  'family',
  'love',
  'service',
  'debt',
  'enmity',
  'other',
]);
export type ConnectionType = z.infer<typeof ConnectionTypeSchema>;

/** Связь, созданная игроком на «Схеме персонажей». */
export const PlayerConnectionSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  type: ConnectionTypeSchema,
});
export type PlayerConnection = z.infer<typeof PlayerConnectionSchema>;
