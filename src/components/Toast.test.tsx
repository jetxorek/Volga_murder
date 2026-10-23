import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from './Toast';
import { useGameStore } from '../store';

beforeEach(() => {
  useGameStore.getState().resetStore();
  useGameStore.setState({ toast: null });
  vi.useRealTimers();
});

describe('Toast', () => {
  it('null → ничего не рендерит', () => {
    const { container } = render(<Toast />);
    expect(container.firstChild).toBeNull();
  });

  it('рендерит текст toast', () => {
    useGameStore.setState({ toast: 'Привет' });
    render(<Toast />);
    expect(screen.getByRole('status')).toHaveTextContent('Привет');
  });

  it('скрывается через 3 секунды', () => {
    vi.useFakeTimers();
    useGameStore.setState({ toast: 'Тест' });
    render(<Toast />);
    vi.advanceTimersByTime(3000);
    expect(useGameStore.getState().toast).toBeNull();
    vi.useRealTimers();
  });
});
