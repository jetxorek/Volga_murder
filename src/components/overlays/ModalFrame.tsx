import type { ReactNode } from 'react';

type ModalFrameProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** Общий каркас модалки: fixed-фон, панель, заголовок, крестик. */
export function ModalFrame({ title, onClose, children }: ModalFrameProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-bg-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 'var(--spacing-md)',
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-panel)',
          border: '1px solid var(--color-accent)',
          borderRadius: 'var(--radius)',
          padding: 'var(--spacing-lg)',
          maxWidth: 560,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} aria-label="Закрыть" style={{ minWidth: 44 }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
