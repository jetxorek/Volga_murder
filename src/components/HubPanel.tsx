import type { Scene } from '../schemas/scene';
import { SCENE_GRAPH } from '../data/sceneGraph';
import { useGameStore } from '../store';

type HubPanelProps = {
  scene: Scene;
};

/** Hub-панель: список опций (2 из N). Уже выбранные — disabled. */
export function HubPanel({ scene }: HubPanelProps) {
  const hubState = useGameStore((s) => s.hubState);
  const pickHubOptionAction = useGameStore((s) => s.pickHubOptionAction);
  const completeHub = useGameStore((s) => s.completeHub);
  const sceneGraph: Record<string, (typeof SCENE_GRAPH)[keyof typeof SCENE_GRAPH]> = SCENE_GRAPH;

  if (!scene.hubConfig) return null;

  const picked = hubState?.picked ?? [];
  const remaining = hubState?.remaining ?? scene.hubConfig.pick;
  const complete = remaining === 0;

  return (
    <div style={{ padding: 'var(--spacing-md)' }}>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>
        {complete ? 'Все дела сделаны.' : `Осталось дел: ${remaining}`}
      </p>
      {!complete && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {scene.hubConfig.options.map((optId) => {
            const isPicked = picked.includes(optId);
            const title = sceneGraph[optId]?.title ?? optId;
            return (
              <button
                key={optId}
                onClick={() => pickHubOptionAction(optId)}
                disabled={isPicked}
                style={{ textAlign: 'left', opacity: isPicked ? 0.5 : 1 }}
              >
                {isPicked ? '✓ ' : ''}
                {title}
              </button>
            );
          })}
        </div>
      )}
      {complete && (
        <button onClick={completeHub} style={{ marginTop: 'var(--spacing-md)', minWidth: 160 }}>
          Продолжить
        </button>
      )}
    </div>
  );
}
