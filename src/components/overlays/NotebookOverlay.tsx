import { useGameStore } from '../../store';
import { CHARACTERS } from '../../data/characters';
import type { Note } from '../../schemas/note';
import type { NoteCategory } from '../../schemas/truthTable';
import { ModalFrame } from './ModalFrame';

const CATEGORY_LABELS: Record<NoteCategory, string> = {
  motive: 'Мотив',
  opportunity: 'Возможность',
  alibi: 'Алиби',
  psychology: 'Психология',
  contradiction: 'Противоречие',
};

const EVIDENCE_LABELS: Record<Note['evidenceType'], string> = {
  testimony: 'Показание',
  observation: 'Наблюдение',
  document: 'Документ',
};

function sourceName(note: Note): string {
  if (note.attributedTo === 'detective') return 'Пирогов';
  if (note.attributedTo === 'world') return 'Документ';
  const characters: Record<string, (typeof CHARACTERS)[keyof typeof CHARACTERS]> = CHARACTERS;
  return characters[note.attributedTo]?.name ?? note.attributedTo;
}

/** Блокнот: заметки по категориям. `truth` не отображается (ADR-006). */
export function NotebookOverlay() {
  const notes = useGameStore((s) => s.notes);
  const setOverlay = useGameStore((s) => s.setOverlay);

  const byCategory = new Map<NoteCategory, Note[]>();
  for (const n of notes) {
    const list = byCategory.get(n.category) ?? [];
    list.push(n);
    byCategory.set(n.category, list);
  }

  return (
    <ModalFrame title="Блокнот" onClose={() => setOverlay('none')}>
      {notes.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>
          Блокнот пуст. Тапайте по уликам в тексте, чтобы заносить их.
        </p>
      ) : (
        <div>
          {Array.from(byCategory.entries()).map(([cat, list]) => (
            <section key={cat} style={{ marginBottom: 'var(--spacing-md)' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--color-accent)' }}>
                {CATEGORY_LABELS[cat]} ({list.length})
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {list.map((n) => (
                  <li
                    key={n.id}
                    style={{
                      padding: 'var(--spacing-sm)',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <div>{n.statement}</div>
                    <div
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.75rem',
                        marginTop: 4,
                      }}
                    >
                      {sourceName(n)} · {EVIDENCE_LABELS[n.evidenceType]}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </ModalFrame>
  );
}
