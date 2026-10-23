import { useEffect } from 'react';
import { useGameStore } from '../store';

/** Всплывающее уведомление. Автоматически скрывается через 3 секунды. */
export function Toast() {
  const toast = useGameStore((s) => s.toast);
  const setToast = useGameStore((s) => s.setToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast, setToast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: 'calc(var(--spacing-lg) + 64px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--color-bg-overlay)',
        border: '1px solid var(--color-accent)',
        color: 'var(--color-text)',
        padding: 'var(--spacing-sm) var(--spacing-md)',
        borderRadius: 'var(--radius)',
        maxWidth: '90%',
        fontSize: '0.875rem',
        zIndex: 100,
      }}
    >
      {toast}
    </div>
  );
}
