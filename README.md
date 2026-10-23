# Смерть на Волге

Нарративный детектив — адаптация романа Агаты Кристи «Смерть на Ниле» (1937), действие перенесено на пароход «Волга».

## Стек

- Vite + React + TypeScript
- Zustand (состояние)
- Zod (валидация схем)
- Vitest (тесты)
- ESLint + Prettier

## Установка

```bash
npm install
```

## Запуск

```bash
npm run dev
```

## Проверки

```bash
npm run typecheck   # проверка типов
npm run build       # сборка
```

## Структура папок

```
src/
├── assets.ts        — реестр ассетов (ASSETS)
├── main.tsx         — точка входа
├── App.tsx          — корневой компонент
├── index.css        — CSS-переменные
├── vite-env.d.ts    — типы Vite
├── schemas/         — Zod-схемы
├── data/            — статические данные
├── engine/          — игровая логика
├── store/           — Zustand-стор
└── screens/         — экраны UI
```

## Архитектура

Слоистая, зависимости только «вниз»:

```
screens → store → engine → data → schemas
```

Домен (`engine`, `data`, `schemas`) не импортирует React.
