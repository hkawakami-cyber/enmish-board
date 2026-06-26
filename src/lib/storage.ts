// localStorage への読み書きを集約する。
// 将来 DB へ移行する場合は、この層の関数を差し替えるだけで済むようにする。

import type { Board, BoardMeta } from "@/types/board";

const STORAGE_KEY = "enmish-board:boards";

function isBrowser() {
  return typeof window !== "undefined";
}

function readAll(): Board[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Board[];
  } catch (e) {
    console.error("ボードの読み込みに失敗しました", e);
    return [];
  }
}

function writeAll(boards: Board[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (e) {
    console.error("ボードの保存に失敗しました", e);
  }
}

export function listBoards(): BoardMeta[] {
  return readAll()
    .map((b) => ({
      id: b.id,
      title: b.title,
      templateType: b.templateType,
      tags: b.tags,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getBoard(id: string): Board | null {
  return readAll().find((b) => b.id === id) ?? null;
}

export function saveBoard(board: Board): void {
  const boards = readAll();
  const idx = boards.findIndex((b) => b.id === board.id);
  if (idx >= 0) {
    boards[idx] = board;
  } else {
    boards.push(board);
  }
  writeAll(boards);
}

export function deleteBoard(id: string): void {
  writeAll(readAll().filter((b) => b.id !== id));
}

export function duplicateBoard(id: string): Board | null {
  const boards = readAll();
  const src = boards.find((b) => b.id === id);
  if (!src) return null;
  const now = new Date().toISOString();
  const copy: Board = {
    ...structuredClone(src),
    id: crypto.randomUUID(),
    title: `${src.title} のコピー`,
    createdAt: now,
    updatedAt: now,
  };
  boards.push(copy);
  writeAll(boards);
  return copy;
}

export function renameBoard(id: string, title: string): void {
  const board = getBoard(id);
  if (!board) return;
  board.title = title;
  board.updatedAt = new Date().toISOString();
  saveBoard(board);
}
