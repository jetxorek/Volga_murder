import { useGameStore } from '../../store';
import { ModalFrame } from './ModalFrame';

type HintType = 'greyCells' | 'memoryTheater' | 'snowWindow';

const HINTS: Array<{ type: HintType; label: string; question: string }> = [
  {
    type: 'greyCells',
    label: 'Серые клеточки',
    question: 'Пирогов задумывается: кто из пассажиров говорил меньше всех?',
  },
  {
    type: 'memoryTheater',
    label: 'Театр памяти',
    question: 'Пирогов вспоминает: кто выходил из каюты в ночь убийства?',
  },
  {
    type: 'snowWindow',
    label: 'Снег за окном',
    question:
      'Пирогов спрашивает себя: все ли категории обвинения вы покрыли — мотив, возможность, алиби, психологию, противоречие?',
  },
];

/** Оверлей подсказок: 3 типа, общий счётчик 3. */
export function HintsOverlay() {
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const ironPoirot = useGameStore((s) => s.ironPoirot);
  const useHint = useGameStore((s) => s.useHint);
  const setOverlay = useGameStore((s) => s.setOverlay);

  const totalUsed = hintsUsed.greyCells + hintsUsed.memoryTheater + hintsUsed.snowWindow;
  const totalLeft = 3 - totalUsed;
  const disabled = ironPoirot || totalLeft <= 0;

  return (
    <ModalFrame title="Подсказки" onClose={() => setOverlay('none')}>
      <p style={{ color: 'var(--color-text-muted)' }}>Осталось подсказок: {totalLeft} / 3</p>
      {ironPoirot && (
        <p style={{ color: 'var(--color-danger)' }}>
          В режиме «Железный Пуаро» подсказки недоступны.
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {HINTS.map((hint) => {
          const used = hintsUsed[hint.type] > 0;
          return (
            <div
              key={hint.type}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: 'var(--spacing-sm)',
              }}
            >
              <button
                onClick={() => useHint(hint.type)}
                disabled={disabled || used}
                style={{ width: '100%', textAlign: 'left' }}
              >
                {hint.label}
                {used ? ' ✓' : ''}
              </button>
              {used && (
                <p
                  style={{
                    margin: 'var(--spacing-sm) 0 0',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.875rem',
                  }}
                >
                  {hint.question}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </ModalFrame>
  );
}
