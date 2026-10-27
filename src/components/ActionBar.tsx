import { useGameStore } from '../store';

/** Нижняя панель действий: Блокнот (N), Схема, Подсказки, Обвинить. */
export function ActionBar() {
  const setOverlay = useGameStore((s) => s.setOverlay);
  const setScreen = useGameStore((s) => s.setScreen);
  const visitedScenes = useGameStore((s) => s.visitedScenes);
  const notesCount = useGameStore((s) => s.notes.length);

  const accusationAvailable = visitedScenes.includes('ch2_03');

  return (
    <div
      role="toolbar"
      aria-label="Действия"
      style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        padding: 'var(--spacing-sm)',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-panel)',
      }}
    >
      <button
        onClick={() => setOverlay('notebook')}
        style={{ flex: 1, fontSize: '0.85rem', padding: '8px 4px' }}
      >
        Блокнот ({notesCount})
      </button>
      <button
        onClick={() => setOverlay('character_map')}
        style={{ flex: 1, fontSize: '0.85rem', padding: '8px 4px' }}
      >
        Схема
      </button>
      <button
        onClick={() => setOverlay('hints')}
        style={{ flex: 1, fontSize: '0.85rem', padding: '8px 4px' }}
      >
        Подсказки
      </button>
      <button
        onClick={() => setScreen('accusation')}
        disabled={!accusationAvailable}
        style={{ flex: 1, fontSize: '0.85rem', padding: '8px 4px' }}
      >
        Обвинить
      </button>
    </div>
  );
}
