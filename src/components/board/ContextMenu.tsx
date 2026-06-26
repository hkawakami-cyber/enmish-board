"use client";

import { useEffect } from "react";
import {
  Copy,
  Trash2,
  ArrowUpToLine,
  ArrowDownToLine,
  StickyNote,
  Type,
  Frame as FrameIcon,
} from "lucide-react";
import { useBoardStore } from "@/stores/boardStore";
import type { NodeType } from "@/types/board";

export interface MenuState {
  /** 画面上の表示位置(px) */
  x: number;
  y: number;
  /** 対象ノード（null ならキャンバス空白） */
  nodeId: string | null;
  /** 空白メニューでの追加位置（フロー座標） */
  flowPos?: { x: number; y: number };
}

interface Props {
  menu: MenuState;
  onClose: () => void;
}

function Item({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm ${
        danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function ContextMenu({ menu, onClose }: Props) {
  const addNode = useBoardStore((s) => s.addNode);
  const addFrame = useBoardStore((s) => s.addFrame);
  const duplicateNode = useBoardStore((s) => s.duplicateNode);
  const deleteNode = useBoardStore((s) => s.deleteNode);
  const bringToFront = useBoardStore((s) => s.bringToFront);
  const sendToBack = useBoardStore((s) => s.sendToBack);

  useEffect(() => {
    const close = () => onClose();
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [onClose]);

  const run = (fn: () => void) => () => {
    fn();
    onClose();
  };

  const addAt = (type: NodeType) => () => {
    if (menu.flowPos) addNode(type, menu.flowPos);
    onClose();
  };

  return (
    <div
      className="fixed z-50 min-w-[180px] rounded-lg border border-border bg-white p-1 shadow-lg"
      style={{ left: menu.x, top: menu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {menu.nodeId ? (
        <>
          <Item icon={<Copy className="h-4 w-4" />} label="複製" onClick={run(() => duplicateNode(menu.nodeId!))} />
          <Item icon={<ArrowUpToLine className="h-4 w-4" />} label="最前面へ" onClick={run(() => bringToFront(menu.nodeId!))} />
          <Item icon={<ArrowDownToLine className="h-4 w-4" />} label="最背面へ" onClick={run(() => sendToBack(menu.nodeId!))} />
          <div className="my-1 h-px bg-border" />
          <Item icon={<Trash2 className="h-4 w-4" />} label="削除" danger onClick={run(() => deleteNode(menu.nodeId!))} />
        </>
      ) : (
        <>
          <Item icon={<StickyNote className="h-4 w-4" />} label="付箋を追加" onClick={addAt("sticky")} />
          <Item icon={<Type className="h-4 w-4" />} label="テキストを追加" onClick={addAt("text")} />
          <Item
            icon={<FrameIcon className="h-4 w-4" />}
            label="フレームを追加"
            onClick={() => {
              if (menu.flowPos) addFrame(menu.flowPos);
              onClose();
            }}
          />
        </>
      )}
    </div>
  );
}
