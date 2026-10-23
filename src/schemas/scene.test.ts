import { describe, it, expect } from 'vitest';
import {
  SceneNodeSchema,
  SceneSchema,
  HubConfigSchema,
  ChoiceOptionSchema,
  type SceneNode,
  type Scene,
  type HubConfig,
  type ChoiceOption,
} from './index';

// --- Фикстуры узлов ---

const narrationNode: SceneNode = {
  type: 'narration',
  id: 'n1',
  text: 'Пароход плывёт по Волге.',
  next: 'n2',
};

const dialogueNode: SceneNode = {
  type: 'dialogue',
  id: 'd1',
  speaker: 'char_01',
  text: 'Я никого не видел.',
  next: 'n2',
};

const choiceNode: SceneNode = {
  type: 'choice',
  id: 'c1',
  prompt: 'Что делать?',
  options: [
    { id: 'o1', label: 'Спросить', nextNodeId: 'n2' },
    { id: 'o2', label: 'Молчать', nextSceneId: 'ch2_01' },
  ],
};

const checkNode: SceneNode = {
  type: 'check',
  id: 'ck1',
  condition: { suspicionBelow: 50 },
  onPass: 'n2',
  onFail: 'n3',
};

const endNode: SceneNode = {
  type: 'end',
  id: 'e1',
  outcome: 'death',
};

const endContinueNode: SceneNode = {
  type: 'end',
  id: 'e2',
  outcome: 'continue',
  nextSceneId: 'ch2_01',
};

// --- Тесты SceneNode ---

describe('SceneNodeSchema', () => {
  it('принимает narration-узел', () => {
    const result = SceneNodeSchema.safeParse(narrationNode);
    expect(result.success).toBe(true);
  });

  it('принимает dialogue-узел', () => {
    const result = SceneNodeSchema.safeParse(dialogueNode);
    expect(result.success).toBe(true);
  });

  it('принимает choice-узел', () => {
    const result = SceneNodeSchema.safeParse(choiceNode);
    expect(result.success).toBe(true);
  });

  it('принимает check-узел', () => {
    const result = SceneNodeSchema.safeParse(checkNode);
    expect(result.success).toBe(true);
  });

  it('принимает end-узел с outcome=death', () => {
    const result = SceneNodeSchema.safeParse(endNode);
    expect(result.success).toBe(true);
  });

  it('принимает end-узел с outcome=continue и nextSceneId', () => {
    const result = SceneNodeSchema.safeParse(endContinueNode);
    expect(result.success).toBe(true);
  });

  it('отклоняет end-узел с outcome=continue без nextSceneId', () => {
    const invalid = { type: 'end', id: 'e3', outcome: 'continue' };
    const result = SceneNodeSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('отклоняет choice с 1 опцией', () => {
    const invalid = {
      type: 'choice',
      id: 'c2',
      prompt: 'Выбор?',
      options: [{ id: 'o1', label: 'Единственный', nextNodeId: 'n2' }],
    };
    const result = SceneNodeSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('отклоняет choice с 5 опциями', () => {
    const options = Array.from({ length: 5 }, (_, i) => ({
      id: `o${i}`,
      label: `Опция ${i}`,
      nextNodeId: 'n2',
    }));
    const invalid = { type: 'choice', id: 'c3', prompt: 'Выбор?', options };
    const result = SceneNodeSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// --- Тесты ChoiceOption ---

describe('ChoiceOptionSchema', () => {
  it('принимает опцию с nextNodeId', () => {
    const valid: ChoiceOption = { id: 'o1', label: 'Спросить', nextNodeId: 'n2' };
    const result = ChoiceOptionSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('принимает опцию с nextSceneId', () => {
    const valid: ChoiceOption = { id: 'o2', label: 'Уйти', nextSceneId: 'ch2_01' };
    const result = ChoiceOptionSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('отклоняет опцию без nextNodeId и nextSceneId', () => {
    const invalid = { id: 'o3', label: 'Тупик' };
    const result = ChoiceOptionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('отклоняет опцию с обоими nextNodeId и nextSceneId', () => {
    const invalid = { id: 'o4', label: 'Двойной', nextNodeId: 'n2', nextSceneId: 'ch2_01' };
    const result = ChoiceOptionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// --- Тесты HubConfig ---

describe('HubConfigSchema', () => {
  it('принимает корректный HubConfig', () => {
    const valid: HubConfig = {
      options: ['opt1', 'opt2', 'opt3'],
      pick: 2,
      afterHubSceneId: 'ch2_01',
    };
    const result = HubConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('отклоняет pick > options.length', () => {
    const invalid = { options: ['opt1', 'opt2'], pick: 3, afterHubSceneId: 'ch2_01' };
    const result = HubConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('отклоняет меньше 2 options', () => {
    const invalid = { options: ['opt1'], pick: 1, afterHubSceneId: 'ch2_01' };
    const result = HubConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// --- Тесты Scene ---

const validScene: Scene = {
  id: 'ch1_01',
  chapter: 1,
  title: 'Прибытие',
  type: 'mandatory',
  background: 'bg_deck',
  characters: ['char_01', 'char_02'],
  entry: 'n1',
  slotCost: 1,
  nodes: {
    n1: { type: 'narration', id: 'n1', text: 'Пароход плывёт.', next: 'n2' },
    n2: { type: 'end', id: 'n2', outcome: 'chapter_end' },
  },
};

describe('SceneSchema', () => {
  it('принимает корректную сцену', () => {
    const result = SceneSchema.safeParse(validScene);
    expect(result.success).toBe(true);
  });

  it('отклоняет hub-сцену с slotCost !== 0', () => {
    const invalid = {
      ...validScene,
      slotCost: 1,
      hubConfig: { options: ['opt1', 'opt2'], pick: 1, afterHubSceneId: 'ch2_01' },
    };
    const result = SceneSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('принимает hub-сцену с slotCost=0', () => {
    const valid = {
      ...validScene,
      slotCost: 0,
      hubConfig: { options: ['opt1', 'opt2'], pick: 1, afterHubSceneId: 'ch2_01' },
    };
    const result = SceneSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('отклоняет сцену, где entry не существует в nodes', () => {
    const invalid = { ...validScene, entry: 'nonexistent' };
    const result = SceneSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('отклоняет сцену с неизвестным полем', () => {
    const invalid = { ...validScene, unknownField: 'oops' };
    const result = SceneSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
