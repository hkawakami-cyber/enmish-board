// React Flow インスタンスをサイドバー等から参照するための共有モジュール。
// ノード追加位置（ビューポート中心）の算出に使う。

import type { ReactFlowInstance } from "@xyflow/react";

let instance: ReactFlowInstance | null = null;

export function setCanvasInstance(i: ReactFlowInstance | null) {
  instance = i;
}

/** 現在のビューポート中心に少しランダムなずれを足した追加位置を返す */
export function getAddPosition(): { x: number; y: number } {
  if (!instance) return { x: 200, y: 200 };
  const { x, y, zoom } = instance.getViewport();
  const w = typeof window !== "undefined" ? window.innerWidth : 1200;
  const h = typeof window !== "undefined" ? window.innerHeight : 800;
  const cx = (w / 2 - x) / zoom;
  const cy = (h / 2 - y) / zoom;
  const jitter = () => Math.round((((cx + cy) % 5) - 2) * 12);
  return { x: Math.round(cx - 100) + jitter(), y: Math.round(cy - 70) + jitter() };
}
