"use client";

import { type NodeProps, NodeResizer } from "@xyflow/react";
import { resolveFrameColor } from "@/lib/colors";
import { useBoardStore } from "@/stores/boardStore";
import { EditableText } from "./shared";

export default function FrameNode({ id, data, selected }: NodeProps) {
  const c = resolveFrameColor(data.color as string);
  const begin = useBoardStore((s) => s.beginInteraction);
  return (
    <div
      className="h-full w-full rounded-lg"
      style={{ background: c.bg, border: `1.5px dashed ${c.border}` }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={140}
        color={c.border}
        onResizeStart={() => begin()}
      />
      <div
        className="inline-block rounded-br-lg rounded-tl-lg px-3 py-1 text-sm font-semibold text-white"
        style={{ background: c.border }}
      >
        <EditableText
          nodeId={id}
          field="title"
          value={(data.title as string) ?? ""}
          placeholder="フレーム名"
          className="min-w-[60px] text-white"
          multiline={false}
          primary
        />
      </div>
    </div>
  );
}
