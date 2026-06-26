"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ReactFlowProvider } from "@xyflow/react";
import { getBoard } from "@/lib/storage";
import { useBoardStore } from "@/stores/boardStore";
import { useShortcuts } from "@/lib/shortcuts";
import Toolbar from "@/components/board/Toolbar";
import Sidebar from "@/components/board/Sidebar";
import RightPanel from "@/components/board/RightPanel";
import BoardCanvas from "@/components/board/BoardCanvas";

function Editor() {
  useShortcuts();

  const dirty = useBoardStore((s) => s.dirty);
  const nodes = useBoardStore((s) => s.nodes);
  const edges = useBoardStore((s) => s.edges);
  const title = useBoardStore((s) => s.title);
  const save = useBoardStore((s) => s.save);

  // 変更後しばらく操作がなければ自動保存する
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => save(), 1200);
    return () => clearTimeout(t);
  }, [dirty, nodes, edges, title, save]);

  return (
    <div className="flex h-screen flex-col">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="relative min-w-0 flex-1">
          <BoardCanvas />
        </div>
        <RightPanel />
      </div>
    </div>
  );
}

export default function BoardEditorPage() {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const load = useBoardStore((s) => s.load);
  const [state, setState] = useState<"loading" | "ready" | "notfound">("loading");

  useEffect(() => {
    if (!boardId) return;
    const board = getBoard(boardId);
    if (!board) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("notfound");
      return;
    }
    load(board);
    setState("ready");
  }, [boardId, load]);

  if (state === "loading") {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        読み込み中…
      </div>
    );
  }

  if (state === "notfound") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <p className="text-slate-600">ボードが見つかりませんでした。</p>
        <Link href="/boards" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          ボード一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <Editor />
    </ReactFlowProvider>
  );
}
