// キャンバスを PNG として書き出す。html-to-image を利用する。

import { toPng } from "html-to-image";
import { getNodesBounds, getViewportForBounds, type Node } from "@xyflow/react";
import { triggerDownload, safeFileName } from "./download";

const PADDING = 80;
const MAX = 4096;

/**
 * React Flow のビューポート(.react-flow__viewport)を全ノードが収まる形で PNG 化する。
 */
export async function exportBoardImage(nodes: Node[], title: string) {
  const viewportEl = document.querySelector<HTMLElement>(".react-flow__viewport");
  if (!viewportEl) {
    throw new Error("キャンバスが見つかりませんでした");
  }

  const bounds = getNodesBounds(nodes);
  const width = Math.min(MAX, Math.max(640, bounds.width + PADDING * 2));
  const height = Math.min(MAX, Math.max(480, bounds.height + PADDING * 2));

  const viewport = getViewportForBounds(bounds, width, height, 0.2, 2, PADDING);

  const dataUrl = await toPng(viewportEl, {
    backgroundColor: "#f1f5f9",
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
    filter: (node) => {
      // コントロール類やミニマップ・ハンドルは除外
      const cls = (node as HTMLElement)?.classList;
      if (!cls) return true;
      return !(
        cls.contains("react-flow__controls") ||
        cls.contains("react-flow__minimap") ||
        cls.contains("react-flow__panel") ||
        cls.contains("react-flow__attribution")
      );
    },
  });

  triggerDownload(`${safeFileName(title)}.png`, dataUrl);
}
