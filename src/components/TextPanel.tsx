import type { SceneNode } from '../schemas/scene';
import { CHARACTERS } from '../data/characters';
import { useGameStore } from '../store';
import { NoteSpanButtons } from './NoteSpanButtons';

type TextPanelProps = {
  node: Extract<SceneNode, { type: 'narration' | 'dialogue' }>;
};

/** Текст узла (narration/dialogue) + кнопки спанов + «Продолжить». */
export function TextPanel({ node }: TextPanelProps) {
  const advance = useGameStore((s) => s.advance);
  const characters: Record<string, (typeof CHARACTERS)[keyof typeof CHARACTERS]> = CHARACTERS;

  return (
    <div style={{ padding: 'var(--spacing-md)' }}>
      {node.type === 'dialogue' && (
        <p style={{ color: 'var(--color-accent)', margin: '0 0 var(--spacing-sm) 0' }}>
          {characters[node.speaker]?.name ?? node.speaker}
        </p>
      )}
      <p style={{ fontSize: '1rem', lineHeight: 1.6 }}>{node.text}</p>
      <NoteSpanButtons noteSpanIds={node.noteSpans ?? []} />
      <button onClick={advance} style={{ marginTop: 'var(--spacing-md)', minWidth: 160 }}>
        Продолжить
      </button>
    </div>
  );
}
