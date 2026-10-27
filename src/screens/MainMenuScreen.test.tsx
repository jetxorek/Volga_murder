import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainMenuScreen } from './MainMenuScreen';
import { useGameStore } from '../store';

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* */
  }
  useGameStore.getState().resetStore();
});

describe('MainMenuScreen', () => {
  it('рендерит заголовок', () => {
    render(<MainMenuScreen />);
    expect(screen.getByText('Смерть на Волге')).toBeInTheDocument();
  });

  it('кнопка «Продолжить» задизейблена при пустом currentScene', () => {
    render(<MainMenuScreen />);
    const btn = screen.getByText('Продолжить');
    expect(btn).toBeDisabled();
  });

  it('кнопка «Продолжить» активна при наличии currentScene', () => {
    useGameStore.setState({ currentScene: 'ch1_01' });
    render(<MainMenuScreen />);
    expect(screen.getByText('Продолжить')).not.toBeDisabled();
  });

  it('«Новая игра» → screen = tutorial (первый запуск), currentScene = ch1_01', () => {
    render(<MainMenuScreen />);
    screen.getByText('Новая игра').click();
    expect(useGameStore.getState().screen).toBe('tutorial');
    expect(useGameStore.getState().currentScene).toBe('ch1_01');
  });

  it('«Настройки» → screen = settings', () => {
    render(<MainMenuScreen />);
    screen.getByText('Настройки').click();
    expect(useGameStore.getState().screen).toBe('settings');
  });
});
