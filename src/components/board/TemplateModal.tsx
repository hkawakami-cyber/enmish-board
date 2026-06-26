"use client";

import { X } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";

interface Props {
  title?: string;
  description?: string;
  onSelect: (templateId: string) => void;
  onClose: () => void;
}

export default function TemplateModal({
  title = "テンプレートを選択",
  description = "整理の型を選ぶと、すぐに編集を始められます。",
  onSelect,
  onClose,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto p-6 sm:grid-cols-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="rounded-xl border border-border p-4 text-left transition hover:border-slate-400 hover:bg-slate-50"
            >
              <div className="font-semibold text-slate-900">{t.name}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{t.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
