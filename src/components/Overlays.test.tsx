import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Overlays } from './Overlays';
import { useGameStore } from '../store';
import type { Note } from '../schemas/note';

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* */
  }
  useGameStore.getState().resetStore();
});

const makeNote = (): Note => ({
  id: 'n_ch1_01_02',
  text: 't',
  statement: 'Жанна утверждает, что Симон женился на деньгах',
  category: 'motive',
  target: 'char_02',
  attributedTo: 'char_03',
  evidenceType: 'testimony',
  truthKey: 'k',
  sourceScene: 'ch1_01',
  truth: 'true',
  strength: 'strong',
  fromRiskyScene: false,
  createdAt: 0,
});

describe('NotebookOverlay', () => {
  it('пустой блокнот → сообщение', () => {
    useGameStore.setState({ overlay: 'notebook', notes: [] });
    render(<Overlays />);
    expect(screen.getByText(/Блокнот пуст/)).toBeInTheDocument();
  });

  it('с заметкой → отображает statement, источник, тип', () => {
    useGameStore.setState({ overlay: 'notebook', notes: [makeNote()] });
    render(<Overlays />);
    expect(screen.getByText(/Симон женился на деньгах/)).toBeInTheDocument();
    expect(screen.getByText(/Жанна Бельская · Показание/)).toBeInTheDocument();
  });

  it('truth заметки НЕ отображается', () => {
    useGameStore.setState({ overlay: 'notebook', notes: [makeNote()] });
    render(<Overlays />);
    expect(screen.queryByText('true')).not.toBeInTheDocument();
    expect(screen.queryByText('false')).not.toBeInTheDocument();
  });

  it('крестик → overlay = none', () => {
    useGameStore.setState({ overlay: 'notebook' });
    render(<Overlays />);
    screen.getByLabelText('Закрыть').click();
    expect(useGameStore.getState().overlay).toBe('none');
  });
});

describe('CharacterCardOverlay', () => {
  it('без activeSpeaker → «Персонаж не выбран»', () => {
    useGameStore.setState({ overlay: 'character_card', activeSpeaker: null });
    render(<Overlays />);
    expect(screen.getByText(/Персонаж не выбран/)).toBeInTheDocument();
  });

  it('char_02 → показывает имя, appearance, relationships', () => {
    useGameStore.setState({ overlay: 'character_card', activeSpeaker: 'char_02' });
    render(<Overlays />);
    expect(screen.getAllByText(/Симон Долин/).length).toBeGreaterThan(0);
    expect(screen.getByText(/широкоплечий/)).toBeInTheDocument();
  });

  it('секрет НЕ отображается', () => {
    useGameStore.setState({ overlay: 'character_card', activeSpeaker: 'char_02' });
    render(<Overlays />);
    expect(screen.queryByText(/Убийство Лины совершено им/)).not.toBeInTheDocument();
  });
});

describe('HintsOverlay', () => {
  it('показывает 3 подсказки, счётчик 3/3', () => {
    useGameStore.setState({ overlay: 'hints' });
    render(<Overlays />);
    expect(screen.getByText(/Осталось подсказок: 3/)).toBeInTheDocument();
    expect(screen.getByText('Серые клеточки')).toBeInTheDocument();
    expect(screen.getByText('Театр памяти')).toBeInTheDocument();
    expect(screen.getByText('Снег за окном')).toBeInTheDocument();
  });

  it('тап → useHint, счётчик уменьшается', () => {
    useGameStore.setState({ overlay: 'hints' });
    render(<Overlays />);
    screen.getByText('Серые клеточки').click();
    expect(useGameStore.getState().hintsUsed.greyCells).toBe(1);
  });

  it('ironPoirot → все кнопки disabled', () => {
    useGameStore.setState({ overlay: 'hints', ironPoirot: true });
    render(<Overlays />);
    expect(screen.getByText('Серые клеточки')).toBeDisabled();
    expect(screen.getByText('Театр памяти')).toBeDisabled();
    expect(screen.getByText('Снег за окном')).toBeDisabled();
  });
});

describe('DeathOverlay', () => {
  it('обычный режим: сообщение, кнопка Продолжить', () => {
    useGameStore.setState({ overlay: 'death', deathContext: 'ch3_02' });
    render(<Overlays />);
    expect(screen.getByText(/Пирогов погиб/)).toBeInTheDocument();
    expect(screen.getByText(/Место: ch3_02/)).toBeInTheDocument();
  });

  it('ironPoirot: другое сообщение', () => {
    useGameStore.setState({ overlay: 'death', ironPoirot: true });
    render(<Overlays />);
    expect(screen.getByText(/Железный Пуаро/)).toBeInTheDocument();
  });

  it('Продолжить → dismissDeath (overlay → none, откат)', () => {
    useGameStore.setState({ overlay: 'death', chapter: 3, currentScene: 'ch3_02' });
    render(<Overlays />);
    screen.getByText('Продолжить').click();
    expect(useGameStore.getState().overlay).toBe('none');
    expect(useGameStore.getState().currentScene).toBe('ch3_01');
  });
});

describe('ChapterSummaryOverlay', () => {
  it('показывает главу и число заметок', () => {
    useGameStore.setState({
      overlay: 'chapter_summary',
      chapter: 1,
      notes: [makeNote()],
      pendingNextScene: 'ch2_01',
    });
    render(<Overlays />);
    expect(screen.getByText(/Глава 1 завершена/)).toBeInTheDocument();
    expect(screen.getByText(/Заметок в блокноте: 1/)).toBeInTheDocument();
  });

  it('Продолжить → enterSceneById(pendingNextScene)', () => {
    useGameStore.setState({ overlay: 'chapter_summary', chapter: 1, pendingNextScene: 'ch2_01' });
    render(<Overlays />);
    screen.getByText('Продолжить').click();
    expect(useGameStore.getState().currentScene).toBe('ch2_01');
    expect(useGameStore.getState().overlay).toBe('none');
  });
});

describe('Overlays: роутер', () => {
  it('overlay = none → ничего', () => {
    useGameStore.setState({ overlay: 'none' });
    const { container } = render(<Overlays />);
    expect(container.firstChild).toBeNull();
  });
});
