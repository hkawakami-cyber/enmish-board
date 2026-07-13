"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Plus, ArrowRight, Clock } from "lucide-react";
import type { BoardMeta } from "@/types/board";
import { listBoards } from "@/lib/storage";
import { createBlankBoard, createBoardFromTemplate } from "@/lib/boardActions";
import { TEMPLATES } from "@/lib/templates";

export default function HomePage() {
  const router = useRouter();
  const [recent, setRecent] = useState<BoardMeta[]>([]);

  useEffect(() => {
    // localStorage はクライアントでのみ参照できるためマウント後に読み込む
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(listBoards().slice(0, 6));
  }, []);

  const handleNewBlank = () => {
    const b = createBlankBoard();
    router.push(`/boards/${b.id}`);
  };

  const handleNewTemplate = (templateId: string) => {
    const b = createBoardFromTemplate(templateId);
    router.push(`/boards/${b.id}`);
  };

  return (
    <main className="flex-1">
      {/* ヒーロー */}
      <section className="border-b border-border bg-panel">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-500 text-white">
              <LayoutGrid className="h-3.5 w-3.5" />
            </span>
            Enmish シリーズ
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Enmish ダッシュボード
          </h1>
          <p className="mt-4 text-xl font-semibold text-slate-700">
            営業・業務・会議を一枚で構造化する
          </p>
          <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
            顧客ヒアリング、営業プロセス設計、業務フロー整理、KPI設計、会議内容の整理を一枚のボード上で可視化し、
            そのまま議事録・提案資料・タスクに落とし込めます。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleNewBlank}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              新規ボード作成
            </button>
            <Link
              href="/boards"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ボード一覧へ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* テンプレートから作成 */}
        <section>
          <h2 className="text-lg font-bold text-slate-900">テンプレートから作成</h2>
          <p className="mt-1 text-sm text-slate-500">
            よく使う整理の型をすぐに開始できます。
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleNewTemplate(t.id)}
                className="group rounded-xl border border-border bg-panel p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{t.name}</span>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {t.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* 最近使ったボード */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">最近使ったボード</h2>
            <Link href="/boards" className="text-sm font-medium text-slate-500 hover:text-slate-800">
              すべて見る
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-border bg-white/60 p-10 text-center text-sm text-slate-400">
              まだボードがありません。上のボタンから作成してください。
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((b) => (
                <Link
                  key={b.id}
                  href={`/boards/${b.id}`}
                  className="rounded-xl border border-border bg-panel p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
                >
                  <div className="truncate font-semibold text-slate-900">{b.title}</div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(b.updatedAt).toLocaleString("ja-JP")}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
