import { useGameStore } from '../store';

/** Главное меню: новая игра, продолжить, настройки. */
export function MainMenuScreen() {
  const startNewGame = useGameStore((s) => s.startNewGame);
  const loadGame = useGameStore((s) => s.loadGame);
  const setScreen = useGameStore((s) => s.setScreen);
  const currentScene = useGameStore((s) => s.currentScene);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--spacing-lg)',
        gap: 'var(--spacing-md)',
      }}
    >
      <h1 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
        Смерть на Волге
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>
        Детектив по мотивам романа Агаты Кристи
      </p>
      <button onClick={startNewGame} style={{ minWidth: 240 }}>
        Новая игра
      </button>
      <button onClick={loadGame} disabled={!currentScene} style={{ minWidth: 240 }}>
        Продолжить
      </button>
      <button onClick={() => setScreen('how_to_play')} style={{ minWidth: 240 }}>
        Как играть
      </button>
      <button onClick={() => setScreen('library')} style={{ minWidth: 240 }}>
        Библиотека
      </button>
      <button onClick={() => setScreen('settings')} style={{ minWidth: 240 }}>
        Настройки
      </button>
    </div>
  );
}
