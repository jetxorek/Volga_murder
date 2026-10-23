/** Заглушка, если ассет не найден. */
type PlaceholderProps = {
  label: string;
  aspect?: 'square' | 'wide' | 'tall';
  className?: string;
};

const aspectStyle: Record<NonNullable<PlaceholderProps['aspect']>, string> = {
  square: '1 / 1',
  wide: '16 / 9',
  tall: '3 / 4',
};

export function Placeholder({ label, aspect = 'square', className }: PlaceholderProps) {
  return (
    <div
      className={className}
      style={{
        aspectRatio: aspectStyle[aspect],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-panel)',
        border: '1px dashed var(--color-border)',
        color: 'var(--color-text-muted)',
        fontSize: '0.75rem',
        textAlign: 'center',
        padding: 'var(--spacing-sm)',
      }}
    >
      {label}
    </div>
  );
}
