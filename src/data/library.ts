/** Статус расследования в библиотеке. */
export type LibraryStatus = 'playable' | 'coming_soon';

/** Метаданные расследования для «Библиотеки». */
export type LibraryEntry = {
  id: string;
  title: string;
  description: string;
  status: LibraryStatus;
};

/** Каталог расследований: 1 играбельное + 3 «Скоро». */
export const LIBRARY_ENTRIES: LibraryEntry[] = [
  {
    id: 'lib_volga',
    title: 'Смерть на Волге',
    description:
      'Пароход «Волга», 1937 год. Убийство на борту, десять подозреваемых, три концовки. Ваше первое расследование.',
    status: 'playable',
  },
  {
    id: 'lib_nile',
    title: 'Смерть на Ниле',
    description: 'Круиз по великой реке. Медовый месяц прерван выстрелом.',
    status: 'coming_soon',
  },
  {
    id: 'lib_orient_express',
    title: 'Убийство в «Восточном экспрессе»',
    description: 'Поезд в снежном плену. Двенадцать пассажиров — двенадцать версий.',
    status: 'coming_soon',
  },
  {
    id: 'lib_nil',
    title: 'Тайна голубого поезда',
    description: 'Экспресс Париж — Ривьера. Чемодан с кокаином и мёртвая пассажирка.',
    status: 'coming_soon',
  },
];
