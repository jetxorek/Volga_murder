import { useState } from 'react';
import { useGameStore } from '../store';

type TutorialStep = {
  title: string;
  text: string;
};

const STEPS: TutorialStep[] = [
  {
    title: 'Ты — Эрнест Пирогов',
    text: 'Детектив. Пароход «Волга», 1937 год. На борту — убийство. Твоя задача — найти виновного. Или виновных.',
  },
  {
    title: 'Читай. Выделяй.',
    text: 'Подозрительные фразы в тексте можно выделить — и они попадут в блокнот. Тапни и потяни по тексту, как в обычной книге.',
  },
  {
    title: 'Записывай. Отмечай.',
    text: 'В блокноте — метки ★ (важное) и ✕ (отбросить). А если мысль пришла в голову — добавь её вручную, кнопкой «+ Добавить вручную».',
  },
  {
    title: 'Обвиняй. Когда будешь готов.',
    text: 'Кнопка «Обвинить» откроется, когда ты найдёшь тело. Но помни: нужны доказательства. Три концовки — три выбора.',
  },
];

/** Онбординг при первом запуске: 4 карточки. */
export function TutorialScreen() {
  const [step, setStep] = useState(0);
  const markSeen = useGameStore((s) => s.markTutorialSeen);
  const setScreen = useGameStore((s) => s.setScreen);

  const finish = () => {
    markSeen('welcome');
    setScreen('scene');
  };

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
        padding: 'var(--spacing-lg)',
        maxWidth: 560,
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={finish}
          style={{ border: 'none', background: 'transparent', color: 'var(--color-text-muted)' }}
        >
          Пропустить
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem',
            marginBottom: 'var(--spacing-sm)',
          }}
        >
          {step + 1} / {STEPS.length}
        </div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--spacing-md)' }}>{current.title}</h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>{current.text}</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{ flex: 1, borderColor: 'var(--color-border)' }}
          >
            Назад
          </button>
        )}
        <button onClick={() => (isLast ? finish() : setStep(step + 1))} style={{ flex: 2 }}>
          {isLast ? 'Начать расследование' : 'Далее'}
        </button>
      </div>
    </div>
  );
}
