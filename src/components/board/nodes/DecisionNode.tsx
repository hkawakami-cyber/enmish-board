"use client";

import { type NodeProps } from "@xyflow/react";
import { resolveColor } from "@/lib/colors";
import { EditableText, NodeHandles, Resizer } from "./shared";

/** フロー図の判断（分岐）ノード。ひし形で表示する。 */
export default function DecisionNode({ id, data, selected }: NodeProps) {
  const c = resolveColor((data.color as string) ?? "yellow");
  return (
    <div className="group relative h-full w-full">
      <Resizer selected={selected} minWidth={120} minHeight={80} />
      <NodeHandles />
      {/* ひし形の背景 */}
      <div
        className="absolute inset-0"
        style={{
          background: c.bg,
          border: `1px solid ${c.border}`,
          clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
        }}
      />
      {/* テキストはひし形の内側中央に */}
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <EditableText
          nodeId={id}
          field="title"
          value={(data.title as string) ?? ""}
          placeholder="分岐？"
          className="w-full text-xs font-semibold text-slate-800"
          multiline={false}
          primary
        />
      </div>
    </div>
  );
}
