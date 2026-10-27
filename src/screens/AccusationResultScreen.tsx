import { useState } from 'react';
import { useGameStore } from '../store';
import { NOTE_MATRIX } from '../data/noteMatrix';
import { TRUTH_TABLE } from '../data/truthTable';
import { computeStrength } from '../engine/noteOps';
import type { NoteSpan } from '../schemas/note';
import type { AccusationOutcome } from '../schemas/accusation';
import type { NoteCategory } from '../schemas/truthTable';

const OUTCOME_LABEL: Record<AccusationOutcome, string> = {
  fail: 'Обвинение провалено',
  partial_low: 'Слабое обвинение',
  partial_high: 'Убедительное обвинение',
  full: 'Полное обвинение',
};

const OUTCOME_DESCRIPTION: Record<AccusationOutcome, string> = {
  fail: 'Пирогов понимает: этого недостаточно. Но разоблачение всё равно состоится.',
  partial_low: 'Часть правды установлена. Но Пирогов чувствует — не всё.',
  partial_high: 'Почти всё сложилось. Осталась пара деталей.',
  full: 'Пирогов знает всё. Обвинение безупречно.',
};

const CATEGORY_LABEL: Record<NoteCategory, string> = {
  motive: 'Мотив',
  opportunity: 'Возможность',
  alibi: 'Алиби',
  psychology: 'Психология',
  contradiction: 'Противоречие',
};

const PIROGOV_THOUGHTS = [
  '1. Мотив был на поверхности — деньги и свобода.',
  '2. Но решающим стало не это, а инсценировка: выстрел, который ничего не значил.',
  '3. И тот, кто молчал громче всех, на самом деле всё знал.',
  '4. Второй пистолет. Вот что связало всё воедино.',
];

/**
 * Ключевая улика: truth === 'true' и strength === 'strong'
 * (strength считается движком через computeStrength).
 */
function isKeySpan(span: NoteSpan): boolean {
  const truth = TRUTH_TABLE[span.target]?.[span.category]?.[span.truthKey];
  return truth === 'true' && computeStrength(span, 'true', span.id, false) === 'strong';
}

/** Экран результата обвинения с расширенным разбором упущенных улик. */
export function AccusationResultScreen() {
  const result = useGameStore((s) => s.lastAccusationResult);
  const enterSceneById = useGameStore((s) => s.enterSceneById);
  const [showMissed, setShowMissed] = useState(false);

  if (!result) {
    return (
      <div style={{ padding: 'var(--spacing-lg)' }}>
        <p>Результат обвинения недоступен.</p>
        <button onClick={() => enterSceneById('ch5_01')}>Продолжить</button>
      </div>
    );
  }

  const allKeyNotes = Object.entries(NOTE_MATRIX).filter(([, span]) => isKeySpan(span));
  const submittedSet = new Set(result.submittedNoteIds);
  const missedKeyNotes = allKeyNotes.filter(([id]) => !submittedSet.has(id));
  const foundCount = allKeyNotes.length - missedKeyNotes.length;

  return (
    <div style={{ padding: 'var(--spacing-lg)', maxWidth: 560, margin: '0 auto' }}>
      <h1>{OUTCOME_LABEL[result.outcome]}</h1>
      <p
        style={{
          fontStyle: 'italic',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        {OUTCOME_DESCRIPTION[result.outcome]}
      </p>

      <section
        style={{
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          background: 'var(--color-bg-panel)',
          borderRadius: 'var(--radius)',
        }}
      >
        <h2 style={{ fontSize: '1.125rem', marginTop: 0 }}>Работа над ошибками</h2>
        <p style={{ fontSize: '1.05rem' }}>
          Вы нашли <strong>{foundCount}</strong> из <strong>{allKeyNotes.length}</strong> ключевых
          улик.
        </p>

        {missedKeyNotes.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <button
              onClick={() => setShowMissed(!showMissed)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--color-accent)',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              {showMissed
                ? 'Скрыть упущенные улики'
                : `Показать упущенные (${missedKeyNotes.length})`}
            </button>

            {showMissed && (
              <ul
                style={{
                  paddingLeft: 'var(--spacing-md)',
                  marginTop: 'var(--spacing-sm)',
                  fontSize: '0.9rem',
                }}
              >
                {missedKeyNotes.map(([, span]) => (
                  <li key={span.id} style={{ marginBottom: '4px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      [{CATEGORY_LABEL[span.category]}]
                    </span>{' '}
                    {span.statement}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1.125rem' }}>Как думал Пирогов</h2>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
          {PIROGOV_THOUGHTS.map((thought) => (
            <p key={thought} style={{ margin: '0 0 var(--spacing-sm)' }}>
              {thought}
            </p>
          ))}
        </div>
      </section>

      {result.missingCategories.length > 0 && (
        <section style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ fontSize: '1rem' }}>Не покрыты категории:</h2>
          <ul style={{ fontSize: '0.9rem' }}>
            {result.missingCategories.map((c) => (
              <li key={c}>{CATEGORY_LABEL[c]}</li>
            ))}
          </ul>
        </section>
      )}

      <button
        onClick={() => enterSceneById('ch5_01')}
        style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
      >
        Продолжить
      </button>
    </div>
  );
}
