import { useGameStore } from '../store';
import { LIBRARY_ENTRIES, type LibraryEntry } from '../data/library';

/** Библиотека расследований: карточки игр (одна играбельна, остальные «Скоро»). */
export function LibraryScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const unlockedEndings = useGameStore((s) => s.unlockedEndings);
  const lastAccusationResult = useGameStore((s) => s.lastAccusationResult);

  const isPlayed = unlockedEndings.length > 0 || lastAccusationResult !== null;

  const onCardClick = (entry: LibraryEntry) => {
    if (entry.status === 'playable') {
      startNewGame();
    }
  };

  return (
    <div
      style={{
        padding: 'var(--spacing-lg)',
        maxWidth: 560,
        margin: '0 auto',
        lineHeight: 1.6,
      }}
    >
      <h1>Библиотека расследований</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        Коллекция дел Эрнеста Пирогова. Новые расследования — по мере выхода.
      </p>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
        }}
      >
        {LIBRARY_ENTRIES.map((entry) => (
          <li key={entry.id}>
            <button
              onClick={() => onCardClick(entry)}
              disabled={entry.status !== 'playable'}
              aria-label={entry.title}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: 'var(--spacing-md)',
                background: 'var(--color-bg-panel)',
                borderColor: 'var(--color-border)',
                opacity: entry.status === 'playable' ? 1 : 0.6,
                cursor: entry.status === 'playable' ? 'pointer' : 'default',
              }}
            >
              <span style={{ display: 'block', fontSize: '1.1rem' }}>{entry.title}</span>
              <span
                style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}
              >
                {entry.description}
              </span>
              <span
                style={{
                  display: 'block',
                  marginTop: 'var(--spacing-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--color-accent)',
                }}
              >
                {entry.status === 'playable'
                  ? isPlayed && entry.id === 'lib_volga'
                    ? 'Пройдено'
                    : 'Играть'
                  : 'Скоро'}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setScreen('main_menu')}
        style={{ width: '100%', marginTop: 'var(--spacing-lg)' }}
      >
        Назад
      </button>
    </div>
  );
}
