import { useGameStore } from '../store';

/** Нижняя панель действий: Блокнот, Подсказки, Обвинить. */
export function ActionBar() {
  const setOverlay = useGameStore((s) => s.setOverlay);
  const setScreen = useGameStore((s) => s.setScreen);
  const visitedScenes = useGameStore((s) => s.visitedScenes);

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
      <button onClick={() => setOverlay('notebook')} style={{ flex: 1 }}>
        Блокнот
      </button>
      <button onClick={() => setOverlay('hints')} style={{ flex: 1 }}>
        Подсказки
      </button>
      <button
        onClick={() => setScreen('accusation')}
        disabled={!accusationAvailable}
        style={{ flex: 1 }}
      >
        Обвинить
      </button>
    </div>
  );
}
