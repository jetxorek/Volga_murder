import { useGameStore } from '../../store';
import { ModalFrame } from './ModalFrame';

/** Сводка главы: сколько заметок, куда идти. */
export function ChapterSummaryOverlay() {
  const chapter = useGameStore((s) => s.chapter);
  const notes = useGameStore((s) => s.notes);
  const pendingNextScene = useGameStore((s) => s.pendingNextScene);
  const enterSceneById = useGameStore((s) => s.enterSceneById);
  const setOverlay = useGameStore((s) => s.setOverlay);

  const onContinue = () => {
    setOverlay('none');
    if (pendingNextScene) {
      enterSceneById(pendingNextScene);
    }
  };

  return (
    <ModalFrame title={`Глава ${chapter} завершена`} onClose={onContinue}>
      <p>Заметок в блокноте: {notes.length}</p>
      <p style={{ color: 'var(--color-text-muted)' }}>Следующая глава ждёт.</p>
      <button onClick={onContinue} style={{ marginTop: 'var(--spacing-md)', minWidth: 160 }}>
        Продолжить
      </button>
    </ModalFrame>
  );
}
