"use client";

import { type NodeProps } from "@xyflow/react";
import { resolveColor } from "@/lib/colors";
import { EditableText, NodeHandles, Resizer } from "./shared";

export default function StickyNode({ id, data, selected }: NodeProps) {
  const c = resolveColor(data.color as string);
  const fontSize = (data.fontSize as number) ?? 14;
  return (
    <div
      className="group flex h-full w-full flex-col rounded-md p-3 shadow-sm"
      style={{ background: c.bg, border: `1px solid ${c.border}`, fontSize }}
    >
      <Resizer selected={selected} />
      <NodeHandles />
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
