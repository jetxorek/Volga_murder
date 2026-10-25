import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProceduralBackground } from './ProceduralBackground';
import { BackgroundImage } from './BackgroundImage';

describe('ProceduralBackground', () => {
  it('рендерит <svg> с data-testid по backgroundId', () => {
    render(<ProceduralBackground backgroundId="bg_embankment" />);
    expect(screen.getByTestId('procedural-bg_embankment')).toBeInTheDocument();
  });

  it('неизвестный id → нейтральный SVG, не падает', () => {
    render(<ProceduralBackground backgroundId="bg_unknown_xyz" />);
    expect(screen.getByTestId('procedural-bg_unknown_xyz')).toBeInTheDocument();
  });

  it('svg имеет viewBox 0 0 800 450', () => {
    const { container } = render(<ProceduralBackground backgroundId="bg_salon" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 800 450');
  });

  it('все 19 фонов рендерятся без ошибок', () => {
    const ids = [
      'bg_embankment', 'bg_pier', 'bg_deck_evening', 'bg_deck_night',
      'bg_salon', 'bg_salon_night', 'bg_salon_day',
      'bg_cabin_simon', 'bg_cabin_lina', 'bg_cabin_jeanne',
      'bg_cabin_vanskaya', 'bg_cabin_louise', 'bg_cabin_otterborn',
      'bg_infirmary', 'bg_deck_day', 'bg_corridor', 'bg_court',
      'bg_office', 'bg_credits',
    ];
    for (const id of ids) {
      const { unmount } = render(<ProceduralBackground backgroundId={id} />);
      expect(screen.getByTestId(`procedural-${id}`)).toBeInTheDocument();
      unmount();
    }
  });
});

describe('BackgroundImage', () => {
  it('нет ассета → рендерит ProceduralBackground (svg)', () => {
    const { container } = render(<BackgroundImage backgroundId="bg_embankment" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByTestId('procedural-bg_embankment')).toBeInTheDocument();
  });
});
