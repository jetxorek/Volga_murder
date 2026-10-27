import { z } from 'zod';
import { NoteLinkSchema, NoteSchema } from './note';
import { PlayerConnectionSchema } from './connection';

// SaveState — снимок прогресса. Только save-поля; UI-поля сюда не входят.
// .strict() — защита от «забыл убрать UI-поле». Если кто-то добавит
// toast/overlay/activeSpeaker/deathContext/lastAccusationResult/finaleChoice/
// ironPoirot/pendingNextScene/screen — тест упадёт.
export const SaveStateSchema = z
  .object({
    version: z.literal(1),
    playerId: z.string().min(1),
    chapter: z.number().int().min(1),
    currentScene: z.string().min(1),
    currentNode: z.string().min(1),
    sceneSlotsLeft: z.number().int().min(0),
    suspicion: z.number().int().min(0).max(100),
    trust: z.record(z.string().min(1), z.number().int().min(0).max(3)),
    notes: z.array(NoteSchema),
    links: z.array(NoteLinkSchema),
    hintsUsed: z
      .object({
        greyCells: z.number().int().min(0),
        memoryTheater: z.number().int().min(0),
        snowWindow: z.number().int().min(0),
      })
      .strict(),
    deaths: z.number().int().min(0),
    deathsInChapter: z.number().int().min(0),
    visitedScenes: z.array(z.string().min(1)),
    unlockedEndings: z.array(z.string().min(1)),
    tutorialStepsSeen: z.array(z.string().min(1)),
    hubState: z
      .object({
        sceneId: z.string().min(1),
        picked: z.array(z.string().min(1)),
        remaining: z.number().int().min(0),
      })
      .strict()
      .nullable(),
    connections: z.array(PlayerConnectionSchema).default([]),
    updatedAt: z.number().int().nonnegative(),
  })
  .strict();
export type SaveState = z.infer<typeof SaveStateSchema>;
