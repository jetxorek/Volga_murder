import { describe, it, expect } from 'vitest';
import { SCENE_GRAPH, SLOTS_CONFIG, START_SCENE } from './sceneGraph';
import { CHARACTERS } from './characters';
import { NOTE_MATRIX } from './noteMatrix';
import type { Scene } from '../schemas/scene';

// Расширяем тип для индексации по string — не `as`, а присваивание совместимого типа.
const graph: Record<string, Scene> = SCENE_GRAPH;
const scenes: Scene[] = Object.values(SCENE_GRAPH);

describe('sceneGraph: базовые инварианты', () => {
  it('START_SCENE существует в SCENE_GRAPH', () => {
    expect(SCENE_GRAPH).toHaveProperty(START_SCENE);
  });

  it('id сцены совпадает с ключом в реестре', () => {
    for (const [key, scene] of Object.entries(SCENE_GRAPH)) {
      expect(scene.id).toBe(key);
    }
  });

  it('id узла совпадает с ключом в nodes', () => {
    for (const scene of scenes) {
      for (const [key, node] of Object.entries(scene.nodes)) {
        expect(node.id).toBe(key);
      }
    }
  });

  it('entry ссылается на существующий узел', () => {
    for (const scene of scenes) {
      expect(scene.nodes).toHaveProperty(scene.entry);
    }
  });
});

describe('sceneGraph: ссылочная целостность', () => {
  it('все characters — существующие charId', () => {
    for (const scene of scenes) {
      for (const cid of scene.characters) {
        expect(CHARACTERS, `сцена ${scene.id} ссылается на неизвестного ${cid}`).toHaveProperty(
          cid,
        );
      }
    }
  });

  it('все noteSpans — существующие ID в NOTE_MATRIX', () => {
    const known = new Set(Object.keys(NOTE_MATRIX));
    for (const scene of scenes) {
      for (const node of Object.values(scene.nodes)) {
        if ('noteSpans' in node && node.noteSpans) {
          for (const nid of node.noteSpans) {
            expect(
              known.has(nid),
              `сцена ${scene.id}, узел ${node.id}: неизвестный noteSpan ${nid}`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it('next / nextNodeId / onPass / onFail ссылаются на существующие узлы в той же сцене', () => {
    for (const scene of scenes) {
      const nodeIds = new Set(Object.keys(scene.nodes));
      for (const node of Object.values(scene.nodes)) {
        if (node.type === 'narration' || node.type === 'dialogue') {
          if (node.next) {
            expect(
              nodeIds.has(node.next),
              `${scene.id}.${node.id}: next → ${node.next} не существует`,
            ).toBe(true);
          }
        }
        if (node.type === 'choice') {
          for (const opt of node.options) {
            if (opt.nextNodeId) {
              expect(
                nodeIds.has(opt.nextNodeId),
                `${scene.id}.${node.id}: опция ${opt.id} → ${opt.nextNodeId} не существует`,
              ).toBe(true);
            }
          }
        }
        if (node.type === 'check') {
          expect(
            nodeIds.has(node.onPass),
            `${scene.id}.${node.id}: onPass → ${node.onPass} не существует`,
          ).toBe(true);
          expect(
            nodeIds.has(node.onFail),
            `${scene.id}.${node.id}: onFail → ${node.onFail} не существует`,
          ).toBe(true);
        }
      }
    }
  });

  it('nextSceneId / afterHubSceneId / hubConfig.options ссылаются на существующие сцены', () => {
    const known = new Set(Object.keys(SCENE_GRAPH));
    for (const scene of scenes) {
      if (scene.hubConfig) {
        expect(known.has(scene.hubConfig.afterHubSceneId)).toBe(true);
        for (const optId of scene.hubConfig.options) {
          expect(known.has(optId), `${scene.id}: hub-опция ${optId} не существует`).toBe(true);
        }
      }
      for (const node of Object.values(scene.nodes)) {
        if (node.type === 'end' && node.nextSceneId) {
          expect(
            known.has(node.nextSceneId),
            `${scene.id}.${node.id}: nextSceneId → ${node.nextSceneId} не существует`,
          ).toBe(true);
        }
        if (node.type === 'choice') {
          for (const opt of node.options) {
            if (opt.nextSceneId) {
              expect(
                known.has(opt.nextSceneId),
                `${scene.id}.${node.id}: опция ${opt.id} → ${opt.nextSceneId} не существует`,
              ).toBe(true);
            }
          }
        }
      }
    }
  });
});

describe('sceneGraph: hub и router', () => {
  const hubScenes = scenes.filter((s) => s.hubConfig);
  const routerScenes = scenes.filter(
    (s) =>
      !s.hubConfig &&
      Object.values(s.nodes)[0]?.type === 'choice' &&
      s.slotCost === 0,
  );

  it('hub-сцены имеют slotCost=0', () => {
    for (const s of hubScenes) {
      expect(s.slotCost).toBe(0);
    }
  });

  it('router-сцены имеют slotCost=0', () => {
    for (const s of routerScenes) {
      expect(s.slotCost).toBe(0);
    }
  });
});

describe('sceneGraph: достижимость', () => {
  it('все сцены достижимы от START_SCENE', () => {
    const visited = new Set<string>();
    const queue: string[] = [START_SCENE];

    while (queue.length > 0) {
      const id = queue.shift();
      if (!id || visited.has(id)) continue;
      const scene = graph[id];
      if (!scene) continue;
      visited.add(id);
      if (scene.hubConfig) {
        queue.push(scene.hubConfig.afterHubSceneId);
        for (const optId of scene.hubConfig.options) queue.push(optId);
      }
      for (const node of Object.values(scene.nodes)) {
        if (node.type === 'end' && node.nextSceneId) queue.push(node.nextSceneId);
        if (node.type === 'choice') {
          for (const opt of node.options) {
            if (opt.nextSceneId) queue.push(opt.nextSceneId);
          }
        }
      }
    }
    for (const scene of scenes) {
      expect(visited.has(scene.id), `сцена ${scene.id} недостижима от ${START_SCENE}`).toBe(true);
    }
  });

  it('нет тупиков (каждая не-hub сцена имеет end-узел)', () => {
    for (const scene of scenes) {
      if (scene.hubConfig) continue;
      const endNodes = Object.values(scene.nodes).filter((n) => n.type === 'end');
      expect(endNodes.length, `сцена ${scene.id} не имеет end-узла`).toBeGreaterThan(0);
    }
  });
});

describe('sceneGraph: арифметика слотов', () => {
  it('сумма слотов по главе совпадает с SLOTS_CONFIG', () => {
    const chapters = [1, 2, 3, 4, 5];
    for (const ch of chapters) {
      const inChapter = scenes.filter((s) => s.chapter === ch);
      const hub = inChapter.filter((s): s is Scene & { hubConfig: NonNullable<Scene['hubConfig']> } => Boolean(s.hubConfig));
      const router = inChapter.filter(
        (s) =>
          !s.hubConfig &&
          s.slotCost === 0 &&
          Object.values(s.nodes)[0]?.type === 'choice',
      );
      const subOfHub = new Set<string>();
      const subOfRouter = new Set<string>();
      for (const h of hub) {
        if (!h.hubConfig) continue;
        for (const o of h.hubConfig.options) subOfHub.add(o);
      }
      for (const r of router) {
        for (const node of Object.values(r.nodes)) {
          if (node.type === 'choice') {
            for (const opt of node.options) {
              if (opt.nextSceneId) subOfRouter.add(opt.nextSceneId);
            }
          }
        }
      }

      let sum = 0;
      for (const s of inChapter) {
        if (s.hubConfig) continue;
        if (router.includes(s)) continue;
        if (subOfHub.has(s.id)) continue;
        if (subOfRouter.has(s.id)) continue;
        sum += s.slotCost;
      }
      for (const h of hub) {
        if (!h.hubConfig) continue;
        sum += h.hubConfig.pick;
      }
      sum += router.length * 1;
      expect(sum, `глава ${ch}`).toBe(SLOTS_CONFIG[ch]);
    }
  });
});
