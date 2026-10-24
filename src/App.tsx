import { useGameStore } from './store';
import { AudioProvider } from './audio/AudioProvider';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { SceneScreen } from './screens/SceneScreen';
import { AccusationScreen } from './screens/AccusationScreen';
import { AccusationResultScreen } from './screens/AccusationResultScreen';
import { FinaleScreen } from './screens/FinaleScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { Toast } from './components/Toast';
import { Overlays } from './components/Overlays';
import type { Screen } from './store';

/** Маршрутизация по screen. Остальные экраны — в P5b–P5d. */
export default function App() {
  const screen = useGameStore((s) => s.screen);

  return (
    <div className="app-root">
      <AudioProvider />
      {renderScreen(screen)}
      <Overlays />
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
      return <AccusationScreen />;
    case 'accusation_result':
      return <AccusationResultScreen />;
    case 'finale':
      return <FinaleScreen />;
    case 'settings':
      return <SettingsScreen />;
  }
}
