"use client";

import { type NodeProps } from "@xyflow/react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useBoardStore } from "@/stores/boardStore";
import { EditableText, NodeHandles } from "./shared";

/**
 * NotebookLM 風のマインドマップ・ノード。
 * 淡い角丸ピル型。ルートは濃いラベンダー、子は淡色。子があれば開閉シェブロン。
 */
export default function MindNode({ id, data }: NodeProps) {
  const isRoot = Boolean(data.isRoot);
  const hasChildren = useBoardStore((s) => s.edges.some((e) => e.source === id));
  const collapsed = Boolean(data.collapsed);
  const toggleCollapse = useBoardStore((s) => s.toggleCollapse);

  const base = isRoot
    ? "bg-gradient-to-br from-violet-400 to-indigo-400 text-white border-transparent"
    : "bg-indigo-50 text-slate-700 border-indigo-100";

  return (
    <div className="group relative h-full w-full">
      <NodeHandles />
      <div
        className={`flex h-full w-full items-center justify-center rounded-2xl border px-4 text-center shadow-[0_4px_14px_rgba(79,70,229,0.12)] ${base}`}
      >
        <EditableText
          nodeId={id}
          field="title"
          value={(data.title as string) ?? ""}
          placeholder={isRoot ? "中心テーマ" : "項目"}
          className={`w-full text-sm font-semibold leading-tight ${isRoot ? "text-white placeholder:text-white/70" : "text-slate-700"}`}
          multiline={false}
          primary
        />
      </div>

      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse(id);
          }}
          className="absolute top-1/2 -right-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-indigo-200 bg-white text-indigo-500 shadow-sm transition hover:bg-indigo-50"
          title={collapsed ? "展開（c）" : "折りたたみ（c）"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}
