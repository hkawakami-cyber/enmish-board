// ボードの新規作成（空 / テンプレート）を担う。UI から呼び出す高レベル操作。

import type { Board } from "@/types/board";
import { saveBoard } from "./storage";
import { buildTemplate, getTemplateDef } from "./templates";

export function createBlankBoard(title = "新規ボード"): Board {
  const now = new Date().toISOString();
  const board: Board = {
    id: crypto.randomUUID(),
    title,
    nodes: [],
    edges: [],
    frames: [],
    createdAt: now,
    updatedAt: now,
  };
  saveBoard(board);
  return board;
}

export function createBoardFromTemplate(templateId: string): Board {
  const def = getTemplateDef(templateId);
  const { nodes, frames } = buildTemplate(templateId);
  const now = new Date().toISOString();
  const board: Board = {
    id: crypto.randomUUID(),
    title: def?.defaultTitle ?? "新規ボード",
    templateType: templateId,
    tags: def ? [def.name] : undefined,
    nodes,
    edges: [],
    frames,
    createdAt: now,
    updatedAt: now,
  };
  saveBoard(board);
  return board;
}
