import type { Note, NoteSpan, NoteStrength } from '../schemas/note';
import type { TruthValue } from '../schemas/truthTable';
import { TRUTH_TABLE } from '../data/truthTable';
import { NOTE_MATRIX } from '../data/noteMatrix';
import { SCENE_GRAPH } from '../data/sceneGraph';

/**
 * Определяет силу заметки по правилам раздела 5.4 плейбука:
 * false → weak; contradiction+true → strong; fromRiskyScene → strong;
 * иначе strong, если парная target+category есть в другой сцене
 * с truth ∈ {true, plausible}; иначе weak.
 */
export function computeStrength(
  span: NoteSpan,
  truth: TruthValue,
  sourceScene: string,
  fromRiskyScene: boolean,
): NoteStrength {
  if (truth === 'false') return 'weak';
  if (span.category === 'contradiction' && truth === 'true') return 'strong';
  if (fromRiskyScene) return 'strong';
  if (hasOtherNoteInAnotherScene(span, sourceScene)) return 'strong';
  return 'weak';
}

/**
 * Ищет в SCENE_GRAPH другую сцену, где есть заметка с тем же
 * target+category (≠ span.id) и truth ∈ {true, plausible}.
 */
function hasOtherNoteInAnotherScene(span: NoteSpan, sourceScene: string): boolean {
  const noteMatrix: Record<string, NoteSpan> = NOTE_MATRIX;
  for (const [sceneId, scene] of Object.entries(SCENE_GRAPH)) {
    if (sceneId === sourceScene) continue;
    for (const node of Object.values(scene.nodes)) {
      if (!('noteSpans' in node) || !node.noteSpans) continue;
      for (const noteId of node.noteSpans) {
        if (noteId === span.id) continue;
        const other = noteMatrix[noteId];
        if (!other) continue;
        if (other.target !== span.target || other.category !== span.category) continue;
        const otherTruth = TRUTH_TABLE[other.target]?.[other.category]?.[other.truthKey];
        if (otherTruth === 'true' || otherTruth === 'plausible') return true;
      }
    }
  }
  return false;
}

/**
 * Создаёт Note из NoteSpan, вычисляя truth (из TRUTH_TABLE) и strength.
 * Если truthKey отсутствует в TRUTH_TABLE — fallback 'plausible'
 * (это защита от бага данных; dataValidation.test.ts должен ловить).
 */
export function createNote(
  span: NoteSpan,
  sourceScene: string,
  fromRiskyScene: boolean,
  createdAt: number,
): Note {
  const truth: TruthValue =
    TRUTH_TABLE[span.target]?.[span.category]?.[span.truthKey] ?? 'plausible';
  const strength = computeStrength(span, truth, sourceScene, fromRiskyScene);
  return {
    ...span,
    sourceScene,
    truth,
    strength,
    fromRiskyScene,
    createdAt,
  };
}

/**
 * Добавляет заметку в блокнот. Если заметка с таким ID уже есть —
 * возвращает исходный массив без изменений (иммутабельно).
 */
export function addNoteToList(notes: Note[], newNote: Note): Note[] {
  if (notes.some((n) => n.id === newNote.id)) return notes;
  return [...notes, newNote];
}
