import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsScreen } from './SettingsScreen';
import { useGameStore } from '../store';
import { AUDIO_ENABLED } from '../audio/config';

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* noop */
  }
  useGameStore.getState().resetStore();
  vi.unstubAllGlobals();
});

describe.skipIf(!AUDIO_ENABLED)('SettingsScreen: звук', () => {
  it('по умолчанию звук включён, громкость 50%', () => {
    render(<SettingsScreen />);
    expect(screen.getByLabelText('Звук включён')).toBeChecked();
    expect(screen.getByText('Громкость: 50%')).toBeInTheDocument();
  });

  it('снятие чекбокса → audioMuted = true', () => {
    render(<SettingsScreen />);
    fireEvent.click(screen.getByLabelText('Звук включён'));
    expect(useGameStore.getState().audioMuted).toBe(true);
  });

  it('слайдер меняет audioVolume', () => {
    render(<SettingsScreen />);
    const slider = screen.getByLabelText('Громкость');
    fireEvent.input(slider, { target: { value: '0.2' } });
    expect(useGameStore.getState().audioVolume).toBeCloseTo(0.2, 5);
  });

  it('setAudioVolume клампит значения вне 0..1', () => {
    useGameStore.getState().setAudioVolume(1.5);
    expect(useGameStore.getState().audioVolume).toBe(1);
    useGameStore.getState().setAudioVolume(-0.3);
    expect(useGameStore.getState().audioVolume).toBe(0);
  });

  it('слайдер disabled при mute', () => {
    useGameStore.setState({ audioMuted: true });
    render(<SettingsScreen />);
    expect(screen.getByLabelText('Громкость')).toBeDisabled();
  });
});

describe('SettingsScreen: аудио-заглушка', () => {
  it('при AUDIO_ENABLED=false — нет чекбокса звука, есть текст «отключён»', () => {
    if (AUDIO_ENABLED) return;
    render(<SettingsScreen />);
    expect(screen.queryByLabelText('Звук включён')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Громкость')).not.toBeInTheDocument();
    expect(screen.getByText(/Звук отключён в этой сборке/)).toBeInTheDocument();
  });
});

describe('SettingsScreen: режим', () => {
  it('toggle ironPoirot', () => {
    render(<SettingsScreen />);
    expect(useGameStore.getState().ironPoirot).toBe(false);
    fireEvent.click(screen.getByLabelText('Железный Пуаро'));
    expect(useGameStore.getState().ironPoirot).toBe(true);
  });
});

describe('SettingsScreen: прогресс', () => {
  it('«Начать заново» с confirm → resetStore + startNewGame', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    );
    render(<SettingsScreen />);
    fireEvent.click(screen.getByText('Начать заново'));
    const s = useGameStore.getState();
    expect(s.currentScene).toBe('ch1_01');
    expect(s.screen).toBe('scene');
  });

  it('«Начать заново» disabled без currentScene', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Начать заново')).toBeDisabled();
  });

  it('«Сбросить прогресс» с confirm → resetStore, currentScene = ""', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    );
    render(<SettingsScreen />);
    fireEvent.click(screen.getByText('Сбросить прогресс'));
    expect(useGameStore.getState().currentScene).toBe('');
  });

  it('«Сбросить прогресс» с отменой → no-op', () => {
    useGameStore.getState().enterSceneById('ch1_01');
    vi.stubGlobal(
      'confirm',
      vi.fn(() => false),
    );
    render(<SettingsScreen />);
    fireEvent.click(screen.getByText('Сбросить прогресс'));
    expect(useGameStore.getState().currentScene).toBe('ch1_01');
  });
});

describe('SettingsScreen: назад', () => {
  it('«Назад» → screen = main_menu', () => {
    render(<SettingsScreen />);
    fireEvent.click(screen.getByText('Назад'));
    expect(useGameStore.getState().screen).toBe('main_menu');
  });
});
