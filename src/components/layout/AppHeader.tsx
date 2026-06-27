"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-panel/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-sm">
            <LayoutGrid className="h-4 w-4" />
          </span>
          Enmish ボード
        </Link>
        <span className="hidden text-sm text-slate-400 sm:inline">
          営業・業務・会議を一枚で構造化する
        </span>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          <Link href="/boards" className="rounded-md px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">
            ボード一覧
          </Link>
        </nav>
      </div>
    </header>
  );
}
