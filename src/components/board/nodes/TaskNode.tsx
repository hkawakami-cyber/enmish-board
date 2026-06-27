"use client";

import { type NodeProps } from "@xyflow/react";
import { User, Calendar } from "lucide-react";
import { resolveColor } from "@/lib/colors";
import { EditableText, NodeHandles, Resizer } from "./shared";

const STATUS_STYLE: Record<string, string> = {
  未着手: "bg-slate-100 text-slate-600",
  進行中: "bg-blue-100 text-blue-700",
  完了: "bg-green-100 text-green-700",
  保留: "bg-amber-100 text-amber-700",
};

const PRIORITY_STYLE: Record<string, string> = {
  高: "bg-red-100 text-red-700",
  中: "bg-amber-100 text-amber-700",
  低: "bg-slate-100 text-slate-600",
};

export default function TaskNode({ id, data, selected }: NodeProps) {
  const c = resolveColor((data.color as string) ?? "purple");
  const status = (data.status as string) ?? "未着手";
  const priority = (data.priority as string) ?? "";
  const assignee = (data.assignee as string) ?? "";
  const dueDate = (data.dueDate as string) ?? "";
  return (
    <div
      className="group flex h-full w-full flex-col rounded-xl bg-white p-3 shadow-[0_4px_14px_rgba(20,30,60,0.08)]"
      style={{ border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.swatch}` }}
    >
      <Resizer selected={selected} />
      <NodeHandles />
      <div className="flex items-center gap-1.5">
        <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[status] ?? STATUS_STYLE.未着手}`}>
          {status}
        </span>
        {priority && (
          <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${PRIORITY_STYLE[priority] ?? ""}`}>
            優先度: {priority}
          </span>
        )}
      </div>
      <EditableText
        nodeId={id}
        field="title"
        value={(data.title as string) ?? ""}
        placeholder="タスク名"
        className="mt-1.5 flex-1 text-sm font-semibold text-slate-800"
        primary
      />
      <div className="mt-1 space-y-0.5 text-xs text-slate-500">
        {assignee && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {assignee}
          </div>
        )}
        {dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {dueDate}
          </div>
        )}
      </div>
    </div>
  );
}
