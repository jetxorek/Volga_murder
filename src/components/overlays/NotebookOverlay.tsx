import { useState } from 'react';
import { useGameStore } from '../../store';
import { CHARACTERS, NOTE_MATRIX, TRUTH_TABLE } from '../../data';
import type { Note, NoteSpan } from '../../schemas/note';
import type { NoteCategory } from '../../schemas/truthTable';
import { computeStrength } from '../../engine/noteOps';
import { ModalFrame } from './ModalFrame';

type ViewMode = 'category' | 'character';

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

// Знаменатель счётчика: число потенциально ключевых улик (truth === 'true'
// и strong при нейтральном fromRiskyScene — та же функция, что использует
// движок при создании заметки). Считается из данных, не хардкодится.
const truthTable: Record<string, Record<string, Record<string, string>>> = TRUTH_TABLE;
const noteMatrix: Record<string, NoteSpan> = NOTE_MATRIX;

function isSpanPotentiallyKey(span: NoteSpan): boolean {
  const truth = truthTable[span.target]?.[span.category]?.[span.truthKey] ?? 'plausible';
  return truth === 'true' && computeStrength(span, truth, span.id, false) === 'strong';
}

const TOTAL_KEY_NOTES = Object.values(noteMatrix).filter(isSpanPotentiallyKey).length;

function isKeyNote(note: Note): boolean {
  return note.strength === 'strong' && note.truth === 'true';
}

function targetName(target: string): string {
  const characters: Record<string, (typeof CHARACTERS)[keyof typeof CHARACTERS]> = CHARACTERS;
  if (target === 'group') return 'Экипаж и пассажиры';
  if (target === 'victim') return 'Жертвы';
  return characters[target]?.name ?? target;
}

function sourceName(note: Note): string {
  if (note.attributedTo === 'detective') return 'Пирогов';
  if (note.attributedTo === 'world') return 'Документ';
  const characters: Record<string, (typeof CHARACTERS)[keyof typeof CHARACTERS]> = CHARACTERS;
  return characters[note.attributedTo]?.name ?? note.attributedTo;
}

function NoteItem({ note }: { note: Note }) {
  const toggleNoteImportant = useGameStore((s) => s.toggleNoteImportant);
  const toggleNoteDiscarded = useGameStore((s) => s.toggleNoteDiscarded);

  const actionButtonStyle = {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    background: 'transparent',
    color: 'var(--color-text)',
    cursor: 'pointer',
    padding: '2px 8px',
    fontSize: '0.85rem',
  };

  return (
    <li
      style={{
        padding: 'var(--spacing-sm)',
        borderBottom: '1px solid var(--color-border)',
        opacity: note.discarded ? 0.5 : 1,
      }}
    >
      <div>{note.statement}</div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          marginTop: 4,
        }}
      >
        <div
          style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.75rem',
          }}
        >
          {sourceName(note)} · {EVIDENCE_LABELS[note.evidenceType]}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {note.isPersonal !== true && (
            <>
              <button
                onClick={() => toggleNoteImportant(note.id)}
                aria-label={note.important ? 'Снять метку важного' : 'Отметить как важное'}
                aria-pressed={note.important === true}
                style={actionButtonStyle}
              >
                {note.important ? '★' : '☆'}
              </button>
              <button
                onClick={() => toggleNoteDiscarded(note.id)}
                aria-label={note.discarded ? 'Вернуть из отброшенных' : 'Отбросить заметку'}
                aria-pressed={note.discarded === true}
                style={actionButtonStyle}
              >
                {note.discarded ? '↩' : '✕'}
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

/** Блокнот: переключатель «По категориям / По персонажам» + счётчик ключевых улик (ADR-030). `truth` не отображается (ADR-006). */
export function NotebookOverlay() {
  const notes = useGameStore((s) => s.notes);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const addPersonalNote = useGameStore((s) => s.addPersonalNote);
  const [viewMode, setViewMode] = useState<ViewMode>('category');
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState('');

  const onSubmitPersonal = () => {
    const trimmed = inputText.trim();
    if (trimmed.length < 5) return;
    addPersonalNote(trimmed);
    setInputText('');
    setShowInput(false);
  };

  const keyFound = notes.filter(isKeyNote).length;

  const grouped = new Map<string, Note[]>();
  const headings = new Map<string, string>();
  for (const n of notes) {
    const groupKey = viewMode === 'category' ? n.category : n.target;
    const list = grouped.get(groupKey) ?? [];
    list.push(n);
    grouped.set(groupKey, list);
    headings.set(
      groupKey,
      viewMode === 'category' ? CATEGORY_LABELS[n.category] : targetName(n.target),
    );
  }

  const modeButtonStyle = (active: boolean) => ({
    flex: 1,
    fontSize: '0.85rem',
    background: active ? 'var(--color-bg-panel)' : 'transparent',
    border: active ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
    cursor: 'pointer',
    padding: '4px 8px',
  });

  return (
    <ModalFrame title="Блокнот" onClose={() => setOverlay('none')}>
      <div
        role="group"
        aria-label="Режим группировки"
        style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}
      >
        <button
          onClick={() => setViewMode('category')}
          aria-pressed={viewMode === 'category'}
          style={modeButtonStyle(viewMode === 'category')}
        >
          По категориям
        </button>
        <button
          onClick={() => setViewMode('character')}
          aria-pressed={viewMode === 'character'}
          style={modeButtonStyle(viewMode === 'character')}
        >
          По персонажам
        </button>
      </div>

      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: '0.875rem',
          margin: '0 0 var(--spacing-md)',
        }}
      >
        Ключевых улик: {keyFound} из {TOTAL_KEY_NOTES}
      </p>

      {notes.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>
          Блокнот пуст. Тапайте по уликам в тексте, чтобы заносить их.
        </p>
      ) : (
        <div>
          {Array.from(grouped.entries()).map(([groupKey, list]) => (
            <section key={groupKey} style={{ marginBottom: 'var(--spacing-md)' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--color-accent)' }}>
                {headings.get(groupKey)} ({list.length})
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {list.map((n) => (
                  <NoteItem key={n.id} note={n} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 'var(--spacing-lg)',
          paddingTop: 'var(--spacing-sm)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            style={{ width: '100%', borderStyle: 'dashed' }}
          >
            + Добавить вручную
          </button>
        ) : (
          <div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ваша мысль о расследовании…"
              maxLength={280}
              rows={3}
              style={{
                width: '100%',
                padding: 'var(--spacing-sm)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                resize: 'vertical',
              }}
            />
            <div
              style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}
            >
              <button
                onClick={onSubmitPersonal}
                disabled={inputText.trim().length < 5}
                style={{ flex: 1 }}
              >
                Добавить
              </button>
              <button
                onClick={() => {
                  setInputText('');
                  setShowInput(false);
                }}
                style={{ flex: 1, borderColor: 'var(--color-border)' }}
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalFrame>
  );
}
