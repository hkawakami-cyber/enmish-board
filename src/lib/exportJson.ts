// ボード全体を JSON として出力する。バックアップや将来の DB 保存に使う。

import type { Board } from "@/types/board";
import { downloadText, safeFileName } from "./download";

export function boardToJson(board: Board): string {
  return JSON.stringify(board, null, 2);
}

export function exportBoardJson(board: Board) {
  downloadText(`${safeFileName(board.title)}.json`, boardToJson(board), "application/json");
}
