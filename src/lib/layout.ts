// 付箋＋エッジから図解レイアウトを計算する。
// section 12 の方針どおり「内部はノード+エッジで共通化し、配置だけ変える」。
//   - mindmap / tree : 横方向ツリー（左 → 右に階層）
//   - flow           : 縦方向フロー（上 → 下に階層）

import type { Node, Edge } from "@xyflow/react";

export type LayoutKind = "mindmap" | "tree" | "flow";

const DEF_W = 220;
const DEF_H = 130;

interface Pos {
  x: number;
  y: number;
}

/**
 * 対象ノード（subsetIds 指定時はその集合、未指定なら frame 以外の全ノード）を
 * エッジの親子関係に基づいてツリー/フロー配置する。戻り値は id → 新しい座標。
 */
export function computeLayout(
  nodes: Node[],
  edges: Edge[],
  kind: LayoutKind,
  subsetIds?: Set<string> | null,
): Record<string, Pos> {
  const target = nodes.filter(
    (n) => n.type !== "frame" && (!subsetIds || subsetIds.has(n.id)),
  );
  if (target.length === 0) return {};
  const ids = new Set(target.map((n) => n.id));

  // 隣接・入次数
  const children = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  ids.forEach((id) => {
    children.set(id, []);
    indeg.set(id, 0);
  });
  for (const e of edges) {
    if (ids.has(e.source) && ids.has(e.target) && e.source !== e.target) {
      children.get(e.source)!.push(e.target);
      indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
    }
  }

  // ルート = 入次数0。無ければ（循環など）先頭を採用。
  let roots = [...ids].filter((id) => (indeg.get(id) ?? 0) === 0);
  if (roots.length === 0) roots = [target[0].id];

  const horizontal = kind !== "flow";

  // 寸法（実サイズがあれば使う）
  const sizeOf = (id: string) => {
    const n = target.find((t) => t.id === id)!;
    return { w: n.width ?? DEF_W, h: n.height ?? DEF_H };
  };
  const maxMain = Math.max(
    ...target.map((n) => (horizontal ? n.width ?? DEF_W : n.height ?? DEF_H)),
  );
  const maxCross = Math.max(
    ...target.map((n) => (horizontal ? n.height ?? DEF_H : n.width ?? DEF_W)),
  );
  const mainStep = maxMain + (horizontal ? 110 : 90); // 階層間
  const crossStep = maxCross + (horizontal ? 28 : 48); // 兄弟間

  // クロス軸位置（葉から積み上げ）と深さ
  const cross = new Map<string, number>();
  const depth = new Map<string, number>();
  const visited = new Set<string>();
  let slot = 0;

  const place = (id: string, d: number) => {
    if (visited.has(id)) return;
    visited.add(id);
    depth.set(id, d);
    const kids = children.get(id)!.filter((k) => !visited.has(k));
    if (kids.length === 0) {
      cross.set(id, slot);
      slot += 1;
    } else {
      kids.forEach((k) => place(k, d + 1));
      const cs = kids.map((k) => cross.get(k)!);
      cross.set(id, (Math.min(...cs) + Math.max(...cs)) / 2);
    }
  };

  roots.forEach((r) => {
    place(r, 0);
    slot += 0.6; // ツリー間の余白
  });
  // どのルートからも辿れなかったノード（循環・孤立）
  ids.forEach((id) => {
    if (!visited.has(id)) place(id, 0);
  });

  // アンカー：対象ノードの現在の左上に合わせ、その場で整列されたように見せる
  const ox = Math.min(...target.map((n) => n.position.x));
  const oy = Math.min(...target.map((n) => n.position.y));

  const result: Record<string, Pos> = {};
  for (const id of ids) {
    const d = depth.get(id) ?? 0;
    const c = cross.get(id) ?? 0;
    const { w, h } = sizeOf(id);
    if (horizontal) {
      result[id] = {
        x: Math.round(ox + d * mainStep),
        y: Math.round(oy + c * crossStep + (maxCross - h) / 2),
      };
    } else {
      result[id] = {
        x: Math.round(ox + c * crossStep + (maxCross - w) / 2),
        y: Math.round(oy + d * mainStep),
      };
    }
  }
  return result;
}
