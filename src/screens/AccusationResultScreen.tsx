import { useGameStore } from '../store';
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

/** Экран результата обвинения. */
export function AccusationResultScreen() {
  const result = useGameStore((s) => s.lastAccusationResult);
  const enterSceneById = useGameStore((s) => s.enterSceneById);

  if (!result) {
    return (
      <div style={{ padding: 'var(--spacing-lg)' }}>
        <p>Результат обвинения недоступен.</p>
        <button onClick={() => enterSceneById('ch5_01')}>Продолжить</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-lg)', maxWidth: 560, margin: '0 auto' }}>
      <h1>{OUTCOME_LABEL[result.outcome]}</h1>
      <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
        {OUTCOME_DESCRIPTION[result.outcome]}
      </p>
      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 'var(--spacing-sm)',
          marginTop: 'var(--spacing-lg)',
        }}
      >
        <dt>Очки:</dt>
        <dd style={{ margin: 0 }}>{result.score.toFixed(1)}</dd>
        <dt>Покрытие категорий:</dt>
        <dd style={{ margin: 0 }}>{result.coverage} / 5</dd>
        <dt>Верных заметок:</dt>
        <dd style={{ margin: 0 }}>{result.validCount}</dd>
        <dt>Сильных заметок:</dt>
        <dd style={{ margin: 0 }}>{result.strongCount}</dd>
        <dt>Штраф за противоречия:</dt>
        <dd style={{ margin: 0 }}>{result.contradictionPenalty}</dd>
        <dt>Обвиняемых:</dt>
        <dd style={{ margin: 0 }}>{result.accusedCount}</dd>
      </dl>
      {result.missingCategories.length > 0 && (
        <section style={{ marginTop: 'var(--spacing-lg)' }}>
          <h2 style={{ fontSize: '1rem' }}>Не покрыты категории:</h2>
          <ul>
            {result.missingCategories.map((c) => (
              <li key={c}>{CATEGORY_LABEL[c]}</li>
            ))}
          </ul>
        </section>
      )}
      <button
        onClick={() => enterSceneById('ch5_01')}
        style={{ marginTop: 'var(--spacing-lg)', width: '100%' }}
      >
        Продолжить
      </button>
    </div>
  );
}
