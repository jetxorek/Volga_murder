import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LibraryScreen } from './LibraryScreen';
import { useGameStore } from '../store';

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* */
  }
  useGameStore.getState().resetStore();
});

describe('LibraryScreen', () => {
  it('рендерит заголовок и 4 карточки', () => {
    render(<LibraryScreen />);
    expect(screen.getByText('Библиотека расследований')).toBeInTheDocument();
    expect(screen.getByLabelText('Смерть на Волге')).toBeInTheDocument();
    expect(screen.getByLabelText('Смерть на Ниле')).toBeInTheDocument();
    expect(screen.getByLabelText('Убийство в «Восточном экспрессе»')).toBeInTheDocument();
    expect(screen.getByLabelText('Тайна голубого поезда')).toBeInTheDocument();
  });

  it('«Скоро» — 3 карточки, задизейблены', () => {
    render(<LibraryScreen />);
    expect(screen.getAllByText('Скоро').length).toBe(3);
    expect(screen.getByLabelText('Смерть на Ниле')).toBeDisabled();
    expect(screen.getByLabelText('Тайна голубого поезда')).toBeDisabled();
  });

  it('клик по «Смерть на Волге» → startNewGame', () => {
    useGameStore.setState({ tutorialStepsSeen: ['welcome'] });
    render(<LibraryScreen />);
    fireEvent.click(screen.getByLabelText('Смерть на Волге'));
    const state = useGameStore.getState();
    expect(state.screen).toBe('scene');
    expect(state.currentScene).toBe('ch1_01');
  });

  it('без прогресса — статус «Играть», с концовками — «Пройдено»', () => {
    const { unmount } = render(<LibraryScreen />);
    expect(screen.getByText('Играть')).toBeInTheDocument();

    unmount();
    useGameStore.setState({ unlockedEndings: ['ending_law'] });
    render(<LibraryScreen />);
    expect(screen.getByText('Пройдено')).toBeInTheDocument();
  });

  it('lastAccusationResult тоже даёт «Пройдено»', () => {
    useGameStore.setState({
      lastAccusationResult: {
        score: 5,
        coverage: 5,
        validCount: 5,
        strongCount: 2,
        contradictionPenalty: 0,
        outcome: 'partial_high',
        missingCategories: [],
        accusedCount: 2,
        submittedNoteIds: [],
      },
    });
    render(<LibraryScreen />);
    expect(screen.getByText('Пройдено')).toBeInTheDocument();
  });

  it('«Назад» → main_menu', () => {
    useGameStore.setState({ screen: 'library' });
    render(<LibraryScreen />);
    fireEvent.click(screen.getByText('Назад'));
    expect(useGameStore.getState().screen).toBe('main_menu');
  });
});
