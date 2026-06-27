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
  Server,
  Database,
  Columns3,
  Network,
  GitBranch,
} from "lucide-react";
import type { NodeType } from "@/types/board";
import { useBoardStore, insertTemplateNodes } from "@/stores/boardStore";
import { getAddPosition } from "@/lib/canvasInstance";
import { buildTemplate } from "@/lib/templates";
import TemplateModal from "./TemplateModal";

interface ToolItem {
  type: NodeType | "frame";
  label: string;
  key?: string;
  icon: React.ReactNode;
}

const BASIC: ToolItem[] = [
  { type: "sticky", label: "付箋", key: "N", icon: <StickyNote className="h-5 w-5" /> },
  { type: "text", label: "テキスト", key: "T", icon: <Type className="h-5 w-5" /> },
  { type: "process", label: "プロセス", key: "P", icon: <Workflow className="h-5 w-5" /> },
  { type: "kpi", label: "KPI", key: "K", icon: <Target className="h-5 w-5" /> },
  { type: "task", label: "タスク", key: "A", icon: <CheckSquare className="h-5 w-5" /> },
  { type: "frame", label: "フレーム", key: "F", icon: <FrameIcon className="h-5 w-5" /> },
];

const DIAGRAM: ToolItem[] = [
  { type: "decision", label: "分岐", key: "D", icon: <Diamond className="h-5 w-5" /> },
  { type: "terminal", label: "開始終了", key: "O", icon: <Circle className="h-5 w-5" /> },
  { type: "system", label: "システム", key: "S", icon: <Server className="h-5 w-5" /> },
  { type: "object", label: "オブジェクト", key: "B", icon: <Database className="h-5 w-5" /> },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 px-1 text-center text-[9px] font-bold uppercase tracking-wide text-slate-300">
      {children}
    </div>
  );
}

export default function Sidebar() {
  const addNode = useBoardStore((s) => s.addNode);
  const addFrame = useBoardStore((s) => s.addFrame);
  const addSwimlane = useBoardStore((s) => s.addSwimlane);
  const [showTemplate, setShowTemplate] = useState(false);

  const handleAdd = (type: NodeType | "frame") => {
    const pos = getAddPosition();
    if (type === "frame") addFrame(pos);
    else addNode(type, pos);
  };

  const startMindmap = () => addNode("mind", getAddPosition(), { isRoot: true });
  const startFlow = () => addNode("terminal", getAddPosition(), { title: "開始" });

  const handleInsertTemplate = (templateId: string) => {
    const { nodes, frames } = buildTemplate(templateId);
    insertTemplateNodes(nodes, frames);
    setShowTemplate(false);
  };

  const toolBtn =
    "group flex w-full flex-col items-center gap-1 rounded-lg py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900";

  const renderTool = (t: ToolItem) => (
    <button
      key={t.type}
      onClick={() => handleAdd(t.type)}
      className={toolBtn}
      title={t.key ? `${t.label}を追加（${t.key}）` : `${t.label}を追加`}
    >
      {t.icon}
      <span className="text-[10px] font-medium leading-none">{t.label}</span>
    </button>
  );

  return (
    <aside className="flex w-20 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-border bg-panel py-2">
      {/* はじめる：ワンクリックスターター */}
      <Label>はじめる</Label>
      <button
        onClick={startMindmap}
        className="group mx-2 flex flex-col items-center gap-1 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 py-2 text-white shadow-sm transition hover:opacity-90"
        title="中心ノードを置いてマインドマップを開始（Tab=子 / Enter=兄弟）"
      >
        <Network className="h-5 w-5" />
        <span className="text-[10px] font-semibold leading-none">マップ</span>
      </button>
      <button
        onClick={startFlow}
        className="group mx-2 mt-1 flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-slate-700 transition hover:bg-slate-100"
        title="開始ノードを置いてフロー図を開始（つないで『図解に変換→フロー図』）"
      >
        <GitBranch className="h-5 w-5" />
        <span className="text-[10px] font-semibold leading-none">フロー</span>
      </button>

      <Label>追加</Label>
      {BASIC.map(renderTool)}

      <Label>図解</Label>
      {DIAGRAM.map(renderTool)}
      <button onClick={() => addSwimlane(4)} className={toolBtn} title="スイムレーン（4レーン）を挿入">
        <Columns3 className="h-5 w-5" />
        <span className="text-[10px] font-medium leading-none">レーン</span>
      </button>

      <div className="mx-3 my-1 h-px bg-border" />
      <button
        onClick={() => setShowTemplate(true)}
        className={toolBtn}
        title="テンプレートを挿入"
      >
        <LayoutTemplate className="h-5 w-5" />
        <span className="text-[10px] font-medium leading-none">テンプレ</span>
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
