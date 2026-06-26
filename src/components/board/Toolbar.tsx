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
} from "lucide-react";
import { useBoardStore } from "@/stores/boardStore";
import ExportModal from "./ExportModal";

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

  const [showExport, setShowExport] = useState(false);

  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <header className="flex h-14 items-center gap-2 border-b border-border bg-panel px-3">
      <Link href="/boards" className={iconBtn} title="ボード一覧へ戻る">
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
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
    </header>
  );
}
