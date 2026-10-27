import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccusationScreen } from './AccusationScreen';
import { AccusationResultScreen } from './AccusationResultScreen';
import { FinaleScreen } from './FinaleScreen';
import { SettingsScreen } from './SettingsScreen';
import { useGameStore } from '../store';
import type { Note } from '../schemas/note';

const makeNote = (id: string): Note => ({
  id,
  text: 't',
  statement: `statement ${id}`,
  category: 'motive',
  target: 'char_02',
  attributedTo: 'detective',
  evidenceType: 'observation',
  truthKey: 'k',
  sourceScene: 'ch1_01',
  truth: 'true',
  strength: 'strong',
  fromRiskyScene: false,
  createdAt: 0,
});

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* */
  }
  useGameStore.getState().resetStore();
});

describe('AccusationScreen', () => {
  it('показывает 6 подозреваемых (isAccusable)', () => {
    useGameStore.setState({ notes: [makeNote('n_ch1_01_02')] });
    render(<AccusationScreen />);
    expect(screen.getByLabelText('Симон Долин')).toBeInTheDocument();
    expect(screen.getByLabelText('Жанна Бельская')).toBeInTheDocument();
    expect(screen.getByLabelText('Андрей Пеньков')).toBeInTheDocument();
    expect(screen.getByLabelText('Тимофей Аллертон')).toBeInTheDocument();
    expect(screen.getByLabelText('Мария Ванская')).toBeInTheDocument();
    expect(screen.getByLabelText('Доктор Бреннер')).toBeInTheDocument();
    expect(screen.queryByLabelText('Лина Долина')).not.toBeInTheDocument();
  });

  it('кнопка «Обвинить» disabled при < 3 заметках', () => {
    useGameStore.setState({ notes: [makeNote('n_ch1_01_02')] });
    render(<AccusationScreen />);
    expect(screen.getByText('Обвинить')).toBeDisabled();
  });

  it('кнопка «Обвинить» enabled при 1 обвиняемом + 3 заметках', () => {
    useGameStore.setState({
      notes: [makeNote('n_ch1_01_02'), makeNote('n_ch1_01_03'), makeNote('n_ch1_02_01')],
    });
    render(<AccusationScreen />);
    screen.getByLabelText('Симон Долин').click();
    screen.getByLabelText('Жанна утверждает, что Симон женился на деньгах').click();
    screen.getByLabelText('Лина держится как хозяйка положения').click();
    screen.getByLabelText('Симон утверждает, что любит Лину').click();
    expect(screen.getByText('Обвинить')).not.toBeDisabled();
  });

  it('submit → screen = accusation_result, lastAccusationResult заполнен', () => {
    useGameStore.setState({
      notes: [makeNote('n_ch1_01_02'), makeNote('n_ch1_01_03'), makeNote('n_ch1_02_01')],
    });
    render(<AccusationScreen />);
    screen.getByLabelText('Симон Долин').click();
    screen.getByLabelText('Жанна утверждает, что Симон женился на деньгах').click();
    screen.getByLabelText('Лина держится как хозяйка положения').click();
    screen.getByLabelText('Симон утверждает, что любит Лину').click();
    screen.getByText('Обвинить').click();
    const s = useGameStore.getState();
    expect(s.screen).toBe('accusation_result');
    expect(s.lastAccusationResult).not.toBeNull();
  });
});

describe('AccusationResultScreen', () => {
  it('null result → fallback', () => {
    useGameStore.setState({ lastAccusationResult: null });
    render(<AccusationResultScreen />);
    expect(screen.getByText(/Результат обвинения недоступен/)).toBeInTheDocument();
  });

  it('full → заголовок «Полное обвинение», покрытие 5/5', () => {
    useGameStore.setState({
      lastAccusationResult: {
        score: 10,
        coverage: 5,
        validCount: 8,
        strongCount: 4,
        contradictionPenalty: 0,
        outcome: 'full',
        missingCategories: [],
        submittedNoteIds: [],
        accusedCount: 2,
      },
    });
    render(<AccusationResultScreen />);
    expect(screen.getByText('Полное обвинение')).toBeInTheDocument();
    // P18: dl со статистикой заменён на разбор «Работа над ошибками» (ADR-031)
    expect(screen.getByText(/Работа над ошибками/)).toBeInTheDocument();
  });

  it('fail с missingCategories → показывает категории', () => {
    useGameStore.setState({
      lastAccusationResult: {
        score: 0,
        coverage: 2,
        validCount: 1,
        strongCount: 0,
        contradictionPenalty: 0,
        outcome: 'fail',
        missingCategories: ['alibi', 'psychology', 'contradiction'],
        submittedNoteIds: [],
        accusedCount: 1,
      },
    });
    render(<AccusationResultScreen />);
    expect(screen.getByText('Обвинение провалено')).toBeInTheDocument();
    expect(screen.getByText('Алиби')).toBeInTheDocument();
    expect(screen.getByText('Психология')).toBeInTheDocument();
    expect(screen.getByText('Противоречие')).toBeInTheDocument();
  });

  it('показывает найденные и упущенные ключевые улики', () => {
    useGameStore.setState({
      lastAccusationResult: {
        score: 5,
        coverage: 5,
        validCount: 5,
        strongCount: 2,
        contradictionPenalty: 0,
        outcome: 'partial_high',
        missingCategories: [],
        submittedNoteIds: [],
        accusedCount: 2,
      },
    });
    render(<AccusationResultScreen />);
    expect(screen.getByText(/Работа над ошибками/)).toBeInTheDocument();
    expect(screen.getByText(/ключевых улик\./)).toBeInTheDocument();
    // Ни одна ключевая улика не сдана — счётчик «Вы нашли 0 из N»
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/Показать упущенные \(\d+\)/)).toBeInTheDocument();
  });

  it('Продолжить → currentScene = ch5_01', () => {
    useGameStore.setState({
      lastAccusationResult: {
        score: 5,
        coverage: 5,
        validCount: 5,
        strongCount: 2,
        contradictionPenalty: 0,
        outcome: 'partial_high',
        missingCategories: [],
        submittedNoteIds: [],
        accusedCount: 2,
      },
    });
    render(<AccusationResultScreen />);
    screen.getByText('Продолжить').click();
    expect(useGameStore.getState().currentScene).toBe('ch5_01');
  });
});

describe('FinaleScreen', () => {
  it('показывает итоги: заметки, смерти', () => {
    useGameStore.setState({
      notes: [makeNote('n1'), makeNote('n2')],
      deaths: 1,
      lastAccusationResult: {
        score: 10,
        coverage: 5,
        validCount: 8,
        strongCount: 4,
        contradictionPenalty: 0,
        outcome: 'full',
        missingCategories: [],
        submittedNoteIds: [],
        accusedCount: 2,
      },
    });
    render(<FinaleScreen />);
    expect(screen.getByText(/Расследование завершено/)).toBeInTheDocument();
    expect(screen.getByText('Безупречное')).toBeInTheDocument();
  });

  it('«В главное меню» → screen = main_menu', () => {
    render(<FinaleScreen />);
    screen.getByText('В главное меню').click();
    expect(useGameStore.getState().screen).toBe('main_menu');
  });

  it('«Начать заново» → resetStore + startNewGame, currentScene = ch1_01', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    useGameStore.setState({ tutorialStepsSeen: ['welcome'] });
    render(<FinaleScreen />);
    screen.getByText('Начать заново').click();
    const s = useGameStore.getState();
    expect(s.currentScene).toBe('ch1_01');
    expect(s.screen).toBe('scene');
  });
});

describe('SettingsScreen', () => {
  it('toggle ironPoirot', () => {
    render(<SettingsScreen />);
    expect(useGameStore.getState().ironPoirot).toBe(false);
    screen.getByLabelText('Железный Пуаро').click();
    expect(useGameStore.getState().ironPoirot).toBe(true);
  });

  it('«Назад» → screen = main_menu', () => {
    render(<SettingsScreen />);
    screen.getByText('Назад').click();
    expect(useGameStore.getState().screen).toBe('main_menu');
  });

  it('«Сбросить прогресс» с confirm → resetStore, currentScene = ""', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    );
    render(<SettingsScreen />);
    screen.getByText('Сбросить прогресс').click();
    expect(useGameStore.getState().currentScene).toBe('');
    vi.unstubAllGlobals();
  });

  it('«Сбросить прогресс» с отменой → no-op', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    vi.stubGlobal(
      'confirm',
      vi.fn(() => false),
    );
    render(<SettingsScreen />);
    screen.getByText('Сбросить прогресс').click();
    expect(useGameStore.getState().currentScene).toBe('ch1_01');
    vi.unstubAllGlobals();
  });
});
