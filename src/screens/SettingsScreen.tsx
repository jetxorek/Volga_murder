import { useGameStore } from '../store';
import { AUDIO_ENABLED } from '../audio/config';

/** Настройки: звук, режим «Железный Пуаро», рестарт, сброс прогресса, назад. */
export function SettingsScreen() {
  const ironPoirot = useGameStore((s) => s.ironPoirot);
  const toggleIronPoirot = useGameStore((s) => s.toggleIronPoirot);
  const audioMuted = useGameStore((s) => s.audioMuted);
  const audioVolume = useGameStore((s) => s.audioVolume);
  const toggleAudioMute = useGameStore((s) => s.toggleAudioMute);
  const setAudioVolume = useGameStore((s) => s.setAudioVolume);
  const setScreen = useGameStore((s) => s.setScreen);
  const resetStore = useGameStore((s) => s.resetStore);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const currentScene = useGameStore((s) => s.currentScene);

  const onRestart = () => {
    if (window.confirm('Начать заново? Текущий прогресс будет потерян.')) {
      resetStore();
      startNewGame();
    }
  };

  const onResetProgress = () => {
    if (window.confirm('Сбросить весь прогресс?')) resetStore();
  };

  return (
    <div style={{ padding: 'var(--spacing-lg)', maxWidth: 560, margin: '0 auto' }}>
      <h1>Настройки</h1>

      {AUDIO_ENABLED ? (
        <section style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ fontSize: '1rem' }}>Звук</h2>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm) 0',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={!audioMuted}
              onChange={toggleAudioMute}
              aria-label="Звук включён"
            />
            <span>Звук включён</span>
          </label>
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm) 0',
              opacity: audioMuted ? 0.5 : 1,
            }}
          >
            <span>Громкость: {Math.round(audioVolume * 100)}%</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audioVolume}
              disabled={audioMuted}
              onChange={(e) => setAudioVolume(Number(e.target.value))}
              aria-label="Громкость"
            />
          </label>
        </section>
      ) : (
        <section style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ fontSize: '1rem' }}>Звук</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Звук отключён в этой сборке.</p>
        </section>
      )}

      <section style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1rem' }}>Режим игры</h2>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            padding: 'var(--spacing-sm) 0',
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
      </section>

      <section style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1rem' }}>Прогресс</h2>
        <button
          onClick={onRestart}
          disabled={!currentScene}
          style={{ width: '100%', marginBottom: 'var(--spacing-sm)' }}
        >
          Начать заново
        </button>
        <button
          onClick={onResetProgress}
          style={{
            width: '100%',
            borderColor: 'var(--color-danger)',
            color: 'var(--color-danger)',
          }}
        >
          Сбросить прогресс
        </button>
      </section>

      <button onClick={() => setScreen('main_menu')} style={{ width: '100%' }}>
        Назад
      </button>
    </div>
  );
}
