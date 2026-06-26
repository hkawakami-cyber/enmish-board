"use client";

import { type NodeProps } from "@xyflow/react";
import { resolveColor } from "@/lib/colors";
import { EditableText, NodeHandles, Resizer } from "./shared";

/** フロー図の開始/終了ノード。角丸（ピル形）で表示する。 */
export default function TerminalNode({ id, data, selected }: NodeProps) {
  const c = resolveColor((data.color as string) ?? "gray");
  return (
    <div
      className="group flex h-full w-full items-center justify-center rounded-full px-4 shadow-sm"
      style={{ background: c.bg, border: `1.5px solid ${c.border}` }}
    >
      <Resizer selected={selected} minWidth={90} minHeight={40} />
      <NodeHandles />
      <EditableText
        nodeId={id}
        field="title"
        value={(data.title as string) ?? ""}
        placeholder="開始 / 終了"
        className="w-full text-center text-sm font-semibold text-slate-700"
        multiline={false}
        primary
      />
    </div>
  );
}
