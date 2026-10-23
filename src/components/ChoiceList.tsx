import type { ChoiceOption } from '../schemas/effects';
import { useGameStore } from '../store';

type ChoiceListProps = {
  options: ChoiceOption[];
};

/** Список опций выбора. Тап → chooseOption. */
export function ChoiceList({ options }: ChoiceListProps) {
  const chooseOption = useGameStore((s) => s.chooseOption);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', padding: 'var(--spacing-md)' }}>
      {options.map((opt) => (
        <button key={opt.id} onClick={() => chooseOption(opt.id)} style={{ textAlign: 'left' }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
