"use client";

import { type NodeProps } from "@xyflow/react";
import { Server } from "lucide-react";
import { resolveColor } from "@/lib/colors";
import { EditableText, NodeHandles, Resizer } from "./shared";

/** システム構成図のシステムノード（Salesforce / MA / 基幹 など） */
export default function SystemNode({ id, data, selected }: NodeProps) {
  const c = resolveColor((data.color as string) ?? "blue");
  const subtitle = (data.subtitle as string) ?? "";
  return (
    <div
      className="group flex h-full w-full items-center gap-2.5 rounded-lg bg-white px-3 shadow-sm"
      style={{ border: `1.5px solid ${c.border}` }}
    >
      <Resizer selected={selected} minWidth={120} minHeight={64} />
      <NodeHandles />
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md" style={{ background: c.bg }}>
        <Server className="h-5 w-5 text-slate-600" />
      </span>
      <div className="min-w-0 flex-1">
        <EditableText
          nodeId={id}
          field="title"
          value={(data.title as string) ?? ""}
          placeholder="システム名"
          className="text-sm font-semibold text-slate-800"
          multiline={false}
          primary
        />
        {subtitle && <div className="truncate text-xs text-slate-500">{subtitle}</div>}
      </div>
    </div>
  );
}
