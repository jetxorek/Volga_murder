# ADR-001. TruthTable: категории опциональны

**Дата:** 2026-01-20
**Статус:** Принято

## Контекст

Исходная спека P1a определяла `TruthTable` как:

```ts
z.record(
  z.string().min(1),
  z.record(NoteCategorySchema, z.record(z.string().min(1), TruthValueSchema)),
);
```

Такая схема в TypeScript разворачивается в тип
`Record<string, Record<NoteCategory, Record<string, TruthValue>>>`, где все 5
категорий (`motive`, `opportunity`, `alibi`, `psychology`, `contradiction`)
обязательны для каждого `target`.

Данные этапа 1.2 показывают, что у большинства персонажей категории неполные:
например, у `char_05` (Луиза) нет `motive` и `alibi`, у `char_07` — только
`opportunity` и `psychology`. Схема с обязательными всеми 5 категориями
отклоняла бы валидные данные.

## Решение

`TruthTable` — `z.object({ motive, opportunity, alibi, psychology, contradiction }).partial()`,
где каждая категория — `z.record(z.string().min(1), TruthValueSchema)`.

```ts
const CategoryRecordSchema = z
  .object({
    motive: z.record(z.string().min(1), TruthValueSchema),
    opportunity: z.record(z.string().min(1), TruthValueSchema),
    alibi: z.record(z.string().min(1), TruthValueSchema),
    psychology: z.record(z.string().min(1), TruthValueSchema),
    contradiction: z.record(z.string().min(1), TruthValueSchema),
  })
  .partial();

export const TruthTableSchema = z.record(z.string().min(1), CategoryRecordSchema);
```

## Последствия

- Валидны неполные таблицы (только нужные категории у `target`).
- Проверка «у каждого CULPRIT все 5 категорий» — задача данных
  (тест `dataValidation.test.ts`), а не схемы.
- Схема больше не ловит «забыл добавить категорию у виновного» —
  это осознанно: ловит валидатор данных, а не контракт.
- `TruthTable = z.infer<typeof TruthTableSchema>` становится
  `Record<string, { motive?: Record<string, TruthValue>; ... }>`.
- Совместимо с `TRUTH_TABLE` из этапа 1.2 — все существующие ключи проходят.

## Файлы

- `src/schemas/truthTable.ts` — реализация.
- `src/schemas/schemas.test.ts` — тесты (проверяют валидность неполных таблиц).
