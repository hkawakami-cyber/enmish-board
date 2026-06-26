"use client";

import { useEffect, useState } from "react";
import { X, Sparkles, Wand2, ClipboardList, FileSignature, Copy, Check, AlertCircle } from "lucide-react";
import { useBoardStore } from "@/stores/boardStore";
import { getCategory } from "@/lib/categories";
import { boardToMarkdown } from "@/lib/exportMarkdown";
import { aiClassify, aiMinutes, aiProposal } from "@/lib/ai";

type Busy = "classify" | "minutes" | "proposal" | null;

export default function AIPanel({ onClose }: { onClose: () => void }) {
  const nodes = useBoardStore((s) => s.nodes);
  const title = useBoardStore((s) => s.title);
  const serialize = useBoardStore((s) => s.serialize);
  const updateNodeData = useBoardStore((s) => s.updateNodeData);
  const setNodeColor = useBoardStore((s) => s.setNodeColor);
  const beginInteraction = useBoardStore((s) => s.beginInteraction);

  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [notConnected, setNotConnected] = useState(false);
  const [result, setResult] = useState<{ kind: string; markdown: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleError = (e: unknown) => {
    const err = e as { code?: string; message?: string };
    if (err.code === "no_key") setNotConnected(true);
    else setError(err.message || "AIの呼び出しに失敗しました");
  };

  const runClassify = async () => {
    setError(null);
    setNote(null);
    setBusy("classify");
    try {
      // 選択中の付箋/テキストがあればそれを、なければ全体を対象に
      const selected = nodes.filter((n) => n.selected && (n.type === "sticky" || n.type === "text"));
      const targets = (selected.length > 0 ? selected : nodes.filter((n) => n.type === "sticky" || n.type === "text"));
      const items = targets
        .map((n) => ({
          id: n.id,
          text: [n.data.title, n.data.body].filter(Boolean).join(" ").trim(),
        }))
        .filter((i) => i.text);
      if (items.length === 0) {
        setNote("分類できる付箋・テキストがありません。");
        return;
      }
      const { results } = await aiClassify(items);
      beginInteraction();
      for (const r of results) {
        updateNodeData(r.id, { category: r.category });
        const def = getCategory(r.category);
        if (def) setNodeColor(r.id, def.color);
      }
      setNote(`${results.length}件を分類しました。`);
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(null);
    }
  };

  const runDoc = async (kind: "minutes" | "proposal") => {
    setError(null);
    setNote(null);
    setResult(null);
    setBusy(kind);
    try {
      const md = boardToMarkdown(serialize());
      const { markdown } = kind === "minutes" ? await aiMinutes(title, md) : await aiProposal(title, md);
      setResult({ kind, markdown });
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(null);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Sparkles className="h-5 w-5 text-violet-500" />
            AIアシスタント
          </h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100" aria-label="閉じる">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {notConnected ? (
            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4" />
                AIは未接続です
              </div>
              <p className="mt-2 leading-relaxed">
                サーバーの環境変数 <code className="rounded bg-amber-100 px-1">ANTHROPIC_API_KEY</code> を設定すると、
                AIによる自動分類・議事録生成・提案骨子生成が有効になります。
              </p>
              <p className="mt-2 text-xs">
                設定後、ページを再読み込みしてください。モデルは <code className="rounded bg-amber-100 px-1">AI_MODEL</code> で変更できます（既定: claude-opus-4-8）。
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={runClassify}
                disabled={busy !== null}
                className="flex w-full items-center gap-3 rounded-xl border border-border p-4 text-left transition hover:border-violet-300 hover:bg-violet-50/40 disabled:opacity-50"
              >
                <Wand2 className="h-6 w-6 text-violet-500" />
                <span className="flex-1">
                  <span className="block font-semibold text-slate-900">
                    付箋をAIで分類{busy === "classify" && "…"}
                  </span>
                  <span className="block text-sm text-slate-500">
                    選択中の付箋（なければ全体）を背景/課題/要望/宿題…に振り分け、色を付けます。
                  </span>
                </span>
              </button>

              <button
                onClick={() => runDoc("minutes")}
                disabled={busy !== null}
                className="flex w-full items-center gap-3 rounded-xl border border-border p-4 text-left transition hover:border-violet-300 hover:bg-violet-50/40 disabled:opacity-50"
              >
                <ClipboardList className="h-6 w-6 text-slate-500" />
                <span className="flex-1">
                  <span className="block font-semibold text-slate-900">議事録をAI生成{busy === "minutes" && "…"}</span>
                  <span className="block text-sm text-slate-500">ボード内容から議事録の文章を作成します。</span>
                </span>
              </button>

              <button
                onClick={() => runDoc("proposal")}
                disabled={busy !== null}
                className="flex w-full items-center gap-3 rounded-xl border border-border p-4 text-left transition hover:border-violet-300 hover:bg-violet-50/40 disabled:opacity-50"
              >
                <FileSignature className="h-6 w-6 text-slate-500" />
                <span className="flex-1">
                  <span className="block font-semibold text-slate-900">提案骨子をAI生成{busy === "proposal" && "…"}</span>
                  <span className="block text-sm text-slate-500">ボード内容から提案書の骨子を作成します。</span>
                </span>
              </button>

              {note && <p className="text-sm text-emerald-600">{note}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}

              {result && (
                <div className="rounded-xl border border-border">
                  <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {result.kind === "minutes" ? "議事録" : "提案骨子"}（AI生成）
                    </span>
                    <button onClick={copyResult} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100">
                      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "コピーしました" : "コピー"}
                    </button>
                  </div>
                  <pre className="max-h-72 overflow-auto whitespace-pre-wrap p-3 text-xs leading-relaxed text-slate-700">
                    {result.markdown}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
