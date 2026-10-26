import { useState } from 'react';
import { useGameStore } from '../store';
import { CHARACTERS } from '../data/characters';
import { NOTE_MATRIX } from '../data/noteMatrix';
import type { Character } from '../schemas/character';
import type { NoteSpan } from '../schemas/note';

const MIN_NOTES = 3;
const MAX_NOTES = 12;
const MAX_ACCUSED = 12;

/** Экран обвинения: выбор обвиняемых и заметок. */
export function AccusationScreen() {
  const notes = useGameStore((s) => s.notes);
  const submitAccusation = useGameStore((s) => s.submitAccusation);

  const [accused, setAccused] = useState<Set<string>>(new Set());
  const [pickedNotes, setPickedNotes] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, id: string): Set<string> => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  const characters: Record<string, (typeof CHARACTERS)[keyof typeof CHARACTERS]> = CHARACTERS;
  const suspects: Character[] = Object.values(characters)
    .filter((c) => c.isAccusable)
    .sort((a, b) => a.barOrder - b.barOrder);

  const noteMatrix: Record<string, (typeof NOTE_MATRIX)[keyof typeof NOTE_MATRIX]> = NOTE_MATRIX;
  const selectableNotes: NoteSpan[] = notes
    .map((n) => noteMatrix[n.id])
    .filter((s: NoteSpan | undefined): s is NoteSpan => s !== undefined)
    .filter((s) => s.target !== 'hint' && s.target !== 'victim');

  const canSubmit =
    accused.size >= 1 &&
    accused.size <= MAX_ACCUSED &&
    pickedNotes.size >= MIN_NOTES &&
    pickedNotes.size <= MAX_NOTES;

  const onSubmit = () => {
    if (!canSubmit) return;
    submitAccusation(Array.from(accused), Array.from(pickedNotes));
  };

  return (
    <div style={{ padding: 'var(--spacing-lg)', maxWidth: 640, margin: '0 auto' }}>
      <h1>Обвинение</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        Назовите виновных и обоснуйте обвинение заметками. Минимум {MIN_NOTES} заметки, обвиняемых —
        от 1.
      </p>

      <section style={{ marginTop: 'var(--spacing-md)' }}>
        <h2 style={{ fontSize: '1.125rem' }}>
          Обвиняемые ({accused.size} / {MAX_ACCUSED})
        </h2>
        {suspects.map((c) => (
          <label
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm)',
              borderBottom: '1px solid var(--color-border)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={accused.has(c.id)}
              onChange={() => setAccused(toggle(accused, c.id))}
              aria-label={c.name}
            />
            <span>{c.name}</span>
          </label>
        ))}
      </section>

      <section style={{ marginTop: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1.125rem' }}>
          Заметки ({pickedNotes.size} / {MAX_NOTES}, минимум {MIN_NOTES})
        </h2>
        {selectableNotes.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>Нет заметок в блокноте.</p>
        )}
        {selectableNotes.map((span) => (
          <label
            key={span.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm)',
              borderBottom: '1px solid var(--color-border)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={pickedNotes.has(span.id)}
              onChange={() => setPickedNotes(toggle(pickedNotes, span.id))}
              aria-label={span.statement}
            />
            <div style={{ flex: 1 }}>
              <div>{span.statement}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                {span.category}
              </div>
            </div>
          </label>
        ))}
      </section>

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        style={{ marginTop: 'var(--spacing-lg)', width: '100%' }}
      >
        Обвинить
      </button>
    </div>
  );
}
