"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, LayoutTemplate, Copy, Trash2, Pencil, ExternalLink } from "lucide-react";
import type { BoardMeta } from "@/types/board";
import { listBoards, deleteBoard, duplicateBoard, renameBoard } from "@/lib/storage";
import { createBlankBoard, createBoardFromTemplate } from "@/lib/boardActions";
import AppHeader from "@/components/layout/AppHeader";
import TemplateModal from "@/components/board/TemplateModal";

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardMeta[]>([]);
  const [showTemplate, setShowTemplate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const refresh = () => setBoards(listBoards());

  useEffect(() => {
    // localStorage はクライアントでのみ参照できるためマウント後に読み込む
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, []);

  const handleNewBlank = () => {
    const b = createBlankBoard();
    router.push(`/boards/${b.id}`);
  };

  const handleNewTemplate = (templateId: string) => {
    const b = createBoardFromTemplate(templateId);
    router.push(`/boards/${b.id}`);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`「${title}」を削除します。よろしいですか？`)) {
      deleteBoard(id);
      refresh();
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateBoard(id);
    refresh();
  };

  const startRename = (b: BoardMeta) => {
    setEditingId(b.id);
    setEditValue(b.title);
  };

  const commitRename = () => {
    if (editingId) {
      renameBoard(editingId, editValue.trim() || "無題ボード");
      setEditingId(null);
      refresh();
    }
  };

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ボード一覧</h1>
            <p className="mt-1 text-sm text-slate-500">
              作成済みのボードを管理し、すぐに再編集できます。
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplate(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <LayoutTemplate className="h-4 w-4" />
              テンプレートから作成
            </button>
            <button
              onClick={handleNewBlank}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              新規ボード作成
            </button>
          </div>
        </div>

        {boards.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-white/60 p-16 text-center">
            <p className="text-slate-500">まだボードがありません。</p>
            <button
              onClick={handleNewBlank}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              最初のボードを作成
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((b) => (
              <div
                key={b.id}
                className="flex flex-col rounded-xl border border-border bg-panel p-5 shadow-sm transition hover:shadow"
              >
                {editingId === b.id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-base font-semibold outline-none focus:border-slate-500"
                  />
                ) : (
                  <Link href={`/boards/${b.id}`} className="truncate text-base font-semibold text-slate-900 hover:underline">
                    {b.title}
                  </Link>
                )}

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(b.tags ?? []).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>

                <dl className="mt-4 space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <dt>作成日</dt>
                    <dd>{new Date(b.createdAt).toLocaleString("ja-JP")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>最終更新</dt>
                    <dd>{new Date(b.updatedAt).toLocaleString("ja-JP")}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
                  <Link
                    href={`/boards/${b.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    開く
                  </Link>
                  <button
                    onClick={() => startRename(b)}
                    className="ml-auto rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    title="名前を変更"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(b.id)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    title="複製"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id, b.title)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showTemplate && (
        <TemplateModal
          title="テンプレートからボードを作成"
          onSelect={handleNewTemplate}
          onClose={() => setShowTemplate(false)}
        />
      )}
    </>
  );
}
