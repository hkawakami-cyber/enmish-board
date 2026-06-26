"use client";

import { type NodeProps } from "@xyflow/react";
import { resolveColor } from "@/lib/colors";
import { EditableText, NodeHandles, Resizer } from "./shared";

export default function KpiNode({ id, data, selected }: NodeProps) {
  const c = resolveColor((data.color as string) ?? "green");
  const value = (data.value as string) ?? "";
  const unit = (data.unit as string) ?? "";
  return (
    <div
      className="group flex h-full w-full flex-col rounded-md p-3 shadow-sm"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <Resizer selected={selected} />
      <NodeHandles />
      <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        KPI
      </div>
      <EditableText
        nodeId={id}
        field="name"
        value={(data.name as string) ?? ""}
        placeholder="指標名"
        className="text-sm font-semibold text-slate-800"
        multiline={false}
        primary
      />
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-bold text-slate-900">{value || "—"}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      {(data.formula as string) && (
        <div className="mt-1 truncate text-xs text-slate-400" title={data.formula as string}>
          式: {data.formula as string}
        </div>
      )}
    </div>
  );
}
