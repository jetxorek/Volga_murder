import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotebookOverlay } from './overlays/NotebookOverlay';
import { useGameStore } from '../store';

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* noop */
  }
  useGameStore.getState().resetStore();
});

describe('NotebookOverlay manual input (P13c)', () => {
  it('кнопка «+ Добавить вручную» → textarea → заметка добавлена', () => {
    render(<NotebookOverlay />);
    fireEvent.click(screen.getByText('+ Добавить вручную'));
    const ta = screen.getByPlaceholderText('Ваша мысль о расследовании…');
    fireEvent.change(ta, { target: { value: 'Этого не может быть' } });
    fireEvent.click(screen.getByText('Добавить'));
    const notes = useGameStore.getState().notes;
    expect(notes.length).toBe(1);
    expect(notes[0].isPersonal).toBe(true);
    expect(screen.queryByPlaceholderText('Ваша мысль о расследовании…')).not.toBeInTheDocument();
  });

  it('у личной заметки нет кнопок ★/✕', () => {
    useGameStore.getState().addPersonalNote('Личная мысль детектива');
    render(<NotebookOverlay />);
    expect(screen.getByText('Личная мысль детектива')).toBeInTheDocument();
    expect(screen.queryByLabelText('Отметить как важное')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Отбросить заметку')).not.toBeInTheDocument();
  });

  it('обычная заметка — кнопки ★/✕ есть', () => {
    useGameStore.setState({
      notes: [
        {
          id: 'n1',
          text: 't',
          statement: 's',
          category: 'motive',
          target: 'char_02',
          attributedTo: 'char_03',
          evidenceType: 'testimony',
          truthKey: 'k',
          sourceScene: 'ch1_01',
          truth: 'plausible',
          strength: 'weak',
          fromRiskyScene: false,
          createdAt: 0,
        },
      ],
    });
    render(<NotebookOverlay />);
    expect(screen.getByLabelText('Отметить как важное')).toBeInTheDocument();
    expect(screen.getByLabelText('Отбросить заметку')).toBeInTheDocument();
  });
});
