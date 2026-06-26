"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  BackgroundVariant,
  type NodeTypes,
} from "@xyflow/react";
import { useBoardStore } from "@/stores/boardStore";
import { setCanvasInstance } from "@/lib/canvasInstance";
import StickyNode from "./nodes/StickyNode";
import TextNode from "./nodes/TextNode";
import ProcessNode from "./nodes/ProcessNode";
import KpiNode from "./nodes/KpiNode";
import TaskNode from "./nodes/TaskNode";
import FrameNode from "./nodes/FrameNode";

const nodeTypes: NodeTypes = {
  sticky: StickyNode,
  text: TextNode,
  process: ProcessNode,
  kpi: KpiNode,
  task: TaskNode,
  frame: FrameNode,
};

const MINIMAP_COLOR: Record<string, string> = {
  frame: "#cbd5e1",
  task: "#a78bfa",
  kpi: "#4ade80",
  process: "#60a5fa",
  text: "#e2e8f0",
  sticky: "#fde047",
};

export default function BoardCanvas() {
  const nodes = useBoardStore((s) => s.nodes);
  const edges = useBoardStore((s) => s.edges);
  const onNodesChange = useBoardStore((s) => s.onNodesChange);
  const onEdgesChange = useBoardStore((s) => s.onEdgesChange);
  const onConnect = useBoardStore((s) => s.onConnect);
  const beginInteraction = useBoardStore((s) => s.beginInteraction);
  const setSelected = useBoardStore((s) => s.setSelected);

  const defaultEdgeOptions = useMemo(
    () => ({ type: "default", markerEnd: { type: "arrowclosed" as never } }),
    [],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={setCanvasInstance}
      onNodeDragStart={() => beginInteraction()}
      onSelectionDragStart={() => beginInteraction()}
      onPaneClick={() => setSelected(null)}
      connectionMode={ConnectionMode.Loose}
      defaultEdgeOptions={defaultEdgeOptions}
      elevateNodesOnSelect
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
  );
}
