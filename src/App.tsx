import { useGameStore } from './store';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { SceneScreen } from './screens/SceneScreen';
import { Toast } from './components/Toast';
import type { Screen } from './store';

/** Маршрутизация по screen. Остальные экраны — в P5b–P5d. */
export default function App() {
  const screen = useGameStore((s) => s.screen);

  return (
    <div className="app-root">
      {renderScreen(screen)}
      <Toast />
    </div>
  );
}

function renderScreen(screen: Screen) {
  switch (screen) {
    case 'main_menu':
      return <MainMenuScreen />;
    case 'scene':
      return <SceneScreen />;
    case 'notebook':
      return <p style={{ padding: 'var(--spacing-lg)' }}>Notebook (P5c)</p>;
    case 'accusation':
      return <p style={{ padding: 'var(--spacing-lg)' }}>Accusation (P5d)</p>;
    case 'accusation_result':
      return <p style={{ padding: 'var(--spacing-lg)' }}>AccusationResult (P5d)</p>;
    case 'finale':
      return <p style={{ padding: 'var(--spacing-lg)' }}>Finale (P5d)</p>;
    case 'settings':
      return <p style={{ padding: 'var(--spacing-lg)' }}>Settings (P5d)</p>;
  }
}
