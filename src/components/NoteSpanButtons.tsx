import { NOTE_MATRIX } from '../data/noteMatrix';
import { useGameStore } from '../store';

type NoteSpanButtonsProps = {
  noteSpanIds: string[];
};

/** Кнопки спанов под текстом: тап → addNoteFromSpan. Уже занесённые — disabled. */
export function NoteSpanButtons({ noteSpanIds }: NoteSpanButtonsProps) {
  const notes = useGameStore((s) => s.notes);
  const addNote = useGameStore((s) => s.addNoteFromSpan);
  const matrix: Record<string, typeof NOTE_MATRIX[keyof typeof NOTE_MATRIX]> = NOTE_MATRIX;

  if (noteSpanIds.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        marginTop: 'var(--spacing-md)',
      }}
    >
      {noteSpanIds.map((id) => {
        const span = matrix[id];
        if (!span) return null;
        const already = notes.some((n) => n.id === id);
        return (
          <button
            key={id}
            onClick={() => addNote(id)}
            disabled={already}
            style={{
              textAlign: 'left',
              fontSize: '0.875rem',
              borderStyle: 'dashed',
              opacity: already ? 0.6 : 1,
            }}
          >
            {already ? '✓ ' : '+ '}
            {span.statement}
          </button>
        );
      })}
    </div>
  );
}
