import { useGameStore } from '../../store';
import { ModalFrame } from './ModalFrame';

/** Экран смерти: объяснение, кнопка «Продолжить» → откат (P4c). */
export function DeathOverlay() {
  const deathContext = useGameStore((s) => s.deathContext);
  const ironPoirot = useGameStore((s) => s.ironPoirot);
  const dismissDeath = useGameStore((s) => s.dismissDeath);

  const message = ironPoirot
    ? 'В режиме «Железный Пуаро» смерть откатывает к началу игры.'
    : 'Пирогов погиб. Придётся начать главу заново.';

  return (
    <ModalFrame title="Смерть" onClose={dismissDeath}>
      <p style={{ fontSize: '1.125rem' }}>{message}</p>
      {deathContext && <p style={{ color: 'var(--color-text-muted)' }}>Место: {deathContext}</p>}
      <button onClick={dismissDeath} style={{ marginTop: 'var(--spacing-md)', minWidth: 160 }}>
        Продолжить
      </button>
    </ModalFrame>
  );
}
