"use client";

import { type NodeProps } from "@xyflow/react";
import { resolveColor } from "@/lib/colors";
import { EditableText, NodeHandles, Resizer } from "./shared";

export default function TextNode({ id, data, selected }: NodeProps) {
  const c = resolveColor((data.color as string) ?? "white");
  const fontSize = (data.fontSize as number) ?? 14;
  return (
    <div
      className="group flex h-full w-full flex-col rounded-md p-3"
      style={{ background: c.bg, border: `1px solid ${c.border}`, fontSize }}
    >
      <Resizer selected={selected} minHeight={60} />
      <NodeHandles />
      <EditableText
        nodeId={id}
        field="body"
        value={(data.body as string) ?? ""}
        placeholder="テキストを入力（ダブルクリック）"
        className="flex-1 leading-relaxed text-slate-700"
      />
    </div>
  );
}
