// 発言・メモの分類カテゴリ。営業/要件定義MTGでの構造化に使う。
// （背景・現状・課題・要望・制約・決定事項・宿題・未決事項・提案論点）

import type { ColorKey } from "./colors";

export interface CategoryDef {
  key: string;
  label: string;
  /** カテゴリ選択時に自動で適用する色 */
  color: ColorKey;
  /** バッジ表示色（Tailwind クラス） */
  badge: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: "背景", label: "背景", color: "gray", badge: "bg-slate-100 text-slate-600" },
  { key: "現状", label: "現状", color: "blue", badge: "bg-blue-100 text-blue-700" },
  { key: "課題", label: "課題", color: "red", badge: "bg-red-100 text-red-700" },
  { key: "要望", label: "要望", color: "green", badge: "bg-green-100 text-green-700" },
  { key: "制約", label: "制約", color: "yellow", badge: "bg-amber-100 text-amber-700" },
  { key: "決定事項", label: "決定事項", color: "purple", badge: "bg-violet-100 text-violet-700" },
  { key: "宿題", label: "宿題", color: "purple", badge: "bg-fuchsia-100 text-fuchsia-700" },
  { key: "未決事項", label: "未決事項", color: "red", badge: "bg-orange-100 text-orange-700" },
  { key: "提案論点", label: "提案論点", color: "green", badge: "bg-teal-100 text-teal-700" },
];

export function getCategory(key?: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

/** 議事録・提案骨子で使う順序（出力時のグルーピング順） */
export const MINUTES_ORDER = ["背景", "現状", "課題", "要望", "制約", "決定事項", "提案論点", "未決事項", "宿題"];
