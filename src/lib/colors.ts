// カードの色パレット。業務利用でも長時間見やすい淡色を基調にする。

export type ColorKey =
  | "yellow"
  | "blue"
  | "green"
  | "red"
  | "purple"
  | "gray"
  | "white";

export interface ColorToken {
  key: ColorKey;
  label: string;
  bg: string; // 背景
  border: string; // 枠線
  swatch: string; // パレットの見本
}

export const COLOR_TOKENS: Record<ColorKey, ColorToken> = {
  yellow: { key: "yellow", label: "イエロー", bg: "#fef9c3", border: "#fde047", swatch: "#fde047" },
  blue: { key: "blue", label: "ブルー", bg: "#dbeafe", border: "#93c5fd", swatch: "#60a5fa" },
  green: { key: "green", label: "グリーン", bg: "#dcfce7", border: "#86efac", swatch: "#4ade80" },
  red: { key: "red", label: "レッド", bg: "#fee2e2", border: "#fca5a5", swatch: "#f87171" },
  purple: { key: "purple", label: "パープル", bg: "#ede9fe", border: "#c4b5fd", swatch: "#a78bfa" },
  gray: { key: "gray", label: "グレー", bg: "#f1f5f9", border: "#cbd5e1", swatch: "#94a3b8" },
  white: { key: "white", label: "ホワイト", bg: "#ffffff", border: "#e2e8f0", swatch: "#ffffff" },
};

export const COLOR_LIST: ColorToken[] = Object.values(COLOR_TOKENS);

export function resolveColor(key?: string): ColorToken {
  if (key && key in COLOR_TOKENS) return COLOR_TOKENS[key as ColorKey];
  return COLOR_TOKENS.yellow;
}

/** フレーム用の淡色（半透明背景に使う） */
export const FRAME_COLORS: { key: string; label: string; border: string; bg: string }[] = [
  { key: "slate", label: "スレート", border: "#94a3b8", bg: "rgba(148,163,184,0.08)" },
  { key: "blue", label: "ブルー", border: "#60a5fa", bg: "rgba(96,165,250,0.08)" },
  { key: "green", label: "グリーン", border: "#4ade80", bg: "rgba(74,222,128,0.08)" },
  { key: "amber", label: "アンバー", border: "#fbbf24", bg: "rgba(251,191,36,0.10)" },
  { key: "purple", label: "パープル", border: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
];

export function resolveFrameColor(key?: string) {
  return FRAME_COLORS.find((c) => c.key === key) ?? FRAME_COLORS[0];
}
