import { useGameStore } from '../store';

/** Статический экран правил: цель, улики, блокнот, обвинение. */
export function HowToPlayScreen() {
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div
      style={{
        padding: 'var(--spacing-lg)',
        maxWidth: 560,
        margin: '0 auto',
        lineHeight: 1.6,
      }}
    >
      <h1>Как играть</h1>

      <section style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1.125rem' }}>1. Цель</h2>
        <p>
          Вы — Эрнест Пирогов, детектив. На пароходе «Волга» совершено убийство. Ваша задача — найти
          виновного (или виновных) и предъявить обвинение.
        </p>
        <p style={{ color: 'var(--color-text-muted)' }}>В игре три концовки. Выбор — за вами.</p>
      </section>

      <section style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1.125rem' }}>2. Улики</h2>
        <p>
          Читайте текст сцен. Если фраза кажется подозрительной — <strong>выделите её</strong>{' '}
          (мышкой или пальцем). Внизу появится панель «Добавить в блокнот». Нажмите — улика ваша.
        </p>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Не бойтесь ошибиться: если фраза не улика, она станет «личной заметкой» — вашей мыслью.
          Она не влияет на обвинение, но останется в блокноте.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1.125rem' }}>3. Блокнот</h2>
        <p>Всё, что вы нашли, лежит в блокноте. Там можно:</p>
        <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
          <li>
            пометить улику как <strong>★ важную</strong>;
          </li>
          <li>
            отбросить лишнее (<strong>✕</strong>);
          </li>
          <li>
            написать свою мысль — кнопка <strong>«+ Добавить вручную»</strong>.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1.125rem' }}>4. Обвинение</h2>
        <p>
          Кнопка «Обвинить» откроется, когда вы найдёте тело. Выберите подозреваемых и заметки,
          которые подтверждают вашу версию.
        </p>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Совет: для полного успеха нужны все пять категорий — мотив, возможность, алиби,
          психология, противоречие.
        </p>
      </section>

      <button
        onClick={() => setScreen('main_menu')}
        style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
      >
        Назад
      </button>
    </div>
  );
}
