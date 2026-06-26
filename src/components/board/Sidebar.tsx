"use client";

import { useState } from "react";
import {
  StickyNote,
  Type,
  Workflow,
  Target,
  CheckSquare,
  Frame as FrameIcon,
  LayoutTemplate,
  Diamond,
  Circle,
} from "lucide-react";
import type { NodeType } from "@/types/board";
import { useBoardStore, insertTemplateNodes } from "@/stores/boardStore";
import { getAddPosition } from "@/lib/canvasInstance";
import { buildTemplate } from "@/lib/templates";
import TemplateModal from "./TemplateModal";

interface ToolItem {
  type: NodeType | "frame";
  label: string;
  key: string;
  icon: React.ReactNode;
}

const TOOLS: ToolItem[] = [
  { type: "sticky", label: "付箋", key: "N", icon: <StickyNote className="h-5 w-5" /> },
  { type: "text", label: "テキスト", key: "T", icon: <Type className="h-5 w-5" /> },
  { type: "process", label: "プロセス", key: "P", icon: <Workflow className="h-5 w-5" /> },
  { type: "kpi", label: "KPI", key: "K", icon: <Target className="h-5 w-5" /> },
  { type: "task", label: "タスク", key: "A", icon: <CheckSquare className="h-5 w-5" /> },
  { type: "frame", label: "フレーム", key: "F", icon: <FrameIcon className="h-5 w-5" /> },
];

// フロー図向けの図解ノード
const FLOW_TOOLS: ToolItem[] = [
  { type: "decision", label: "分岐", key: "D", icon: <Diamond className="h-5 w-5" /> },
  { type: "terminal", label: "開始終了", key: "O", icon: <Circle className="h-5 w-5" /> },
];

export default function Sidebar() {
  const addNode = useBoardStore((s) => s.addNode);
  const addFrame = useBoardStore((s) => s.addFrame);
  const [showTemplate, setShowTemplate] = useState(false);

  const handleAdd = (type: NodeType | "frame") => {
    const pos = getAddPosition();
    if (type === "frame") addFrame(pos);
    else addNode(type, pos);
  };

  const handleInsertTemplate = (templateId: string) => {
    const { nodes, frames } = buildTemplate(templateId);
    insertTemplateNodes(nodes, frames);
    setShowTemplate(false);
  };

  return (
    <aside className="flex w-20 flex-col items-center gap-1 border-r border-border bg-panel py-3">
      {TOOLS.map((t) => (
        <button
          key={t.type}
          onClick={() => handleAdd(t.type)}
          className="group flex w-16 flex-col items-center gap-1 rounded-lg py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          title={`${t.label}を追加（${t.key}）`}
        >
          {t.icon}
          <span className="text-[11px] font-medium">{t.label}</span>
        </button>
      ))}

      <div className="my-1 h-px w-12 bg-border" />

      {FLOW_TOOLS.map((t) => (
        <button
          key={t.type}
          onClick={() => handleAdd(t.type)}
          className="group flex w-16 flex-col items-center gap-1 rounded-lg py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          title={`${t.label}を追加（${t.key}）`}
        >
          {t.icon}
          <span className="text-[11px] font-medium">{t.label}</span>
        </button>
      ))}

      <div className="my-1 h-px w-12 bg-border" />

      <button
        onClick={() => setShowTemplate(true)}
        className="flex w-16 flex-col items-center gap-1 rounded-lg py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        title="テンプレートを挿入"
      >
        <LayoutTemplate className="h-5 w-5" />
        <span className="text-[11px] font-medium">テンプレ</span>
      </button>

      {showTemplate && (
        <TemplateModal
          title="テンプレートを挿入"
          description="現在のボードに整理の型を追加します。"
          onSelect={handleInsertTemplate}
          onClose={() => setShowTemplate(false)}
        />
      )}
    </aside>
  );
}
