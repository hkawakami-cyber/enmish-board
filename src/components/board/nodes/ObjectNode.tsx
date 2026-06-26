"use client";

import { type NodeProps } from "@xyflow/react";
import { resolveColor } from "@/lib/colors";
import type { ObjectField } from "@/types/board";
import { EditableText, NodeHandles, Resizer } from "./shared";

/** ER/オブジェクト図のノード（Salesforceオブジェクト + 項目一覧） */
export default function ObjectNode({ id, data, selected }: NodeProps) {
  const c = resolveColor((data.color as string) ?? "purple");
  const fields = (data.fields as ObjectField[] | undefined) ?? [];
  return (
    <div
      className="group flex h-full w-full flex-col overflow-hidden rounded-lg bg-white shadow-sm"
      style={{ border: `1.5px solid ${c.border}` }}
    >
      <Resizer selected={selected} minWidth={160} minHeight={100} />
      <NodeHandles />
      <div className="px-3 py-1.5 text-sm font-bold text-white" style={{ background: c.swatch }}>
        <EditableText
          nodeId={id}
          field="name"
          value={(data.name as string) ?? ""}
          placeholder="オブジェクト名"
          className="text-white"
          multiline={false}
          primary
        />
      </div>
      <div className="flex-1 divide-y divide-slate-100 overflow-hidden text-xs">
        {fields.length === 0 ? (
          <div className="px-3 py-2 text-slate-400">右パネルで項目を追加</div>
        ) : (
          fields.map((f, i) => (
            <div key={i} className="flex items-center justify-between gap-2 px-3 py-1">
              <span className="truncate text-slate-700">
                {f.name || "(項目名)"}
                {f.required && <span className="ml-0.5 text-red-500">*</span>}
              </span>
              <span className="shrink-0 text-[10px] text-slate-400">{f.type}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
