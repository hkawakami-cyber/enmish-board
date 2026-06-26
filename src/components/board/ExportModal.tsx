"use client";

import { useState } from "react";
import { X, FileJson, FileText, Image as ImageIcon, ClipboardList, FileSignature, Table } from "lucide-react";
import { useBoardStore } from "@/stores/boardStore";
import { exportBoardJson } from "@/lib/exportJson";
import { exportBoardMarkdown } from "@/lib/exportMarkdown";
import { exportBoardMinutes, exportBoardProposal, exportBoardFieldSpec } from "@/lib/exportDocs";
import { exportBoardImage } from "@/lib/exportImage";

export default function ExportModal({ onClose }: { onClose: () => void }) {
  const serialize = useBoardStore((s) => s.serialize);
  const nodes = useBoardStore((s) => s.nodes);
  const title = useBoardStore((s) => s.title);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleJson = () => {
    exportBoardJson(serialize());
    onClose();
  };

  const handleMarkdown = () => {
    exportBoardMarkdown(serialize());
    onClose();
  };

  const handleMinutes = () => {
    exportBoardMinutes(serialize());
    onClose();
  };

  const handleProposal = () => {
    exportBoardProposal(serialize());
    onClose();
  };

  const handleFieldSpec = () => {
    exportBoardFieldSpec(serialize());
    onClose();
  };

  const handlePng = async () => {
    setError(null);
    setBusy("png");
    try {
      await exportBoardImage(nodes, title);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "PNG出力に失敗しました");
    } finally {
      setBusy(null);
    }
  };

  const items = [
    { id: "minutes", icon: <ClipboardList className="h-6 w-6" />, label: "議事録", desc: "分類をもとに確認事項・未決・宿題を構造化。", onClick: handleMinutes },
    { id: "proposal", icon: <FileSignature className="h-6 w-6" />, label: "提案骨子", desc: "現状・課題・解決方針…の章立てを生成（内部メモは除外）。", onClick: handleProposal },
    { id: "fieldspec", icon: <Table className="h-6 w-6" />, label: "項目定義書", desc: "オブジェクトの項目を表に（Salesforce/SIer）。", onClick: handleFieldSpec },
    { id: "md", icon: <FileText className="h-6 w-6" />, label: "Markdown（ボード全体）", desc: "フレーム単位でそのまま書き出し。", onClick: handleMarkdown },
    { id: "json", icon: <FileJson className="h-6 w-6" />, label: "JSON", desc: "ボード全体のデータ。バックアップや再取り込みに。", onClick: handleJson },
    { id: "png", icon: <ImageIcon className="h-6 w-6" />, label: "PNG画像", desc: "キャンバス全体を画像として書き出し。", onClick: handlePng },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">エクスポート</h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100" aria-label="閉じる">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2 p-6">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={it.onClick}
              disabled={busy !== null}
              className="flex w-full items-center gap-4 rounded-xl border border-border p-4 text-left transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
            >
              <span className="text-slate-500">{it.icon}</span>
              <span className="flex-1">
                <span className="block font-semibold text-slate-900">
                  {it.label}
                  {busy === it.id && <span className="ml-2 text-xs text-slate-400">書き出し中…</span>}
                </span>
                <span className="block text-sm text-slate-500">{it.desc}</span>
              </span>
            </button>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
