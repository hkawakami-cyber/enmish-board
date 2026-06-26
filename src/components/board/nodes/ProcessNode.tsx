"use client";

import { type NodeProps } from "@xyflow/react";
import { resolveColor } from "@/lib/colors";
import { EditableText, NodeHandles, Resizer } from "./shared";

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-1 text-xs">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="truncate text-slate-600">{value}</span>
    </div>
  );
}

export default function ProcessNode({ id, data, selected }: NodeProps) {
  const c = resolveColor((data.color as string) ?? "blue");
  return (
    <div
      className="group flex h-full w-full flex-col overflow-hidden rounded-md shadow-sm"
      style={{ background: "#ffffff", border: `1px solid ${c.border}` }}
    >
      <Resizer selected={selected} />
      <NodeHandles />
      <div className="px-3 py-1.5 text-xs font-semibold text-white" style={{ background: c.swatch }}>
        プロセス
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <EditableText
          nodeId={id}
          field="title"
          value={(data.title as string) ?? ""}
          placeholder="工程名"
          className="text-sm font-semibold text-slate-800"
          multiline={false}
        />
        <Row label="担当" value={data.owner as string} />
        <Row label="入力" value={data.input as string} />
        <Row label="出力" value={data.output as string} />
        <Row label="課題" value={data.issue as string} />
        <Row label="状態" value={data.status as string} />
      </div>
    </div>
  );
}
