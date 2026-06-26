"use client";

// カードノード共通の部品。ハンドル、リサイザー、インライン編集テキスト。

import { useEffect, useRef, useState } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { useBoardStore } from "@/stores/boardStore";

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

interface EditableProps {
  nodeId: string;
  field: string;
  value: string;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}

/** ダブルクリックで編集に切り替わるテキスト */
export function EditableText({ nodeId, field, value, placeholder, className, multiline = true }: EditableProps) {
  const update = useBoardStore((s) => s.updateNodeData);
  const begin = useBoardStore((s) => s.beginInteraction);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

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

  const commit = () => {
    setEditing(false);
    if (draft !== value) update(nodeId, { [field]: draft });
  };

  if (editing) {
    return (
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
          if (e.key === "Enter" && !multiline) {
            e.preventDefault();
            commit();
          }
          e.stopPropagation();
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
