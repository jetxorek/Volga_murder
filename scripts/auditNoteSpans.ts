// scripts/auditNoteSpans.ts
// Аудит: каждый NoteSpan.text — подстрока текста узла, где он указан.
// Read-only: только читает NOTE_MATRIX и SCENE_GRAPH, ничего не пишет.
// Запуск: npm run audit (exit 0 — всё ок, exit 1 — есть сломанные).

import { NOTE_MATRIX } from '../src/data/noteMatrix';
import { SCENE_GRAPH } from '../src/data/sceneGraph';
import type { SceneNode } from '../src/schemas/scene';

type BrokenNote = {
  noteId: string;
  text: string;
  category: string;
  reason: 'not_attached' | 'text_not_found' | 'text_too_short';
  scenes: string[];
};

type SceneNodeWithSpans = Extract<SceneNode, { type: 'narration' | 'dialogue' }>;

const MIN_TEXT_LEN = 3;

function isNodeWithSpans(node: SceneNode): node is SceneNodeWithSpans {
  return (
    (node.type === 'narration' || node.type === 'dialogue') &&
    'noteSpans' in node &&
    Array.isArray(node.noteSpans)
  );
}

function findScenesForNote(
  noteId: string,
): Array<{ sceneId: string; nodeId: string; text: string }> {
  const result: Array<{ sceneId: string; nodeId: string; text: string }> = [];
  for (const [sceneId, scene] of Object.entries(SCENE_GRAPH)) {
    for (const [nodeId, node] of Object.entries(scene.nodes)) {
      if (isNodeWithSpans(node) && node.noteSpans?.includes(noteId)) {
        result.push({ sceneId, nodeId, text: node.text });
      }
    }
  }
  return result;
}

const broken: BrokenNote[] = [];
let ok = 0;

for (const [noteId, span] of Object.entries(NOTE_MATRIX)) {
  const attachments = findScenesForNote(noteId);

  if (attachments.length === 0) {
    broken.push({
      noteId,
      text: span.text,
      category: span.category,
      reason: 'not_attached',
      scenes: [],
    });
    continue;
  }

  if (span.text.length < MIN_TEXT_LEN) {
    broken.push({
      noteId,
      text: span.text,
      category: span.category,
      reason: 'text_too_short',
      scenes: attachments.map((a) => `${a.sceneId}.${a.nodeId}`),
    });
    continue;
  }

  const found = attachments.some((a) => a.text.includes(span.text));
  if (!found) {
    broken.push({
      noteId,
      text: span.text,
      category: span.category,
      reason: 'text_not_found',
      scenes: attachments.map((a) => `${a.sceneId}.${a.nodeId}`),
    });
  } else {
    ok++;
  }
}

const total = Object.keys(NOTE_MATRIX).length;

console.log('═══════════════════════════════════════════════════════');
console.log('Аудит NoteSpan.text — «Смерть на Волге»');
console.log('═══════════════════════════════════════════════════════');
console.log(`Всего заметок: ${total}`);
console.log(`OK: ${ok}`);
console.log(`Сломано: ${broken.length}`);
console.log('');

if (broken.length > 0) {
  console.log('─── Сломанные заметки ───────────────────────────────');
  for (const b of broken) {
    console.log('');
    console.log(`[${b.reason}] ${b.noteId} (${b.category})`);
    console.log(`  text: «${b.text}»`);
    if (b.scenes.length > 0) {
      console.log(`  сцены: ${b.scenes.join(', ')}`);
    } else {
      console.log('  сцены: НЕ ПРИВЯЗАН НИ К ОДНОЙ СЦЕНЕ');
    }
  }
  console.log('');
  console.log('─── Что делать ──────────────────────────────────────');
  console.log('not_attached: добавить noteId в noteSpans какого-то узла.');
  console.log('text_not_found: либо поправить NoteSpan.text (подогнать под');
  console.log('  текст узла), либо добавить фразу в текст узла.');
  console.log('text_too_short: text < 3 символов — почти наверняка опечатка.');
  process.exit(1);
} else {
  console.log('✅ Все заметки валидны — можно переходить к P13b.');
  process.exit(0);
}
