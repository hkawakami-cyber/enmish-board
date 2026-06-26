"use client";

import { useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  BackgroundVariant,
  useReactFlow,
  type NodeTypes,
  type Node as RFNode,
} from "@xyflow/react";
import { MousePointerClick, StickyNote } from "lucide-react";
import { useBoardStore } from "@/stores/boardStore";
import { setCanvasInstance } from "@/lib/canvasInstance";
import StickyNode from "./nodes/StickyNode";
import TextNode from "./nodes/TextNode";
import ProcessNode from "./nodes/ProcessNode";
import KpiNode from "./nodes/KpiNode";
import TaskNode from "./nodes/TaskNode";
import FrameNode from "./nodes/FrameNode";
import DecisionNode from "./nodes/DecisionNode";
import TerminalNode from "./nodes/TerminalNode";
import SystemNode from "./nodes/SystemNode";
import ObjectNode from "./nodes/ObjectNode";
import ContextMenu, { type MenuState } from "./ContextMenu";

const nodeTypes: NodeTypes = {
  sticky: StickyNode,
  text: TextNode,
  process: ProcessNode,
  kpi: KpiNode,
  task: TaskNode,
  decision: DecisionNode,
  terminal: TerminalNode,
  system: SystemNode,
  object: ObjectNode,
  frame: FrameNode,
};

const MINIMAP_COLOR: Record<string, string> = {
  frame: "#cbd5e1",
  task: "#a78bfa",
  kpi: "#4ade80",
  process: "#60a5fa",
  text: "#e2e8f0",
  sticky: "#fde047",
  decision: "#fde047",
  terminal: "#94a3b8",
  system: "#60a5fa",
  object: "#a78bfa",
};

export default function BoardCanvas() {
  const nodes = useBoardStore((s) => s.nodes);
  const edges = useBoardStore((s) => s.edges);
  const clientMode = useBoardStore((s) => s.clientMode);
  const isEmpty = useBoardStore((s) => s.nodes.length === 0);

  // 顧客共有モードでは内部メモのノード・関連エッジを隠す
  const viewNodes = useMemo(
    () => (clientMode ? nodes.filter((n) => !n.data?.isInternal) : nodes),
    [nodes, clientMode],
  );
  const viewEdges = useMemo(() => {
    if (!clientMode) return edges;
    const visible = new Set(viewNodes.map((n) => n.id));
    return edges.filter((e) => visible.has(e.source) && visible.has(e.target));
  }, [edges, clientMode, viewNodes]);
  const onNodesChange = useBoardStore((s) => s.onNodesChange);
  const onEdgesChange = useBoardStore((s) => s.onEdgesChange);
  const onConnect = useBoardStore((s) => s.onConnect);
  const beginInteraction = useBoardStore((s) => s.beginInteraction);
  const setSelected = useBoardStore((s) => s.setSelected);
  const addNode = useBoardStore((s) => s.addNode);

  const { screenToFlowPosition } = useReactFlow();
  const [menu, setMenu] = useState<MenuState | null>(null);

  const defaultEdgeOptions = useMemo(
    () => ({ type: "default", markerEnd: { type: "arrowclosed" as never } }),
    [],
  );

  // 空白をダブルクリック → その場に付箋を作成して即編集
  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains("react-flow__pane")) return;
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode("sticky", { x: pos.x - 100, y: pos.y - 70 });
  };

  return (
    <div className="relative h-full w-full" onDoubleClick={handleDoubleClick}>
      <ReactFlow
        nodes={viewNodes}
        edges={viewEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setCanvasInstance}
        onNodeDragStart={() => beginInteraction()}
        onSelectionDragStart={() => beginInteraction()}
        onPaneClick={() => setSelected(null)}
        onNodeContextMenu={(e, node: RFNode) => {
          e.preventDefault();
          setSelected(node.id);
          setMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
        }}
        onPaneContextMenu={(e) => {
          e.preventDefault();
          const me = e as unknown as MouseEvent;
          setMenu({
            x: me.clientX,
            y: me.clientY,
            nodeId: null,
            flowPos: screenToFlowPosition({ x: me.clientX, y: me.clientY }),
          });
        }}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={defaultEdgeOptions}
        elevateNodesOnSelect
        zoomOnDoubleClick={false}
        minZoom={0.2}
        maxZoom={2}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={null}
        className="bg-slate-100"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => MINIMAP_COLOR[n.type ?? "sticky"] ?? "#cbd5e1"}
          className="!bottom-2 !right-2"
        />
      </ReactFlow>

      {isEmpty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-8 py-7 text-center shadow-sm">
            <MousePointerClick className="mx-auto h-7 w-7 text-slate-400" />
            <p className="mt-3 font-semibold text-slate-700">空白をダブルクリックで付箋を追加</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-500">
              <li className="flex items-center justify-center gap-1.5">
                <StickyNote className="h-3.5 w-3.5" /> 左のツール、または <kbd className="rounded bg-slate-100 px-1.5">N</kbd>/<kbd className="rounded bg-slate-100 px-1.5">T</kbd>/<kbd className="rounded bg-slate-100 px-1.5">F</kbd> でも追加
              </li>
              <li>議事メモを <kbd className="rounded bg-slate-100 px-1.5">⌘V</kbd> で貼ると、行ごとに付箋化</li>
              <li>カードの端からドラッグで線をつなげる</li>
            </ul>
          </div>
        </div>
      )}

      {menu && <ContextMenu menu={menu} onClose={() => setMenu(null)} />}
    </div>
  );
}
