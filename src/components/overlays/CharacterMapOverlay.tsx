import { useState } from 'react';
import { useGameStore } from '../../store';
import { CHARACTERS } from '../../data/characters';
import { Portrait } from '../Portrait';
import { ModalFrame } from './ModalFrame';
import { ConnectionDialog } from './ConnectionDialog';
import type { ConnectionType } from '../../schemas/connection';

const characters: Record<string, (typeof CHARACTERS)[keyof typeof CHARACTERS]> = CHARACTERS;

const CHAR_IDS = [
  'char_01',
  'char_02',
  'char_03',
  'char_04',
  'char_05',
  'char_06',
  'char_07',
  'char_08',
  'char_09',
  'char_10',
];

const CENTER_X = 400;
const CENTER_Y = 300;
const RADIUS = 200;

function getPos(index: number) {
  const angle = (index / CHAR_IDS.length) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER_X + RADIUS * Math.cos(angle),
    y: CENTER_Y + RADIUS * Math.sin(angle),
  };
}

const TYPE_LABELS: Record<ConnectionType, string> = {
  family: 'Родство',
  love: 'Любовь',
  service: 'Служба',
  debt: 'Долг',
  enmity: 'Вражда',
  other: 'Другое',
};

/** Схема персонажей: круг из 10 аватаров + линии связей. */
export function CharacterMapOverlay() {
  const connections = useGameStore((s) => s.connections);
  const addConnection = useGameStore((s) => s.addConnection);
  const removeConnection = useGameStore((s) => s.removeConnection);
  const setOverlay = useGameStore((s) => s.setOverlay);

  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [selectedB, setSelectedB] = useState<string | null>(null);

  const handleCharClick = (id: string) => {
    if (!selectedA) setSelectedA(id);
    else if (selectedA === id) setSelectedA(null);
    else if (!selectedB) setSelectedB(id);
  };

  const onConfirm = (type: ConnectionType) => {
    if (selectedA && selectedB) {
      addConnection(selectedA, selectedB, type);
      setSelectedA(null);
      setSelectedB(null);
    }
  };

  return (
    <ModalFrame title="Схема персонажей" onClose={() => setOverlay('none')}>
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: '0.875rem',
          marginTop: 0,
        }}
      >
        Выберите двух персонажей, чтобы связать их.
      </p>

      {/* SVG-граф */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 800 600"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          {connections.map((c) => {
            const fromIdx = CHAR_IDS.indexOf(c.from);
            const toIdx = CHAR_IDS.indexOf(c.to);
            if (fromIdx === -1 || toIdx === -1) return null;
            const p1 = getPos(fromIdx);
            const p2 = getPos(toIdx);
            return (
              <line
                key={c.id}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeDasharray="4"
              />
            );
          })}
        </svg>

        {/* Аватары */}
        {CHAR_IDS.map((id, i) => {
          const char = characters[id];
          const pos = getPos(i);
          const isSelected = selectedA === id || selectedB === id;
          return (
            <button
              key={id}
              onClick={() => handleCharClick(id)}
              aria-label={char.name}
              style={{
                position: 'absolute',
                left: `${(pos.x / 800) * 100}%`,
                top: `${(pos.y / 600) * 100}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: isSelected ? 'var(--color-bg-panel)' : 'transparent',
                border: isSelected ? '2px solid var(--color-accent)' : 'none',
                borderRadius: 'var(--radius)',
                padding: 4,
                cursor: 'pointer',
              }}
            >
              <Portrait portraitId={char.portraitId} size={40} />
              <span
                style={{
                  fontSize: '0.65rem',
                  marginTop: 4,
                  color: 'var(--color-text)',
                }}
              >
                {char.shortName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Диалог создания */}
      {selectedA && selectedB && (
        <ConnectionDialog
          fromId={selectedA}
          toId={selectedB}
          onConfirm={onConfirm}
          onCancel={() => {
            setSelectedA(null);
            setSelectedB(null);
          }}
        />
      )}

      {/* Список связей */}
      <div style={{ marginTop: 'var(--spacing-md)' }}>
        <h3 style={{ fontSize: '1rem' }}>Связи ({connections.length})</h3>
        {connections.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>Пока нет связей.</p>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {connections.map((c) => (
            <li
              key={c.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 'var(--spacing-sm) 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span>
                {characters[c.from]?.shortName} — {characters[c.to]?.shortName}{' '}
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                  ({TYPE_LABELS[c.type]})
                </span>
              </span>
              <button
                onClick={() => removeConnection(c.id)}
                aria-label={`Удалить связь: ${characters[c.from]?.shortName} — ${characters[c.to]?.shortName}`}
                style={{
                  padding: '2px 8px',
                  border: 'none',
                  color: 'var(--color-danger)',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </ModalFrame>
  );
}
