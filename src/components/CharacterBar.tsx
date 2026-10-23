import { CHARACTERS } from '../data/characters';
import type { Character } from '../schemas/character';
import { useGameStore } from '../store';
import { Portrait } from './Portrait';

/** Нижняя панель с портретами подозреваемых. Клик — открыть карточку (P5c). */
export function CharacterBar() {
  const setOverlay = useGameStore((s) => s.setOverlay);

  const suspects: Character[] = Object.values(CHARACTERS)
    .filter((c) => c.role === 'suspect' && c.barOrder >= 0)
    .sort((a, b) => a.barOrder - b.barOrder);

  if (suspects.length === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Персонажи"
      style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        overflowX: 'auto',
        padding: 'var(--spacing-sm)',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-panel)',
      }}
    >
      {suspects.map((c) => (
        <button
          key={c.id}
          onClick={() => {
            setOverlay('character_card');
            useGameStore.setState({ activeSpeaker: c.id });
          }}
          aria-label={c.name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 'none',
            background: 'transparent',
            padding: 0,
            minWidth: 56,
            color: 'var(--color-text-muted)',
            fontSize: '0.7rem',
          }}
        >
          <Portrait portraitId={c.portraitId} size={48} />
          <span style={{ marginTop: 4 }}>{c.shortName}</span>
        </button>
      ))}
    </div>
  );
}
