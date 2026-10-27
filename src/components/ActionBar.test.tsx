import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionBar } from './ActionBar';
import { useGameStore } from '../store';

beforeEach(() => {
  useGameStore.getState().resetStore();
});

describe('ActionBar', () => {
  it('Блокнот → setOverlay("notebook")', () => {
    render(<ActionBar />);
    fireEvent.click(screen.getByText(/Блокнот/));
    expect(useGameStore.getState().overlay).toBe('notebook');
  });

  it('Схема → setOverlay("character_map")', () => {
    render(<ActionBar />);
    fireEvent.click(screen.getByText('Схема'));
    expect(useGameStore.getState().overlay).toBe('character_map');
  });

  it('Подсказки → setOverlay("hints")', () => {
    render(<ActionBar />);
    screen.getByText('Подсказки').click();
    expect(useGameStore.getState().overlay).toBe('hints');
  });

  it('Обвинить disabled без ch2_03 в visitedScenes', () => {
    render(<ActionBar />);
    expect(screen.getByText('Обвинить')).toBeDisabled();
  });

  it('Обвинить enabled с ch2_03', () => {
    useGameStore.setState({ visitedScenes: ['ch2_03'] });
    render(<ActionBar />);
    expect(screen.getByText('Обвинить')).not.toBeDisabled();
  });
});
