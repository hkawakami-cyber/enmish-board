// Enmish ボード - 中核データ型定義
// 将来 Supabase / Firebase / PostgreSQL へ移行できるよう、保存形式は汎用的に保つ。

export type NodeType = "sticky" | "text" | "process" | "kpi" | "task";

export type TaskStatus = "未着手" | "進行中" | "完了" | "保留";
export type Priority = "高" | "中" | "低";

/** ノードの位置 */
export interface Position {
  x: number;
  y: number;
}

/** ノードのサイズ */
export interface Size {
  width: number;
  height: number;
}

/** ノードの見た目 */
export interface NodeStyle {
  color?: string; // カードの基調色（キー: yellow / blue / green / red / purple / gray / white）
  backgroundColor?: string;
  borderColor?: string;
  fontSize?: number;
}

/**
 * すべてのカード種別で使い得るフィールドを緩く保持する。
 * data の中身は種別によって使うキーが変わる。
 */
export interface NodeData {
  // 共通
  title?: string;
  body?: string;
  tags?: string[];
  memo?: string;
  linkUrl?: string;

  // process
  description?: string;
  owner?: string;
  input?: string;
  output?: string;
  issue?: string;

  // kpi
  name?: string;
  value?: string;
  unit?: string;
  formula?: string;

  // task
  assignee?: string;
  dueDate?: string;
  priority?: Priority;

  // process / task 共通
  status?: string;

  [key: string]: unknown;
}

/** キャンバス上のカード（付箋・テキスト・プロセス・KPI・タスク） */
export interface BoardNode {
  id: string;
  type: NodeType;
  position: Position;
  size: Size;
  data: NodeData;
  style?: NodeStyle;
  createdAt: string;
  updatedAt: string;
}

/** カード同士の接続 */
export interface BoardEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: "arrow" | "line";
  createdAt: string;
}

/** 複数カードをまとめる枠 */
export interface BoardFrame {
  id: string;
  type: "frame";
  title: string;
  position: Position;
  size: Size;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

/** ボード全体 */
export interface Board {
  id: string;
  title: string;
  description?: string;
  templateType?: string;
  tags?: string[];
  nodes: BoardNode[];
  edges: BoardEdge[];
  frames: BoardFrame[];
  createdAt: string;
  updatedAt: string;
}

/** ボード一覧用の軽量メタ情報 */
export interface BoardMeta {
  id: string;
  title: string;
  templateType?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
