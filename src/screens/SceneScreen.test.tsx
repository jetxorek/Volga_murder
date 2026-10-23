import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SceneScreen } from './SceneScreen';
import { useGameStore } from '../store';

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* */
  }
  useGameStore.getState().resetStore();
});

describe('SceneScreen: narration/dialogue', () => {
  it('ch1_01 n1: рендерит narration и кнопку «Продолжить»', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    render(<SceneScreen />);
    expect(screen.getByText(/Вечер на пристани/)).toBeInTheDocument();
    expect(screen.getByText('Продолжить')).toBeInTheDocument();
  });

  it('тап «Продолжить» → currentNode = n2', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    render(<SceneScreen />);
    screen.getByText('Продолжить').click();
    expect(useGameStore.getState().currentNode).toBe('n2');
  });

  it('ch1_01 n2: есть кнопка спана n_ch1_01_01', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    useGameStore.setState({ currentNode: 'n2' });
    render(<SceneScreen />);
    expect(screen.getByText(/Пирогов замечает, что Жанна не сводит глаз/)).toBeInTheDocument();
  });

  it('тап на спане → notes содержит n_ch1_01_01, кнопка disabled', async () => {
    useGameStore.getState().enterSceneById('ch1_01');
    useGameStore.setState({ currentNode: 'n2' });
    render(<SceneScreen />);
    const spanBtn = screen.getByText(/Пирогов замечает, что Жанна не сводит глаз/);
    spanBtn.click();
    expect(useGameStore.getState().notes.length).toBe(1);
    expect(useGameStore.getState().notes[0].id).toBe('n_ch1_01_01');
    await waitFor(() => {
      expect(screen.getByText(/Пирогов замечает/)).toBeDisabled();
    });
  });
});

describe('SceneScreen: choice', () => {
  it('ch1_03: 3 опции, тап o1 → currentScene = ch1_03a', () => {
    useGameStore.getState().enterSceneById('ch1_03');
    render(<SceneScreen />);
    expect(screen.getByText('Разговор с Жанной')).toBeInTheDocument();
    screen.getByText('Разговор с Жанной').click();
    expect(useGameStore.getState().currentScene).toBe('ch1_03a');
  });
});

describe('SceneScreen: hub', () => {
  it('ch2_02: показывает 4 опции', () => {
    useGameStore.getState().enterSceneById('ch2_02');
    render(<SceneScreen />);
    // По title из SCENE_GRAPH
    expect(screen.getByText(/Обыск каюты Лины/)).toBeInTheDocument();
    expect(screen.getByText(/Допрос Луизы/)).toBeInTheDocument();
    expect(screen.getByText(/Разговор с Пеньковым/)).toBeInTheDocument();
    expect(screen.getByText(/Осмотр палубы/)).toBeInTheDocument();
  });

  it('тап на опции → currentScene = ch2_02a, hubState.picked = [ch2_02a]', () => {
    useGameStore.getState().enterSceneById('ch2_02');
    render(<SceneScreen />);
    screen.getByText(/Обыск каюты Лины/).click();
    const s = useGameStore.getState();
    expect(s.currentScene).toBe('ch2_02a');
    expect(s.hubState?.picked).toEqual(['ch2_02a']);
  });
});

describe('SceneScreen: кнопка Обвинить', () => {
  it('disabled при пустом visitedScenes', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    render(<SceneScreen />);
    expect(screen.getByText('Обвинить')).toBeDisabled();
  });

  it('enabled при visitedScenes.includes(ch2_03)', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    useGameStore.setState({ visitedScenes: ['ch2_03'] });
    render(<SceneScreen />);
    expect(screen.getByText('Обвинить')).not.toBeDisabled();
  });

  it('тап → screen = accusation', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    useGameStore.setState({ visitedScenes: ['ch2_03'] });
    render(<SceneScreen />);
    screen.getByText('Обвинить').click();
    expect(useGameStore.getState().screen).toBe('accusation');
  });
});
