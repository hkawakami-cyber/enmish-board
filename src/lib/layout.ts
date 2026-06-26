// 付箋＋エッジから図解レイアウトを計算する。
// section 12 の方針どおり「内部はノード+エッジで共通化し、配置だけ変える」。
//   - mindmap : 中心（ルート）から左右にバランスよく展開
//   - tree    : 横方向ツリー（左 → 右に階層）
//   - flow    : 縦方向フロー（上 → 下に階層）

import type { Node, Edge } from "@xyflow/react";

export type LayoutKind = "mindmap" | "tree" | "flow";

const DEF_W = 220;
const DEF_H = 130;

interface Pos {
  x: number;
  y: number;
}

interface Graph {
  target: Node[];
  ids: Set<string>;
  children: Map<string, string[]>;
  roots: string[];
  maxW: number;
  maxH: number;
}

function buildGraph(nodes: Node[], edges: Edge[], subsetIds?: Set<string> | null): Graph | null {
  const target = nodes.filter(
    (n) => n.type !== "frame" && (!subsetIds || subsetIds.has(n.id)),
  );
  if (target.length === 0) return null;
  const ids = new Set(target.map((n) => n.id));

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
  let roots = [...ids].filter((id) => (indeg.get(id) ?? 0) === 0);
  if (roots.length === 0) roots = [target[0].id];

  const maxW = Math.max(...target.map((n) => n.width ?? DEF_W));
  const maxH = Math.max(...target.map((n) => n.height ?? DEF_H));
  return { target, ids, children, roots, maxW, maxH };
}

/** 中心ルートから左右にバランス展開するマインドマップ配置 */
function mindmapLayout(g: Graph): Record<string, Pos> {
  const rootId = g.roots[0];
  const rootNode = g.target.find((t) => t.id === rootId)!;
  const colStep = g.maxW + 120;
  const rowStep = g.maxH + 28;

  const rel: Record<string, Pos> = { [rootId]: { x: 0, y: 0 } };
  const visited = new Set<string>([rootId]);
  let slot = 0;

  const placeSub = (id: string, depth: number, sign: number) => {
    visited.add(id);
    const kids = g.children.get(id)!.filter((k) => !visited.has(k));
    let y: number;
    if (kids.length === 0) {
      y = slot * rowStep;
      slot += 1;
    } else {
      kids.forEach((k) => placeSub(k, depth + 1, sign));
      const ys = kids.map((k) => rel[k].y);
      y = (Math.min(...ys) + Math.max(...ys)) / 2;
    }
    rel[id] = { x: sign * depth * colStep, y };
  };

  // ルート直下の子を左右に振り分け、各サイドを縦中央そろえ
  const placeSide = (topKids: string[], sign: number) => {
    const before = new Set(visited);
    slot = 0;
    topKids.forEach((c) => placeSub(c, 1, sign));
    const sideIds = [...visited].filter((id) => !before.has(id));
    if (sideIds.length) {
      const ys = sideIds.map((id) => rel[id].y);
      const mid = (Math.min(...ys) + Math.max(...ys)) / 2;
      sideIds.forEach((id) => (rel[id].y -= mid));
    }
  };

  const top = g.children.get(rootId)!;
  const right = top.filter((_, i) => i % 2 === 0);
  const left = top.filter((_, i) => i % 2 === 1);
  placeSide(right, 1);
  placeSide(left, -1);

  // 循環や孤立で未配置のものは右側に積む
  g.ids.forEach((id) => {
    if (!(id in rel)) {
      rel[id] = { x: colStep, y: slot * rowStep };
      slot += 1;
    }
  });

  const ox = rootNode.position.x;
  const oy = rootNode.position.y;
  const result: Record<string, Pos> = {};
  for (const id of g.ids) {
    result[id] = { x: Math.round(ox + rel[id].x), y: Math.round(oy + rel[id].y) };
  }
  return result;
}

/** ツリー（横）/ フロー（縦）配置 */
function treeLayout(g: Graph, horizontal: boolean): Record<string, Pos> {
  const mainStep = (horizontal ? g.maxW : g.maxH) + (horizontal ? 110 : 90);
  const crossStep = (horizontal ? g.maxH : g.maxW) + (horizontal ? 28 : 48);

  const cross = new Map<string, number>();
  const depth = new Map<string, number>();
  const visited = new Set<string>();
  let slot = 0;

  const place = (id: string, d: number) => {
    if (visited.has(id)) return;
    visited.add(id);
    depth.set(id, d);
    const kids = g.children.get(id)!.filter((k) => !visited.has(k));
    if (kids.length === 0) {
      cross.set(id, slot);
      slot += 1;
    } else {
      kids.forEach((k) => place(k, d + 1));
      const cs = kids.map((k) => cross.get(k)!);
      cross.set(id, (Math.min(...cs) + Math.max(...cs)) / 2);
    }
  };
  g.roots.forEach((r) => {
    place(r, 0);
    slot += 0.6;
  });
  g.ids.forEach((id) => {
    if (!visited.has(id)) place(id, 0);
  });

  const ox = Math.min(...g.target.map((n) => n.position.x));
  const oy = Math.min(...g.target.map((n) => n.position.y));
  const sizeOf = (id: string) => {
    const n = g.target.find((t) => t.id === id)!;
    return { w: n.width ?? DEF_W, h: n.height ?? DEF_H };
  };
  const maxCross = horizontal ? g.maxH : g.maxW;

  const result: Record<string, Pos> = {};
  for (const id of g.ids) {
    const d = depth.get(id) ?? 0;
    const c = cross.get(id) ?? 0;
    const { w, h } = sizeOf(id);
    if (horizontal) {
      result[id] = { x: Math.round(ox + d * mainStep), y: Math.round(oy + c * crossStep + (maxCross - h) / 2) };
    } else {
      result[id] = { x: Math.round(ox + c * crossStep + (maxCross - w) / 2), y: Math.round(oy + d * mainStep) };
    }
  }
  return result;
}

/**
 * 対象ノードをエッジの親子関係に基づいて配置する。戻り値は id → 新しい座標。
 */
export function computeLayout(
  nodes: Node[],
  edges: Edge[],
  kind: LayoutKind,
  subsetIds?: Set<string> | null,
): Record<string, Pos> {
  const g = buildGraph(nodes, edges, subsetIds);
  if (!g) return {};

  // 単一ルートに子があるマインドマップは左右バランス配置
  if (kind === "mindmap" && g.roots.length === 1 && (g.children.get(g.roots[0])?.length ?? 0) > 0) {
    return mindmapLayout(g);
  }
  return treeLayout(g, kind !== "flow");
}
