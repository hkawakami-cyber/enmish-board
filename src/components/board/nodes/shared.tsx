"use client";

// カードノード共通の部品。ハンドル、リサイザー、インライン編集テキスト。

import { useEffect, useRef, useState } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { EyeOff } from "lucide-react";
import { useBoardStore } from "@/stores/boardStore";
import { getCategory } from "@/lib/categories";

const HANDLE_POSITIONS = [Position.Top, Position.Right, Position.Bottom, Position.Left];

/** 上下左右に接続ハンドルを置く（ConnectionMode.Loose 前提で source/target 兼用） */
export function NodeHandles() {
  return (
    <>
      {HANDLE_POSITIONS.map((pos) => (
        <Handle
          key={pos}
          id={pos}
          type="source"
          position={pos}
          className="!opacity-0 transition-opacity group-hover:!opacity-100"
        />
      ))}
    </>
  );
}

export function Resizer({ selected, minWidth = 140, minHeight = 80 }: { selected?: boolean; minWidth?: number; minHeight?: number }) {
  const begin = useBoardStore((s) => s.beginInteraction);
  return (
    <NodeResizer
      isVisible={selected}
      minWidth={minWidth}
      minHeight={minHeight}
      color="#475569"
      handleStyle={{ width: 8, height: 8 }}
      lineStyle={{ borderColor: "#94a3b8" }}
      onResizeStart={() => begin()}
    />
  );
}

/** カードに分類バッジ・発言者・内部メモ印を表示する */
export function NodeMeta({ data }: { data: Record<string, unknown> }) {
  const cat = getCategory(data.category as string);
  const speaker = data.speaker as string | undefined;
  const internal = Boolean(data.isInternal);
  if (!cat && !speaker && !internal) return null;
  return (
    <div className="mb-1 flex flex-wrap items-center gap-1">
      {cat && <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${cat.badge}`}>{cat.label}</span>}
      {speaker && <span className="rounded bg-white/70 px-1.5 py-0.5 text-[10px] text-slate-500">{speaker}</span>}
      {internal && <EyeOff className="h-3 w-3 text-slate-400" aria-label="内部メモ" />}
    </div>
  );
}

interface EditableProps {
  nodeId: string;
  field: string;
  value: string;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  /** カードの主テキスト。作成直後はここが自動的に編集状態になる */
  primary?: boolean;
}

/** ダブルクリックで編集に切り替わるテキスト */
export function EditableText({ nodeId, field, value, placeholder, className, multiline = true, primary }: EditableProps) {
  const update = useBoardStore((s) => s.updateNodeData);
  const begin = useBoardStore((s) => s.beginInteraction);
  const addChild = useBoardStore((s) => s.addChildNode);
  const addSibling = useBoardStore((s) => s.addSiblingNode);
  const autoEdit = useBoardStore((s) => primary && s.autoEditId === nodeId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  // 作成直後（autoEditId が一致）なら自動で編集に入る
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (autoEdit) {
      setDraft(value);
      setEditing(true);
      useBoardStore.getState().clearAutoEdit();
    }
    // value を依存に含めると入力途中で再発火するため意図的に除外
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoEdit]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  const startEditing = () => {
    begin();
    setDraft(value);
    setEditing(true);
  };

  const commit = (after?: () => void) => {
    setEditing(false);
    if (draft !== value) update(nodeId, { [field]: draft });
    after?.();
  };

  if (editing) {
    return (
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit()}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
            return;
          }
          // 主テキストはマインドマップ操作も兼ねる：
          //   Tab=確定して子を追加 / Enter=確定して兄弟を追加（Shift+Enterで改行）
          if (primary && e.key === "Tab") {
            e.preventDefault();
            commit(() => addChild(nodeId));
            return;
          }
          if (primary && e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            commit(() => addSibling(nodeId));
            return;
          }
          if (e.key === "Enter" && !multiline) {
            e.preventDefault();
            commit();
          }
        }}
        className={`nodrag w-full resize-none rounded bg-white/70 px-1 py-0.5 outline-none ring-1 ring-slate-300 ${className ?? ""}`}
        rows={multiline ? 3 : 1}
      />
    );
  }

  return (
    <div
      onDoubleClick={(e) => {
        e.stopPropagation();
        startEditing();
      }}
      className={`whitespace-pre-wrap break-words ${value ? "" : "text-slate-400"} ${className ?? ""}`}
      title="ダブルクリックで編集"
    >
      {value || placeholder || ""}
    </div>
  );
}
