"use client";

import { Trash2, Copy, Info, EyeOff } from "lucide-react";
import { useBoardStore } from "@/stores/boardStore";
import { COLOR_LIST, FRAME_COLORS } from "@/lib/colors";
import { CATEGORIES, getCategory } from "@/lib/categories";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-border px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200";

const TYPE_LABEL: Record<string, string> = {
  sticky: "付箋",
  text: "テキスト",
  process: "プロセス",
  kpi: "KPI",
  task: "タスク",
  frame: "フレーム",
};

export default function RightPanel() {
  const selectedId = useBoardStore((s) => s.selectedId);
  const node = useBoardStore((s) => s.nodes.find((n) => n.id === s.selectedId));
  const update = useBoardStore((s) => s.updateNodeData);
  const setColor = useBoardStore((s) => s.setNodeColor);
  const del = useBoardStore((s) => s.deleteSelected);
  const dup = useBoardStore((s) => s.duplicateSelected);

  if (!selectedId || !node) {
    return (
      <aside className="w-72 shrink-0 border-l border-border bg-panel p-5">
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium text-slate-600">使い方</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed">
              <li>空白をダブルクリックで付箋を追加</li>
              <li>議事メモを ⌘V で貼ると行ごとに付箋化</li>
              <li>カードをドラッグで移動</li>
              <li>ダブルクリックでテキスト編集</li>
              <li>右クリックで複製・削除・前面/背面</li>
              <li>カードの端からドラッグで接続</li>
            </ul>
          </div>
        </div>
      </aside>
    );
  }

  const type = node.type ?? "sticky";
  const data = node.data as Record<string, unknown>;
  const val = (k: string) => (data[k] as string) ?? "";
  const set = (k: string, v: string) => update(node.id, { [k]: v });

  // カテゴリ選択時は対応する色も自動適用する
  const setCategory = (key: string) => {
    set("category", key);
    const def = getCategory(key);
    if (def) setColor(node.id, def.color);
  };
  const isInternal = Boolean(data.isInternal);

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-bold text-slate-900">{TYPE_LABEL[type]}の設定</span>
        <div className="flex gap-1">
          <button onClick={dup} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="複製">
            <Copy className="h-4 w-4" />
          </button>
          <button onClick={del} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="削除 (Delete)">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {/* タイトル / 名前 */}
        {(type === "sticky" || type === "process" || type === "task" || type === "frame") && (
          <Field label="タイトル">
            <input className={inputCls} value={val("title")} onChange={(e) => set("title", e.target.value)} />
          </Field>
        )}
        {type === "kpi" && (
          <Field label="指標名">
            <input className={inputCls} value={val("name")} onChange={(e) => set("name", e.target.value)} />
          </Field>
        )}

        {/* 本文 */}
        {(type === "sticky" || type === "text") && (
          <Field label="本文">
            <textarea className={`${inputCls} resize-none`} rows={4} value={val("body")} onChange={(e) => set("body", e.target.value)} />
          </Field>
        )}

        {/* プロセス */}
        {type === "process" && (
          <>
            <Field label="担当者"><input className={inputCls} value={val("owner")} onChange={(e) => set("owner", e.target.value)} /></Field>
            <Field label="入力情報"><input className={inputCls} value={val("input")} onChange={(e) => set("input", e.target.value)} /></Field>
            <Field label="出力情報"><input className={inputCls} value={val("output")} onChange={(e) => set("output", e.target.value)} /></Field>
            <Field label="課題・ボトルネック"><textarea className={`${inputCls} resize-none`} rows={2} value={val("issue")} onChange={(e) => set("issue", e.target.value)} /></Field>
            <Field label="状態"><input className={inputCls} value={val("status")} onChange={(e) => set("status", e.target.value)} /></Field>
          </>
        )}

        {/* KPI */}
        {type === "kpi" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Field label="数値"><input className={inputCls} value={val("value")} onChange={(e) => set("value", e.target.value)} /></Field>
              <Field label="単位"><input className={inputCls} value={val("unit")} onChange={(e) => set("unit", e.target.value)} /></Field>
            </div>
            <Field label="計算式"><input className={inputCls} value={val("formula")} onChange={(e) => set("formula", e.target.value)} /></Field>
            <Field label="説明"><textarea className={`${inputCls} resize-none`} rows={2} value={val("description")} onChange={(e) => set("description", e.target.value)} /></Field>
          </>
        )}

        {/* タスク */}
        {type === "task" && (
          <>
            <Field label="担当者"><input className={inputCls} value={val("assignee")} onChange={(e) => set("assignee", e.target.value)} /></Field>
            <Field label="期限"><input type="date" className={inputCls} value={val("dueDate")} onChange={(e) => set("dueDate", e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="ステータス">
                <select className={inputCls} value={val("status") || "未着手"} onChange={(e) => set("status", e.target.value)}>
                  {["未着手", "進行中", "完了", "保留"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="優先度">
                <select className={inputCls} value={val("priority") || "中"} onChange={(e) => set("priority", e.target.value)}>
                  {["高", "中", "低"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </>
        )}

        {/* 文字サイズ（テキスト/付箋） */}
        {(type === "text" || type === "sticky") && (
          <Field label="文字サイズ">
            <select
              className={inputCls}
              value={String((data.fontSize as number) ?? 14)}
              onChange={(e) => update(node.id, { fontSize: Number(e.target.value) })}
            >
              {[12, 14, 16, 18, 20, 24].map((s) => <option key={s} value={s}>{s}px</option>)}
            </select>
          </Field>
        )}

        {/* MTG構造化（分類・発言者・内部メモ） */}
        {type !== "frame" && (
          <div className="space-y-3 rounded-lg bg-slate-50 p-3">
            <Field label="分類">
              <select className={inputCls} value={val("category")} onChange={(e) => setCategory(e.target.value)}>
                <option value="">未分類</option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="発言者">
              <input className={inputCls} value={val("speaker")} onChange={(e) => set("speaker", e.target.value)} placeholder="顧客A / 自社 など" />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => update(node.id, { isInternal: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              <EyeOff className="h-3.5 w-3.5 text-slate-400" />
              内部メモ（顧客共有モードで非表示）
            </label>
          </div>
        )}

        {/* 色 */}
        <Field label="色">
          {type === "frame" ? (
            <div className="flex flex-wrap gap-2">
              {FRAME_COLORS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setColor(node.id, c.key)}
                  className={`h-7 w-7 rounded-md border-2 ${data.color === c.key ? "ring-2 ring-slate-400 ring-offset-1" : ""}`}
                  style={{ borderColor: c.border, background: c.bg }}
                  title={c.label}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {COLOR_LIST.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setColor(node.id, c.key)}
                  className={`h-7 w-7 rounded-md border ${data.color === c.key ? "ring-2 ring-slate-400 ring-offset-1" : ""}`}
                  style={{ borderColor: c.border, background: c.bg }}
                  title={c.label}
                />
              ))}
            </div>
          )}
        </Field>

        {/* 共通: リンク・メモ */}
        {type !== "frame" && (
          <>
            <Field label="リンクURL"><input className={inputCls} value={val("linkUrl")} onChange={(e) => set("linkUrl", e.target.value)} placeholder="https://" /></Field>
            <Field label="メモ"><textarea className={`${inputCls} resize-none`} rows={2} value={val("memo")} onChange={(e) => set("memo", e.target.value)} /></Field>
          </>
        )}
      </div>
    </aside>
  );
}
