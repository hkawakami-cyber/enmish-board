"use client";

// ボード編集画面の状態管理。React Flow のノード/エッジを単一の真実として保持し、
// 保存時に Board 型へ変換する。UI からロジックを分離する。

import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as rfAddEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type {
  Board,
  BoardEdge,
  BoardFrame,
  BoardNode,
  NodeType,
} from "@/types/board";
import { saveBoard } from "@/lib/storage";
import { getViewportCenter } from "@/lib/canvasInstance";
import { computeLayout, type LayoutKind } from "@/lib/layout";

// --- ノード初期値 ----------------------------------------------------------

const DEFAULT_SIZE: Record<string, { width: number; height: number }> = {
  sticky: { width: 200, height: 140 },
  text: { width: 240, height: 120 },
  process: { width: 220, height: 160 },
  kpi: { width: 210, height: 140 },
  task: { width: 220, height: 160 },
  decision: { width: 170, height: 110 },
  terminal: { width: 150, height: 56 },
  system: { width: 200, height: 92 },
  object: { width: 230, height: 200 },
  frame: { width: 380, height: 260 },
};

const DEFAULT_COLOR: Record<string, string> = {
  sticky: "yellow",
  text: "white",
  process: "blue",
  kpi: "green",
  task: "purple",
  decision: "yellow",
  terminal: "gray",
  system: "blue",
  object: "purple",
};

function defaultData(type: NodeType): Record<string, unknown> {
  switch (type) {
    case "sticky":
      return { title: "付箋", body: "" };
    case "text":
      return { body: "テキストを入力" };
    case "process":
      return { title: "プロセス", owner: "", input: "", output: "", issue: "", status: "" };
    case "kpi":
      return { name: "KPI", value: "", unit: "", formula: "", description: "" };
    case "task":
      return { title: "タスク", assignee: "", dueDate: "", status: "未着手", priority: "中", memo: "" };
    case "decision":
      return { title: "分岐？" };
    case "terminal":
      return { title: "開始" };
    case "system":
      return { title: "システム", subtitle: "" };
    case "object":
      return {
        name: "オブジェクト",
        fields: [
          { name: "Name", type: "テキスト", required: true },
          { name: "", type: "テキスト", required: false },
        ],
      };
  }
}

// --- Board <-> React Flow 変換 ---------------------------------------------

function nodeToRf(n: BoardNode): Node {
  return {
    id: n.id,
    type: n.type,
    position: n.position,
    width: n.size.width,
    height: n.size.height,
    data: { ...n.data, color: n.style?.color, fontSize: n.style?.fontSize },
    zIndex: 1,
  };
}

function frameToRf(f: BoardFrame): Node {
  return {
    id: f.id,
    type: "frame",
    position: f.position,
    width: f.size.width,
    height: f.size.height,
    data: { title: f.title, color: f.color },
    zIndex: 0,
  };
}

function edgeToRf(e: BoardEdge): Edge {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: "default",
    markerEnd: e.type === "line" ? undefined : { type: "arrowclosed" as never },
  };
}

function rfToBoardParts(nodes: Node[], edges: Edge[]) {
  const now = new Date().toISOString();
  const boardNodes: BoardNode[] = [];
  const frames: BoardFrame[] = [];

  for (const n of nodes) {
    const size = { width: Math.round(n.width ?? n.measured?.width ?? 200), height: Math.round(n.height ?? n.measured?.height ?? 140) };
    if (n.type === "frame") {
      const { title, color } = n.data as { title?: string; color?: string };
      frames.push({
        id: n.id,
        type: "frame",
        title: title ?? "",
        position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
        size,
        color,
        createdAt: (n.data.createdAt as string) ?? now,
        updatedAt: now,
      });
    } else {
      const { color, fontSize, createdAt, ...data } = n.data as Record<string, unknown>;
      boardNodes.push({
        id: n.id,
        type: n.type as NodeType,
        position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
        size,
        data,
        style: { color: color as string | undefined, fontSize: fontSize as number | undefined },
        createdAt: (createdAt as string) ?? now,
        updatedAt: now,
      });
    }
  }

  const boardEdges: BoardEdge[] = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: typeof e.label === "string" ? e.label : undefined,
    type: e.markerEnd ? "arrow" : "line",
    createdAt: now,
  }));

  return { nodes: boardNodes, edges: boardEdges, frames };
}

// --- ストア定義 ------------------------------------------------------------

interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

interface BoardState {
  // メタ
  id: string;
  title: string;
  description?: string;
  templateType?: string;
  tags?: string[];
  createdAt: string;

  nodes: Node[];
  edges: Edge[];
  selectedId: string | null;
  selectedEdgeId: string | null;

  /** 作成直後に本文編集へ入らせるためのノードID */
  autoEditId: string | null;

  /** 顧客共有モード（内部メモを隠す） */
  clientMode: boolean;

  dirty: boolean;
  lastSavedAt: string | null;

  past: Snapshot[];
  future: Snapshot[];

  // ロード/保存
  load: (board: Board) => void;
  save: () => void;
  setTitle: (title: string) => void;

  // React Flow ハンドラ
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (c: Connection) => void;

  // 選択
  setSelected: (id: string | null) => void;

  // エッジ操作
  updateEdge: (id: string, patch: Partial<Edge>) => void;
  deleteEdge: (id: string) => void;

  // ノード操作
  addNode: (type: NodeType, position: { x: number; y: number }, data?: Record<string, unknown>) => void;
  addFrame: (position: { x: number; y: number }) => void;
  /** スイムレーン（隣接する縦レーンのフレーム群）を挿入する */
  addSwimlane: (lanes?: number) => void;
  updateNodeData: (id: string, patch: Record<string, unknown>) => void;
  setNodeColor: (id: string, color: string) => void;
  deleteSelected: () => void;
  deleteNode: (id: string) => void;
  duplicateSelected: () => void;
  duplicateNode: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  clearAutoEdit: () => void;
  toggleClientMode: () => void;
  /** 選択ノード（2つ以上）または全体を図解配置に整える */
  autoLayout: (kind: LayoutKind) => void;
  /** 改行区切りのテキストから複数の付箋を生成する */
  pasteText: (text: string) => void;

  copySelected: () => void;
  pasteClipboard: () => void;

  // マインドマップ操作
  addChildNode: (parentId: string) => void;
  addSiblingNode: (nodeId: string) => void;
  toggleCollapse: (nodeId: string) => void;

  // 履歴
  beginInteraction: () => void;
  undo: () => void;
  redo: () => void;

  // ユーティリティ
  serialize: () => Board;
}

function snapshot(s: { nodes: Node[]; edges: Edge[] }): Snapshot {
  return { nodes: structuredClone(s.nodes), edges: structuredClone(s.edges) };
}

// コピー/ペースト用クリップボード（モジュールスコープ）
let clipboard: Node | null = null;

export const useBoardStore = create<BoardState>((set, get) => ({
  id: "",
  title: "",
  description: undefined,
  templateType: undefined,
  tags: undefined,
  createdAt: new Date().toISOString(),

  nodes: [],
  edges: [],
  selectedId: null,
  selectedEdgeId: null,
  autoEditId: null,
  clientMode: false,

  dirty: false,
  lastSavedAt: null,

  past: [],
  future: [],

  load: (board) => {
    const frameNodes = board.frames.map(frameToRf);
    const cardNodes = board.nodes.map(nodeToRf);
    set({
      id: board.id,
      title: board.title,
      description: board.description,
      templateType: board.templateType,
      tags: board.tags,
      createdAt: board.createdAt,
      nodes: [...frameNodes, ...cardNodes],
      edges: board.edges.map(edgeToRf),
      selectedId: null,
      selectedEdgeId: null,
      autoEditId: null,
      clientMode: false,
      dirty: false,
      lastSavedAt: board.updatedAt,
      past: [],
      future: [],
    });
  },

  serialize: () => {
    const s = get();
    const parts = rfToBoardParts(s.nodes, s.edges);
    return {
      id: s.id,
      title: s.title,
      description: s.description,
      templateType: s.templateType,
      tags: s.tags,
      nodes: parts.nodes,
      edges: parts.edges,
      frames: parts.frames,
      createdAt: s.createdAt,
      updatedAt: new Date().toISOString(),
    };
  },

  save: () => {
    const board = get().serialize();
    saveBoard(board);
    set({ dirty: false, lastSavedAt: board.updatedAt });
  },

  setTitle: (title) => set({ title, dirty: true }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes), dirty: true });
    // 選択状態を同期（ノード選択時はエッジ選択を解除）
    const sel = changes.find((c) => c.type === "select");
    if (sel && "selected" in sel) {
      if (sel.selected) set({ selectedId: sel.id, selectedEdgeId: null });
      else if (get().selectedId === sel.id) set({ selectedId: null });
    }
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges), dirty: true });
    const sel = changes.find((c) => c.type === "select");
    if (sel && "selected" in sel) {
      if (sel.selected) set({ selectedEdgeId: sel.id, selectedId: null });
      else if (get().selectedEdgeId === sel.id) set({ selectedEdgeId: null });
    }
  },

  updateEdge: (id, patch) => {
    get().beginInteraction();
    set({
      edges: get().edges.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      dirty: true,
    });
  },

  deleteEdge: (id) => {
    get().beginInteraction();
    set({
      edges: get().edges.filter((e) => e.id !== id),
      selectedEdgeId: get().selectedEdgeId === id ? null : get().selectedEdgeId,
      dirty: true,
    });
  },

  onConnect: (c) => {
    get().beginInteraction();
    set({
      edges: rfAddEdge(
        { ...c, type: "default", markerEnd: { type: "arrowclosed" as never } },
        get().edges,
      ),
      dirty: true,
    });
  },

  setSelected: (id) => set({ selectedId: id, selectedEdgeId: id ? get().selectedEdgeId : null }),

  addNode: (type, position, data) => {
    get().beginInteraction();
    const id = crypto.randomUUID();
    const node: Node = {
      id,
      type,
      position,
      width: DEFAULT_SIZE[type].width,
      height: DEFAULT_SIZE[type].height,
      data: { ...defaultData(type), color: DEFAULT_COLOR[type], createdAt: new Date().toISOString(), ...data },
      zIndex: 1,
      selected: true,
    };
    set({
      nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), node],
      selectedId: id,
      autoEditId: id,
      dirty: true,
    });
  },

  addFrame: (position) => {
    get().beginInteraction();
    const id = crypto.randomUUID();
    const node: Node = {
      id,
      type: "frame",
      position,
      width: DEFAULT_SIZE.frame.width,
      height: DEFAULT_SIZE.frame.height,
      data: { title: "フレーム", color: "slate", createdAt: new Date().toISOString() },
      zIndex: 0,
      selected: true,
    };
    // フレームは配列先頭側（背面）に置く
    set({
      nodes: [node, ...get().nodes.map((n) => ({ ...n, selected: false }))],
      selectedId: id,
      autoEditId: id,
      dirty: true,
    });
  },

  addSwimlane: (lanes = 4) => {
    get().beginInteraction();
    const ts = new Date().toISOString();
    const base = getViewportCenter();
    const W = 230;
    const H = 540;
    const startX = Math.round(base.x - (lanes * W) / 2);
    const y = Math.round(base.y - H / 2);
    const laneNodes: Node[] = Array.from({ length: lanes }, (_, i) => ({
      id: crypto.randomUUID(),
      type: "frame",
      position: { x: startX + i * W, y },
      width: W,
      height: H,
      data: { title: `レーン${i + 1}`, color: i % 2 === 0 ? "slate" : "blue", createdAt: ts },
      zIndex: 0,
    }));
    set({
      nodes: [...laneNodes, ...get().nodes.map((n) => ({ ...n, selected: false }))],
      selectedId: null,
      dirty: true,
    });
  },

  updateNodeData: (id, patch) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
      dirty: true,
    });
  },

  setNodeColor: (id, color) => {
    get().beginInteraction();
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, color } } : n,
      ),
      dirty: true,
    });
  },

  deleteSelected: () => {
    const sel = get().selectedId;
    const selectedNodes = get().nodes.filter((n) => n.selected || n.id === sel);
    if (selectedNodes.length === 0) return;
    get().beginInteraction();
    const ids = new Set(selectedNodes.map((n) => n.id));
    set({
      nodes: get().nodes.filter((n) => !ids.has(n.id)),
      edges: get().edges.filter((e) => !ids.has(e.source) && !ids.has(e.target)),
      selectedId: null,
      dirty: true,
    });
  },

  deleteNode: (id) => {
    if (!get().nodes.some((n) => n.id === id)) return;
    get().beginInteraction();
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedId: get().selectedId === id ? null : get().selectedId,
      dirty: true,
    });
  },

  duplicateSelected: () => {
    const sel = get().selectedId;
    if (sel) get().duplicateNode(sel);
  },

  duplicateNode: (sourceId) => {
    const target = get().nodes.find((n) => n.id === sourceId);
    if (!target) return;
    get().beginInteraction();
    const id = crypto.randomUUID();
    const copy: Node = {
      ...structuredClone(target),
      id,
      position: { x: target.position.x + 32, y: target.position.y + 32 },
      selected: true,
    };
    set({
      nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), copy],
      selectedId: id,
      dirty: true,
    });
  },

  bringToFront: (id) => {
    const node = get().nodes.find((n) => n.id === id);
    if (!node) return;
    get().beginInteraction();
    const maxZ = Math.max(1, ...get().nodes.map((n) => (n.zIndex as number) ?? 0));
    set({
      nodes: [
        ...get().nodes.filter((n) => n.id !== id),
        { ...node, zIndex: maxZ + 1 },
      ],
      dirty: true,
    });
  },

  sendToBack: (id) => {
    const node = get().nodes.find((n) => n.id === id);
    if (!node) return;
    get().beginInteraction();
    // フレームより前面は保ちつつ、カードの中では最背面へ
    const z = node.type === "frame" ? -1 : 0;
    set({
      nodes: [{ ...node, zIndex: z }, ...get().nodes.filter((n) => n.id !== id)],
      dirty: true,
    });
  },

  clearAutoEdit: () => set({ autoEditId: null }),

  toggleClientMode: () => set({ clientMode: !get().clientMode }),

  autoLayout: (kind) => {
    const selected = get().nodes.filter((n) => n.selected && n.type !== "frame");
    const subset = selected.length >= 2 ? new Set(selected.map((n) => n.id)) : null;
    const pos = computeLayout(get().nodes, get().edges, kind, subset);
    if (Object.keys(pos).length === 0) return;
    get().beginInteraction();
    set({
      nodes: get().nodes.map((n) => (pos[n.id] ? { ...n, position: pos[n.id] } : n)),
      dirty: true,
    });
  },

  pasteText: (text) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    get().beginInteraction();
    const base = getViewportCenter();
    const W = 200;
    const H = 140;
    const GAP = 20;
    const cols = Math.min(4, lines.length);
    const startX = Math.round(base.x - (cols * (W + GAP)) / 2);
    const startY = Math.round(base.y - 80);
    const ts = new Date().toISOString();
    const created: Node[] = lines.slice(0, 100).map((line, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        id: crypto.randomUUID(),
        type: "sticky",
        position: { x: startX + col * (W + GAP), y: startY + row * (H + GAP) },
        width: W,
        height: H,
        data: { title: line, body: "", color: "yellow", createdAt: ts },
        zIndex: 1,
      };
    });
    set({
      nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), ...created],
      selectedId: created.length === 1 ? created[0].id : null,
      dirty: true,
    });
  },

  addChildNode: (parentId) => {
    const parent = get().nodes.find((n) => n.id === parentId);
    if (!parent) return;
    get().beginInteraction();
    const childCount = get().edges.filter((e) => e.source === parentId).length;
    const pw = parent.width ?? 200;
    const ph = parent.height ?? 130;
    const id = crypto.randomUUID();
    const node: Node = {
      id,
      type: "sticky",
      position: { x: parent.position.x + pw + 90, y: parent.position.y + childCount * (ph + 24) },
      width: 200,
      height: 120,
      data: { title: "", body: "", color: "yellow", createdAt: new Date().toISOString() },
      zIndex: 1,
      selected: true,
    };
    const edge: Edge = { id: crypto.randomUUID(), source: parentId, target: id, type: "default" };
    set({
      nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), node],
      edges: [...get().edges, edge],
      selectedId: id,
      autoEditId: id,
      dirty: true,
    });
  },

  addSiblingNode: (nodeId) => {
    const parentEdge = get().edges.find((e) => e.target === nodeId);
    get().addChildNode(parentEdge ? parentEdge.source : nodeId);
  },

  toggleCollapse: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;
    // 子孫を BFS で収集（source → target をたどる）
    const childrenOf = (id: string) => get().edges.filter((e) => e.source === id).map((e) => e.target);
    const descendants = new Set<string>();
    const queue = [...childrenOf(nodeId)];
    while (queue.length) {
      const cur = queue.shift()!;
      if (descendants.has(cur)) continue;
      descendants.add(cur);
      queue.push(...childrenOf(cur));
    }
    if (descendants.size === 0) return;
    get().beginInteraction();
    const collapsed = !node.data.collapsed;
    set({
      nodes: get().nodes.map((n) => {
        if (n.id === nodeId) return { ...n, data: { ...n.data, collapsed } };
        if (descendants.has(n.id)) return { ...n, hidden: collapsed };
        return n;
      }),
      edges: get().edges.map((e) =>
        descendants.has(e.target) ? { ...e, hidden: collapsed } : e,
      ),
      dirty: true,
    });
  },

  copySelected: () => {
    const node = get().nodes.find((n) => n.id === get().selectedId);
    clipboard = node ? structuredClone(node) : null;
  },

  pasteClipboard: () => {
    if (!clipboard) return;
    get().beginInteraction();
    const id = crypto.randomUUID();
    const copy: Node = {
      ...structuredClone(clipboard),
      id,
      position: { x: clipboard.position.x + 32, y: clipboard.position.y + 32 },
      selected: true,
    };
    set({
      nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), copy],
      selectedId: id,
      dirty: true,
    });
  },

  beginInteraction: () => {
    set({
      past: [...get().past, snapshot(get())].slice(-50),
      future: [],
    });
  },

  undo: () => {
    const { past } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      past: past.slice(0, -1),
      future: [snapshot(get()), ...get().future].slice(0, 50),
      dirty: true,
    });
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      nodes: next.nodes,
      edges: next.edges,
      future: future.slice(1),
      past: [...get().past, snapshot(get())].slice(-50),
      dirty: true,
    });
  },
}));

// テンプレート挿入用ヘルパー（既存ノードに追記する）
export function insertTemplateNodes(boardNodes: BoardNode[], frames: BoardFrame[]) {
  const store = useBoardStore.getState();
  store.beginInteraction();
  const newFrameNodes = frames.map(frameToRf);
  const newCardNodes = boardNodes.map(nodeToRf);
  useBoardStore.setState({
    nodes: [
      ...newFrameNodes,
      ...store.nodes,
      ...newCardNodes,
    ],
    dirty: true,
  });
}
