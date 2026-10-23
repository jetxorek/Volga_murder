type AssetEntry = { path: string; alt: string };
type AudioEntry = { path: string };

export const ASSETS: {
  portraits: Record<string, AssetEntry>;
  backgrounds: Record<string, AssetEntry>;
  audio: Record<string, AudioEntry>;
  ui: Record<string, { path: string }>;
} = {
  portraits: {
    portrait_pirogov: { path: '/assets/portraits/pirogov.png', alt: 'Эрнест Пирогов' },
    portrait_simon: { path: '/assets/portraits/simon.png', alt: 'Симон Долин' },
    portrait_jeanne: { path: '/assets/portraits/jeanne.png', alt: 'Жанна Бельская' },
    portrait_lina: { path: '/assets/portraits/lina.png', alt: 'Лина Долина' },
    portrait_louise: { path: '/assets/portraits/louise.png', alt: 'Луиза Бурцева' },
    portrait_penkov: { path: '/assets/portraits/penkov.png', alt: 'Андрей Пеньков' },
    portrait_otterborn: { path: '/assets/portraits/otterborn.png', alt: 'Саломея Оттерборн' },
    portrait_allerton: { path: '/assets/portraits/allerton.png', alt: 'Тимофей Аллертон' },
    portrait_vanskaya: { path: '/assets/portraits/vanskaya.png', alt: 'Мария Ванская' },
    portrait_brenner: { path: '/assets/portraits/brenner.png', alt: 'Доктор Бреннер' },
  },
  backgrounds: {},
  audio: {},
  ui: {},
};
