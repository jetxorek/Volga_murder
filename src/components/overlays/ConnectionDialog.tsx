import { useState } from 'react';
import type { ConnectionType } from '../../schemas/connection';
import { ConnectionTypeSchema } from '../../schemas/connection';
import { CHARACTERS } from '../../data/characters';

const characters: Record<string, (typeof CHARACTERS)[keyof typeof CHARACTERS]> = CHARACTERS;

type ConnectionDialogProps = {
  fromId: string;
  toId: string;
  onConfirm: (type: ConnectionType) => void;
  onCancel: () => void;
};

const TYPE_LABELS: Record<ConnectionType, string> = {
  family: 'Родство',
  love: 'Любовь',
  service: 'Служба',
  debt: 'Долг',
  enmity: 'Вражда',
  other: 'Другое',
};

/** Диалог выбора типа связи между двумя персонажами. */
export function ConnectionDialog({ fromId, toId, onConfirm, onCancel }: ConnectionDialogProps) {
  const [type, setType] = useState<ConnectionType>('other');
  const fromName = characters[fromId]?.shortName ?? fromId;
  const toName = characters[toId]?.shortName ?? toId;

  return (
    <div
      style={{
        marginTop: 'var(--spacing-md)',
        padding: 'var(--spacing-sm)',
        border: '1px solid var(--color-border)',
      }}
    >
      <p style={{ margin: '0 0 var(--spacing-sm)' }}>
        Связь: <strong>{fromName}</strong> — <strong>{toName}</strong>
      </p>
      <select
        value={type}
        onChange={(e) => {
          const parsed = ConnectionTypeSchema.safeParse(e.target.value);
          if (parsed.success) setType(parsed.data);
        }}
        style={{
          width: '100%',
          padding: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-sm)',
        }}
        aria-label="Тип связи"
      >
        {Object.entries(TYPE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
        <button onClick={() => onConfirm(type)} style={{ flex: 1 }}>
          Связать
        </button>
        <button onClick={onCancel} style={{ flex: 1, borderColor: 'var(--color-border)' }}>
          Отмена
        </button>
      </div>
    </div>
  );
}
