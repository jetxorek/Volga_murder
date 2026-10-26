import { SCENE_GRAPH } from '../data/sceneGraph';
import type { SceneNode } from '../schemas/scene';
import { useGameStore } from '../store';
import { BackgroundImage } from '../components/BackgroundImage';
import { CharacterBar } from '../components/CharacterBar';
import { ActionBar } from '../components/ActionBar';
import { TextPanel } from '../components/TextPanel';
import { ChoiceList } from '../components/ChoiceList';
import { HubPanel } from '../components/HubPanel';

/** Главный экран сцены. */
export function SceneScreen() {
  const currentScene = useGameStore((s) => s.currentScene);
  const currentNode = useGameStore((s) => s.currentNode);
  const sceneGraph: Record<string, (typeof SCENE_GRAPH)[keyof typeof SCENE_GRAPH]> = SCENE_GRAPH;

  const scene = sceneGraph[currentScene];
  if (!scene) {
    return <p style={{ padding: 'var(--spacing-lg)' }}>Сцена не найдена: {currentScene}</p>;
  }
  const nodes: Record<string, SceneNode> = scene.nodes;
  const node = nodes[currentNode];
  if (!node) {
    return <p style={{ padding: 'var(--spacing-lg)' }}>Узел не найден: {currentNode}</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <BackgroundImage backgroundId={scene.background} />
      <h2 style={{ padding: 'var(--spacing-md) var(--spacing-md) 0' }}>{scene.title}</h2>
      <div style={{ flex: 1 }}>{renderNode()}</div>
      <ActionBar />
      <CharacterBar />
    </div>
  );

  function renderNode() {
    if (node.type === 'narration' && 'hubConfig' in scene && scene.hubConfig) {
      return <HubPanel scene={scene} />;
    }
    if (node.type === 'narration' || node.type === 'dialogue') {
      return <TextPanel node={node} />;
    }
    if (node.type === 'choice') {
      return <ChoiceList options={node.options} />;
    }
    if (node.type === 'check') {
      return (
        <div style={{ padding: 'var(--spacing-md)' }}>
          <button onClick={useGameStore.getState().advance} style={{ minWidth: 160 }}>
            Продолжить
          </button>
        </div>
      );
    }
    if (node.type === 'end') {
      return (
        <div style={{ padding: 'var(--spacing-md)' }}>
          <button onClick={useGameStore.getState().advance} style={{ minWidth: 160 }}>
            Продолжить
          </button>
        </div>
      );
    }
    return null;
  }
}
