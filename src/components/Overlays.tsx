import { useGameStore } from '../store';
import { NotebookOverlay } from './overlays/NotebookOverlay';
import { CharacterCardOverlay } from './overlays/CharacterCardOverlay';
import { HintsOverlay } from './overlays/HintsOverlay';
import { DeathOverlay } from './overlays/DeathOverlay';
import { ChapterSummaryOverlay } from './overlays/ChapterSummaryOverlay';
import { CharacterMapOverlay } from './overlays/CharacterMapOverlay';

/** Роутер overlays: рендерит нужный по store.overlay. */
export function Overlays() {
  const overlay = useGameStore((s) => s.overlay);

  switch (overlay) {
    case 'none':
      return null;
    case 'notebook':
      return <NotebookOverlay />;
    case 'character_card':
      return <CharacterCardOverlay />;
    case 'character_map':
      return <CharacterMapOverlay />;
    case 'hints':
      return <HintsOverlay />;
    case 'death':
      return <DeathOverlay />;
    case 'chapter_summary':
      return <ChapterSummaryOverlay />;
  }
}
