"use client";

// キーボードショートカット。入力中（input/textarea/contenteditable）は
// グローバル操作（保存・Undo/Redo）以外を無効化する。

import { useEffect } from "react";
import { useBoardStore } from "@/stores/boardStore";
import { getAddPosition } from "./canvasInstance";
import type { NodeType } from "@/types/board";

const ADD_KEYS: Record<string, NodeType | "frame"> = {
  n: "sticky",
  t: "text",
  p: "process",
  k: "kpi",
  a: "task",
  f: "frame",
  d: "decision",
  o: "terminal",
  s: "system",
  b: "object",
};

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useBoardStore.getState();
      const mod = e.metaKey || e.ctrlKey;

      // グローバル（入力中でも有効）
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        s.save();
        return;
      }
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        s.redo();
        return;
      }

      if (isTyping(e.target)) return;

      // コピー（ペーストは paste イベントで処理）
      if (mod && e.key.toLowerCase() === "c") {
        s.copySelected();
        return;
      }

      if (mod) return; // 他の Cmd 系は無視

      // 削除
      if (e.key === "Delete" || e.key === "Backspace") {
        if (s.selectedId) {
          e.preventDefault();
          s.deleteSelected();
        }
        return;
      }

      // 選択解除
      if (e.key === "Escape") {
        s.setSelected(null);
        return;
      }

      // カード追加
      const type = ADD_KEYS[e.key.toLowerCase()];
      if (type) {
        e.preventDefault();
        const pos = getAddPosition();
        if (type === "frame") s.addFrame(pos);
        else s.addNode(type, pos);
      }
    };

    // ペースト：テキストがあれば付箋化、なければ内部クリップボードのカードを貼り付け
    const onPaste = (e: ClipboardEvent) => {
      if (isTyping(e.target)) return;
      const text = e.clipboardData?.getData("text/plain") ?? "";
      const s = useBoardStore.getState();
      if (text.trim()) {
        e.preventDefault();
        s.pasteText(text);
      } else {
        e.preventDefault();
        s.pasteClipboard();
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("paste", onPaste);
    };
  }, []);
}
