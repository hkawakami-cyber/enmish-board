"use client";

import { type NodeProps } from "@xyflow/react";
import { resolveColor } from "@/lib/colors";
import { EditableText, NodeHandles, NodeMeta, Resizer } from "./shared";

export default function StickyNode({ id, data, selected }: NodeProps) {
  const c = resolveColor(data.color as string);
  const fontSize = (data.fontSize as number) ?? 14;
  return (
    <div
      className="group relative flex h-full w-full flex-col rounded-xl p-3 shadow-[0_4px_14px_rgba(20,30,60,0.08)]"
      style={{ background: c.bg, border: `1px solid ${c.border}`, fontSize }}
    >
      <Resizer selected={selected} />
      <NodeHandles />
      {Boolean(data.collapsed) && (
        <span className="absolute -right-2 -top-2 rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-white shadow" title="折りたたみ中（c で展開）">
          ＋
        </span>
      )}
      <NodeMeta data={data as Record<string, unknown>} />
      <EditableText
        nodeId={id}
        field="title"
        value={(data.title as string) ?? ""}
        placeholder="タイトル"
        className="font-semibold text-slate-800"
        primary
      />
      <EditableText
        nodeId={id}
        field="body"
        value={(data.body as string) ?? ""}
        placeholder="内容を入力（ダブルクリック）"
        className="mt-1 flex-1 text-slate-600"
      />
    </div>
  );
}
