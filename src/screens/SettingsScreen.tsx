import { useGameStore } from '../store';

/** Настройки: режим «Железный Пуаро», сброс прогресса, назад. */
export function SettingsScreen() {
  const ironPoirot = useGameStore((s) => s.ironPoirot);
  const toggleIronPoirot = useGameStore((s) => s.toggleIronPoirot);
  const setScreen = useGameStore((s) => s.setScreen);
  const resetStore = useGameStore((s) => s.resetStore);

  return (
    <div style={{ padding: 'var(--spacing-lg)', maxWidth: 560, margin: '0 auto' }}>
      <h1>Настройки</h1>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-sm) 0',
          borderBottom: '1px solid var(--color-border)',
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={ironPoirot}
          onChange={toggleIronPoirot}
          aria-label="Железный Пуаро"
        />
        <div>
          <div>Железный Пуаро</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
            Смерть откатывает к началу игры, подсказки отключены.
          </div>
        </div>
      </label>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-md)' }}>
        Настройки применяются сразу. После старта новой игры режим фиксируется на
        прохождение.
      </p>
      <button
        onClick={() => {
          if (window.confirm('Сбросить весь прогресс?')) resetStore();
        }}
        style={{
          width: '100%',
          borderColor: 'var(--color-danger)',
          color: 'var(--color-danger)',
        }}
      >
        Сбросить прогресс
      </button>
      <button
        onClick={() => setScreen('main_menu')}
        style={{ marginTop: 'var(--spacing-sm)', width: '100%' }}
      >
        Назад
      </button>
    </div>
  );
}
