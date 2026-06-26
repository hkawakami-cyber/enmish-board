// ボード内容を Markdown へ変換する。そのまま議事録・提案資料に転用できる形を目指す。

import type { Board, BoardFrame, BoardNode } from "@/types/board";
import { downloadText, safeFileName } from "./download";

function nodeCenter(n: BoardNode) {
  return { x: n.position.x + n.size.width / 2, y: n.position.y + n.size.height / 2 };
}

function isInside(n: BoardNode, f: BoardFrame) {
  const c = nodeCenter(n);
  return (
    c.x >= f.position.x &&
    c.x <= f.position.x + f.size.width &&
    c.y >= f.position.y &&
    c.y <= f.position.y + f.size.height
  );
}

function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

/** タスク以外のノードを1行の箇条書きにする */
function nodeToBullet(n: BoardNode): string {
  const d = n.data;
  switch (n.type) {
    case "sticky": {
      const title = str(d.title);
      const body = str(d.body);
      if (title && body) return `- **${title}**: ${body}`;
      return `- ${title || body || "(空)"}`;
    }
    case "text": {
      const body = str(d.body);
      return body ? `- ${body}` : "";
    }
    case "process": {
      const parts: string[] = [];
      if (str(d.owner)) parts.push(`担当: ${str(d.owner)}`);
      if (str(d.input)) parts.push(`入力: ${str(d.input)}`);
      if (str(d.output)) parts.push(`出力: ${str(d.output)}`);
      if (str(d.issue)) parts.push(`課題: ${str(d.issue)}`);
      if (str(d.status)) parts.push(`状態: ${str(d.status)}`);
      const meta = parts.length ? `（${parts.join(" / ")}）` : "";
      return `- **${str(d.title) || "プロセス"}**${meta}`;
    }
    case "kpi": {
      const val = [str(d.value), str(d.unit)].filter(Boolean).join("");
      const tail = [val, str(d.formula) && `式: ${str(d.formula)}`].filter(Boolean).join(" / ");
      return `- **${str(d.name) || "KPI"}**${tail ? `: ${tail}` : ""}`;
    }
    default:
      return "";
  }
}

function tasksTable(tasks: BoardNode[]): string {
  if (tasks.length === 0) return "";
  const header = "| タスク | 担当 | 期限 | 優先度 | ステータス |\n|---|---|---|---|---|";
  const rows = tasks.map((t) => {
    const d = t.data;
    return `| ${str(d.title) || "(無題)"} | ${str(d.assignee) || "-"} | ${str(d.dueDate) || "-"} | ${str(d.priority) || "-"} | ${str(d.status) || "-"} |`;
  });
  return [header, ...rows].join("\n");
}

function renderGroup(nodes: BoardNode[]): string {
  const tasks = nodes.filter((n) => n.type === "task");
  const others = nodes.filter((n) => n.type !== "task");
  const lines: string[] = [];
  const bullets = others.map(nodeToBullet).filter(Boolean);
  if (bullets.length) lines.push(bullets.join("\n"));
  if (tasks.length) {
    if (lines.length) lines.push("");
    lines.push(tasksTable(tasks));
  }
  return lines.join("\n");
}

export function boardToMarkdown(board: Board): string {
  const lines: string[] = [];
  lines.push(`# Enmish ボード：${board.title}`);
  if (board.description) {
    lines.push("");
    lines.push(board.description);
  }

  // フレーム単位でグループ化
  const usedNodeIds = new Set<string>();
  const sortedFrames = [...board.frames].sort((a, b) => a.position.y - b.position.y);

  for (const frame of sortedFrames) {
    const inside = board.nodes.filter((n) => isInside(n, frame));
    inside.forEach((n) => usedNodeIds.add(n.id));
    lines.push("");
    lines.push(`## ${frame.title || "(無題フレーム)"}`);
    const body = renderGroup(inside);
    lines.push("");
    lines.push(body || "_（カードなし）_");
  }

  // どのフレームにも属さないカード
  const orphans = board.nodes.filter((n) => !usedNodeIds.has(n.id));
  if (orphans.length) {
    lines.push("");
    lines.push("## その他");
    lines.push("");
    lines.push(renderGroup(orphans));
  }

  lines.push("");
  return lines.join("\n");
}

export function exportBoardMarkdown(board: Board) {
  downloadText(`${safeFileName(board.title)}.md`, boardToMarkdown(board), "text/markdown");
}
