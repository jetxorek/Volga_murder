import { useGameStore } from '../../store';
import { CHARACTERS } from '../../data/characters';
import { Portrait } from '../Portrait';
import { ModalFrame } from './ModalFrame';

/** Карточка персонажа. Открывается по клику в CharacterBar. */
export function CharacterCardOverlay() {
  const activeSpeaker = useGameStore((s) => s.activeSpeaker);
  const setOverlay = useGameStore((s) => s.setOverlay);

  const characters: Record<string, (typeof CHARACTERS)[keyof typeof CHARACTERS]> = CHARACTERS;
  const character = activeSpeaker ? characters[activeSpeaker] : undefined;

  if (!character) {
    return (
      <ModalFrame title="Персонаж" onClose={() => setOverlay('none')}>
        <p>Персонаж не выбран.</p>
      </ModalFrame>
    );
  }

  return (
    <ModalFrame title={character.name} onClose={() => setOverlay('none')}>
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
        <Portrait portraitId={character.portraitId} size={96} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0 }}>{character.appearance}</p>
        </div>
      </div>
      <section style={{ marginBottom: 'var(--spacing-md)' }}>
        <h3 style={{ fontSize: '1rem' }}>Манера говорить</h3>
        <p style={{ margin: 0 }}>{character.speech.register}</p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          {character.speech.rhythm}
        </p>
      </section>
      <section style={{ marginBottom: 'var(--spacing-md)' }}>
        <h3 style={{ fontSize: '1rem' }}>Поведение</h3>
        <p style={{ margin: 0 }}>{character.behaviorModel.baseline}</p>
      </section>
      <section>
        <h3 style={{ fontSize: '1rem' }}>Связи</h3>
        <ul style={{ margin: 0, paddingLeft: 'var(--spacing-md)' }}>
          {character.relationships.map((rel) => (
            <li key={rel.targetId} style={{ marginBottom: 4 }}>
              <strong>{characters[rel.targetId]?.name ?? rel.targetId}:</strong> {rel.description}
            </li>
          ))}
        </ul>
      </section>
    </ModalFrame>
  );
}
