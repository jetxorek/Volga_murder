import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HowToPlayScreen } from './HowToPlayScreen';
import { useGameStore } from '../store';

describe('HowToPlayScreen', () => {
  it('рендерит заголовок и 4 секции', () => {
    render(<HowToPlayScreen />);
    expect(screen.getByText('Как играть')).toBeInTheDocument();
    expect(screen.getByText('1. Цель')).toBeInTheDocument();
    expect(screen.getByText('2. Улики')).toBeInTheDocument();
    expect(screen.getByText('3. Блокнот')).toBeInTheDocument();
    expect(screen.getByText('4. Обвинение')).toBeInTheDocument();
  });

  it('«Назад» → screen = main_menu', () => {
    useGameStore.setState({ screen: 'how_to_play' });
    render(<HowToPlayScreen />);
    fireEvent.click(screen.getByText('Назад'));
    expect(useGameStore.getState().screen).toBe('main_menu');
  });
});
