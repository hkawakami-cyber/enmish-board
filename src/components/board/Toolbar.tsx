"use client";

import { useState } from "react";
import Link from "next/link";
import { useReactFlow } from "@xyflow/react";
import {
  ChevronLeft,
  Save,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Check,
  LayoutGrid,
  Wand2,
  ChevronDown,
  Network,
  GitBranch,
  Workflow,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import type { LayoutKind } from "@/lib/layout";
import { useBoardStore } from "@/stores/boardStore";
import ExportModal from "./ExportModal";
import AIPanel from "./AIPanel";

export default function Toolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const title = useBoardStore((s) => s.title);
  const setTitle = useBoardStore((s) => s.setTitle);
  const save = useBoardStore((s) => s.save);
  const undo = useBoardStore((s) => s.undo);
  const redo = useBoardStore((s) => s.redo);
  const dirty = useBoardStore((s) => s.dirty);
  const lastSavedAt = useBoardStore((s) => s.lastSavedAt);
  const canUndo = useBoardStore((s) => s.past.length > 0);
  const canRedo = useBoardStore((s) => s.future.length > 0);
  const autoLayout = useBoardStore((s) => s.autoLayout);
  const clientMode = useBoardStore((s) => s.clientMode);
  const toggleClientMode = useBoardStore((s) => s.toggleClientMode);

  const [showExport, setShowExport] = useState(false);
  const [showLayout, setShowLayout] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const runLayout = (kind: LayoutKind) => {
    autoLayout(kind);
    setShowLayout(false);
    setTimeout(() => fitView({ padding: 0.3, duration: 400 }), 30);
  };

  const LAYOUTS: { kind: LayoutKind; label: string; desc: string; icon: React.ReactNode }[] = [
    { kind: "mindmap", label: "マインドマップ", desc: "中心から枝を横展開", icon: <Network className="h-4 w-4" /> },
    { kind: "tree", label: "ロジックツリー", desc: "論点・課題を横に分解", icon: <GitBranch className="h-4 w-4" /> },
    { kind: "flow", label: "フロー図", desc: "上から下へ流れを整列", icon: <Workflow className="h-4 w-4" /> },
  ];

  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <header className="flex h-14 items-center gap-2 border-b border-border bg-panel px-3">
      <Link href="/boards" className={iconBtn} title="ボード一覧へ戻る">
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-sm">
        <LayoutGrid className="h-4 w-4" />
      </span>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-56 rounded-md px-2 py-1 text-sm font-semibold text-slate-900 outline-none hover:bg-slate-50 focus:bg-slate-50 focus:ring-1 focus:ring-slate-300"
        placeholder="ボード名"
      />

      {/* 保存状態 */}
      <span className="ml-1 flex items-center gap-1 text-xs text-slate-400">
        {dirty ? (
          <span className="text-amber-600">● 未保存の変更</span>
        ) : (
          <>
            <Check className="h-3.5 w-3.5 text-green-500" />
            保存済み
            {lastSavedAt && <span className="hidden sm:inline">（{new Date(lastSavedAt).toLocaleTimeString("ja-JP")}）</span>}
          </>
        )}
      </span>

      <div className="ml-auto flex items-center gap-1">
        <button onClick={undo} disabled={!canUndo} className={iconBtn} title="元に戻す (Cmd+Z)">
          <Undo2 className="h-5 w-5" />
        </button>
        <button onClick={redo} disabled={!canRedo} className={iconBtn} title="やり直す (Cmd+Shift+Z)">
          <Redo2 className="h-5 w-5" />
        </button>

        <div className="mx-1 h-6 w-px bg-border" />

        <button onClick={() => zoomOut()} className={iconBtn} title="ズームアウト">
          <ZoomOut className="h-5 w-5" />
        </button>
        <button onClick={() => zoomIn()} className={iconBtn} title="ズームイン">
          <ZoomIn className="h-5 w-5" />
        </button>
        <button onClick={() => fitView({ padding: 0.3, duration: 300 })} className={iconBtn} title="表示リセット">
          <Maximize className="h-5 w-5" />
        </button>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* 図解に変換（オートレイアウト） */}
        <div className="relative">
          <button
            onClick={() => setShowLayout((v) => !v)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            title="付箋を図解に整える（選択中なら選択分のみ）"
          >
            <Wand2 className="h-4 w-4" />
            図解に変換
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showLayout && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowLayout(false)} />
              <div className="absolute right-0 z-40 mt-1 w-60 rounded-lg border border-border bg-white p-1 shadow-lg">
                <p className="px-2.5 py-1.5 text-[11px] text-slate-400">
                  カードをエッジでつないでから実行すると、その親子構造で整列します
                </p>
                {LAYOUTS.map((l) => (
                  <button
                    key={l.kind}
                    onClick={() => runLayout(l.kind)}
                    className="flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-slate-100"
                  >
                    <span className="mt-0.5 text-slate-500">{l.icon}</span>
                    <span>
                      <span className="block text-sm font-medium text-slate-800">{l.label}</span>
                      <span className="block text-xs text-slate-500">{l.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 顧客共有モード */}
        <button
          onClick={toggleClientMode}
          className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium ${
            clientMode
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-border text-slate-700 hover:bg-slate-50"
          }`}
          title="内部メモを隠して顧客に共有できる表示に切り替え"
        >
          {clientMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {clientMode ? "顧客共有" : "社内"}
        </button>

        <div className="mx-1 h-6 w-px bg-border" />

        <button
          onClick={() => setShowAI(true)}
          className="flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-100"
        >
          <Sparkles className="h-4 w-4" />
          AI
        </button>
        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          エクスポート
        </button>
        <button
          onClick={save}
          className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Save className="h-4 w-4" />
          保存
        </button>
      </div>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showAI && <AIPanel onClose={() => setShowAI(false)} />}
    </header>
  );
}
