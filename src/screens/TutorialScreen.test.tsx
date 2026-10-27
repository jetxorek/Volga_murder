import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TutorialScreen } from './TutorialScreen';
import { useGameStore } from '../store';

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* noop */
  }
  useGameStore.getState().resetStore();
});

describe('TutorialScreen', () => {
  it('показывает первую карточку + «Пропустить»', () => {
    render(<TutorialScreen />);
    expect(screen.getByText('Ты — Эрнест Пирогов')).toBeInTheDocument();
    expect(screen.getByText('Пропустить')).toBeInTheDocument();
    expect(screen.getByText('Далее')).toBeInTheDocument();
  });

  it('«Далее» → следующая карточка', () => {
    render(<TutorialScreen />);
    fireEvent.click(screen.getByText('Далее'));
    expect(screen.getByText('Читай. Выделяй.')).toBeInTheDocument();
  });

  it('на последней — «Начать расследование», finish → scene', () => {
    render(<TutorialScreen />);
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByText('Далее'));
    expect(screen.getByText('Начать расследование')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Начать расследование'));
    expect(useGameStore.getState().screen).toBe('scene');
    expect(useGameStore.getState().tutorialStepsSeen).toContain('welcome');
  });

  it('«Пропустить» → scene + welcome', () => {
    render(<TutorialScreen />);
    fireEvent.click(screen.getByText('Пропустить'));
    expect(useGameStore.getState().screen).toBe('scene');
    expect(useGameStore.getState().tutorialStepsSeen).toContain('welcome');
  });

  it('«Назад» на первой карточке — нет кнопки', () => {
    render(<TutorialScreen />);
    expect(screen.queryByText('Назад')).not.toBeInTheDocument();
  });
});

describe('startNewGame + tutorial', () => {
  it('первый запуск → screen: tutorial, currentScene: ch1_01', () => {
    useGameStore.getState().startNewGame();
    expect(useGameStore.getState().screen).toBe('tutorial');
    expect(useGameStore.getState().currentScene).toBe('ch1_01');
  });

  it('повторный запуск (welcome seen) → screen: scene', () => {
    useGameStore.setState({ tutorialStepsSeen: ['welcome'] });
    useGameStore.getState().startNewGame();
    expect(useGameStore.getState().screen).toBe('scene');
    expect(useGameStore.getState().currentScene).toBe('ch1_01');
  });

  it('startNewGame сохраняет ironPoirot', () => {
    useGameStore.setState({ ironPoirot: true, tutorialStepsSeen: ['welcome'] });
    useGameStore.getState().startNewGame();
    expect(useGameStore.getState().ironPoirot).toBe(true);
  });

  it('startNewGame сохраняет tutorialStepsSeen', () => {
    useGameStore.setState({ tutorialStepsSeen: ['welcome', 'other'] });
    useGameStore.getState().startNewGame();
    expect(useGameStore.getState().tutorialStepsSeen).toContain('welcome');
    expect(useGameStore.getState().tutorialStepsSeen).toContain('other');
  });
});

describe('markTutorialSeen', () => {
  it('добавляет шаг', () => {
    useGameStore.getState().markTutorialSeen('welcome');
    expect(useGameStore.getState().tutorialStepsSeen).toContain('welcome');
  });

  it('дубликат — no-op', () => {
    useGameStore.getState().markTutorialSeen('welcome');
    useGameStore.getState().markTutorialSeen('welcome');
    const seen = useGameStore.getState().tutorialStepsSeen;
    expect(seen.filter((s) => s === 'welcome').length).toBe(1);
  });
});
