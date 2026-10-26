import { useGameStore } from '../store';
import type { AccusationOutcome } from '../schemas/accusation';

const OUTCOME_LABEL: Record<AccusationOutcome, string> = {
  fail: 'Провал',
  partial_low: 'Слабое',
  partial_high: 'Убедительное',
  full: 'Безупречное',
};

/** Финальный экран: итоги расследования. */
export function FinaleScreen() {
  const result = useGameStore((s) => s.lastAccusationResult);
  const notes = useGameStore((s) => s.notes);
  const deaths = useGameStore((s) => s.deaths);
  const setScreen = useGameStore((s) => s.setScreen);
  const resetStore = useGameStore((s) => s.resetStore);
  const startNewGame = useGameStore((s) => s.startNewGame);

  const onRestart = () => {
    resetStore();
    startNewGame();
  };

  return (
    <div style={{ padding: 'var(--spacing-lg)', maxWidth: 560, margin: '0 auto' }}>
      <h1>Расследование завершено</h1>
      <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
        «Время работает на правду.»
      </p>
      <section style={{ marginTop: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1rem' }}>Итоги</h2>
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 'var(--spacing-sm)',
          }}
        >
          <dt>Заметок в блокноте:</dt>
          <dd style={{ margin: 0 }}>{notes.length}</dd>
          <dt>Смертей:</dt>
          <dd style={{ margin: 0 }}>{deaths}</dd>
          <dt>Обвинение:</dt>
          <dd style={{ margin: 0 }}>{result ? OUTCOME_LABEL[result.outcome] : '—'}</dd>
          {result && (
            <>
              <dt>Очки:</dt>
              <dd style={{ margin: 0 }}>{result.score.toFixed(1)}</dd>
              <dt>Покрытие:</dt>
              <dd style={{ margin: 0 }}>{result.coverage} / 5</dd>
            </>
          )}
        </dl>
      </section>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
          marginTop: 'var(--spacing-lg)',
        }}
      >
        <button onClick={() => setScreen('main_menu')}>В главное меню</button>
        <button onClick={onRestart}>Начать заново</button>
      </div>
    </div>
  );
}
